import React, { useState, useEffect } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CButton,
    CFormInput,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CForm,
    CFormLabel,
    CFormSelect,
    CSpinner,
    CBadge
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilCloudDownload } from '@coreui/icons'
import { toast } from 'react-toastify'
import { attachmentAPI } from '../../services/attachmentService'

// Helper to construct full URL for preview
const getFileUrl = (path) => {
    if (!path) return '';
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:9095';
    // Backend returns "public/uploads/..." usually. We need to make it accessible.
    // Assuming backend serves static files at /public
    // Our backend route for static is '/public' -> 'backend/public'.
    // If path stored in DB is 'public/uploads/filename.ext', then URL is 'API_BASE/public/uploads/filename.ext'?
    // Wait, path.replace(/\\/g, "/") done in backend.
    // If backend static maps '/public' to 'backend/public', and stored path is 'public/uploads/file', 
    // then 'http://host:port' + '/' + storedPath should work IF storedPath starts with 'public'.

    // In backend: app.use('/public', express.static(path.join(__dirname, 'public')));
    // DB stores: public/uploads/filename.ext (from multer default relative path?)
    // Actually multer dest is 'public/uploads/'. File path will be 'public\uploads\file.ext'.
    // Backend replaced backslashes.
    // So stored path: 'public/uploads/file.ext'.
    // API URL: http://localhost:9095/public/uploads/file.ext

    return `${API_BASE}/${path}`;
}

const Certificates = () => {
    const [certificates, setCertificates] = useState([])
    const [types, setTypes] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalVisible, setModalVisible] = useState(false)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [formData, setFormData] = useState({
        attach_type: '',
        certificate_number: '',
        file: null
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [certsRes, typesRes] = await Promise.all([
                attachmentAPI.getCertificates(),
                attachmentAPI.getTypes() // Assuming we see active types we can choose from
            ])
            setCertificates(certsRes.data || [])
            // Filter active types for dropdown
            setTypes((typesRes.data || []).filter(t => t.status === 'active'))
        } catch (err) {
            toast.error(err.message || 'Failed to fetch data')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setFormData({ attach_type: '', certificate_number: '', file: null })
        setModalVisible(true)
    }

    const handleSubmit = async () => {
        if (!formData.attach_type) {
            toast.error('Attachment Type is required')
            return
        }
        if (!formData.file) {
            toast.error('File is required')
            return
        }

        try {
            setSubmitLoading(true)
            const data = new FormData()
            data.append('attach_type', formData.attach_type)
            data.append('certificate_number', formData.certificate_number)
            data.append('file', formData.file)

            await attachmentAPI.uploadCertificate(data)
            toast.success('Certificate uploaded successfully')
            setModalVisible(false)
            fetchData() // Refresh list
        } catch (err) {
            toast.error(err.message || 'Upload failed')
        } finally {
            setSubmitLoading(false)
        }
    }

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                        <strong>Certificates Attachments</strong>
                        <CButton color="primary" onClick={handleCreate}>
                            <CIcon icon={cilPlus} className="me-2" />
                            Add Certificate
                        </CButton>
                    </CCardHeader>
                    <CCardBody>
                        <CTable hover>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Attachment Type</CTableHeaderCell>
                                    <CTableHeaderCell>Certificate Number</CTableHeaderCell>
                                    <CTableHeaderCell>Preview</CTableHeaderCell>
                                    <CTableHeaderCell>Status</CTableHeaderCell>
                                    <CTableHeaderCell>Created At</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {loading ? (
                                    <CTableRow>
                                        <CTableDataCell colSpan="5" className="text-center">
                                            <CSpinner size="sm" />
                                        </CTableDataCell>
                                    </CTableRow>
                                ) : certificates.length === 0 ? (
                                    <CTableRow>
                                        <CTableDataCell colSpan="5" className="text-center">
                                            No certificates found
                                        </CTableDataCell>
                                    </CTableRow>
                                ) : (
                                    certificates.map((item) => (
                                        <CTableRow key={item.id}>
                                            <CTableDataCell>{item.attachment_name}</CTableDataCell>
                                            <CTableDataCell>{item.certificate_number || '-'}</CTableDataCell>
                                            <CTableDataCell>
                                                <a href={getFileUrl(item.file_path)} target="_blank" rel="noopener noreferrer">
                                                    <CButton size="sm" color="info" variant="ghost">
                                                        <CIcon icon={cilCloudDownload} /> Download/View
                                                    </CButton>
                                                </a>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <CBadge color={item.status === 'active' ? 'success' : 'secondary'}>
                                                    {item.status}
                                                </CBadge>
                                            </CTableDataCell>
                                            <CTableDataCell>{new Date(item.created_at).toLocaleDateString()}</CTableDataCell>
                                        </CTableRow>
                                    ))
                                )}
                            </CTableBody>
                        </CTable>
                    </CCardBody>
                </CCard>
            </CCol>

            {/* Modal */}
            <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
                <CModalHeader>
                    <CModalTitle>Upload Certificate</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <div className="mb-3">
                            <CFormLabel>Attachment Type</CFormLabel>
                            <CFormSelect
                                value={formData.attach_type}
                                onChange={(e) => setFormData({ ...formData, attach_type: e.target.value })}
                            >
                                <option value="">Select Type</option>
                                {types.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </CFormSelect>
                        </div>
                        <div className="mb-3">
                            <CFormLabel>Certificate Number (Optional)</CFormLabel>
                            <CFormInput
                                placeholder="e.g. 123456789"
                                value={formData.certificate_number}
                                onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <CFormLabel>File</CFormLabel>
                            <CFormInput
                                type="file"
                                onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                            />
                        </div>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setModalVisible(false)}>Cancel</CButton>
                    <CButton color="primary" onClick={handleSubmit} disabled={submitLoading}>
                        {submitLoading ? <CSpinner size="sm" /> : 'Upload'}
                    </CButton>
                </CModalFooter>
            </CModal>
        </CRow>
    )
}

export default Certificates
