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
import { cilPlus, cilPencil } from '@coreui/icons'
import { toast } from 'react-toastify'
import { attachmentAPI } from '../../services/attachmentService'

const AttachmentTypes = () => {
    const [types, setTypes] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalVisible, setModalVisible] = useState(false)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [formData, setFormData] = useState({ name: '', status: 'active' })

    useEffect(() => {
        fetchTypes()
    }, [])

    const fetchTypes = async () => {
        try {
            setLoading(true)
            const response = await attachmentAPI.getTypes()
            setTypes(response.data || [])
        } catch (err) {
            toast.error(err.message || 'Failed to fetch attachment types')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setFormData({ name: '', status: 'active' })
        setModalVisible(true)
    }

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error('Name is required')
            return
        }

        try {
            setSubmitLoading(true)
            await attachmentAPI.createType(formData)
            toast.success('Attachment type created successfully')
            setModalVisible(false)
            fetchTypes()
        } catch (err) {
            toast.error(err.message || 'Failed to create attachment type')
        } finally {
            setSubmitLoading(false)
        }
    }

    const handleStatusToggle = async (item) => {
        const newStatus = item.status === 'active' ? 'inactive' : 'active'
        try {
            await attachmentAPI.updateTypeStatus(item.id, newStatus)
            fetchTypes() // Refresh
        } catch (err) {
            toast.error(err.message || 'Failed to update status')
        }
    }

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                        <strong>Attachment Types</strong>
                        <CButton color="primary" onClick={handleCreate}>
                            <CIcon icon={cilPlus} className="me-2" />
                            Add Type
                        </CButton>
                    </CCardHeader>
                    <CCardBody>
                        <CTable hover>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Name</CTableHeaderCell>
                                    <CTableHeaderCell>Status</CTableHeaderCell>
                                    <CTableHeaderCell>Created At</CTableHeaderCell>
                                    <CTableHeaderCell>Actions</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {loading ? (
                                    <CTableRow>
                                        <CTableDataCell colSpan="4" className="text-center">
                                            <CSpinner size="sm" />
                                        </CTableDataCell>
                                    </CTableRow>
                                ) : types.length === 0 ? (
                                    <CTableRow>
                                        <CTableDataCell colSpan="4" className="text-center">
                                            No attachment types found
                                        </CTableDataCell>
                                    </CTableRow>
                                ) : (
                                    types.map((item) => (
                                        <CTableRow key={item.id}>
                                            <CTableDataCell>{item.name}</CTableDataCell>
                                            <CTableDataCell>
                                                <CBadge color={item.status === 'active' ? 'success' : 'secondary'}>
                                                    {item.status}
                                                </CBadge>
                                            </CTableDataCell>
                                            <CTableDataCell>{new Date(item.created_at).toLocaleDateString()}</CTableDataCell>
                                            <CTableDataCell>
                                                <CButton
                                                    color={item.status === 'active' ? 'warning' : 'success'}
                                                    size="sm"
                                                    onClick={() => handleStatusToggle(item)}
                                                >
                                                    {item.status === 'active' ? 'Deactivate' : 'Activate'}
                                                </CButton>
                                            </CTableDataCell>
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
                    <CModalTitle>Add Attachment Type</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <div className="mb-3">
                            <CFormLabel>Name</CFormLabel>
                            <CFormInput
                                placeholder="e.g. TIN, BRELA, ISO"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <CFormLabel>Status</CFormLabel>
                            <CFormSelect
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </CFormSelect>
                        </div>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setModalVisible(false)}>Cancel</CButton>
                    <CButton color="primary" onClick={handleSubmit} disabled={submitLoading}>
                        {submitLoading ? <CSpinner size="sm" /> : 'Save'}
                    </CButton>
                </CModalFooter>
            </CModal>
        </CRow>
    )
}

export default AttachmentTypes
