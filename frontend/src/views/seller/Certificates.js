import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { attachmentAPI } from '../../services/attachmentService'

// Helper to construct full URL for preview
const getFileUrl = (path) => {
    if (!path) return '';
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:9095';
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
        <div className="row">
            <div className="col-12">
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <strong>Certificates Attachments</strong>
                        <button className="btn btn-primary" onClick={handleCreate}>
                            <span className="me-2">➕</span>
                            Add Certificate
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Attachment Type</th>
                                        <th>Certificate Number</th>
                                        <th>Preview</th>
                                        <th>Status</th>
                                        <th>Created At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="text-center">
                                                <div className="spinner-border spinner-border-sm" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : certificates.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center">
                                                No certificates found
                                            </td>
                                        </tr>
                                    ) : (
                                        certificates.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.attachment_name}</td>
                                                <td>{item.certificate_number || '-'}</td>
                                                <td>
                                                    <a href={getFileUrl(item.file_path)} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-info text-white">
                                                        <span className="me-1">⬇️</span> Download/View
                                                    </a>
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${item.status === 'active' ? 'success' : 'secondary'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(item.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {modalVisible && (
                <>
                    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Upload Certificate</h5>
                                    <button type="button" className="btn-close" onClick={() => setModalVisible(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <form>
                                        <div className="mb-3">
                                            <label className="form-label">Attachment Type</label>
                                            <select
                                                className="form-select"
                                                value={formData.attach_type}
                                                onChange={(e) => setFormData({ ...formData, attach_type: e.target.value })}
                                            >
                                                <option value="">Select Type</option>
                                                {types.map((t) => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Certificate Number (Optional)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. 123456789"
                                                value={formData.certificate_number}
                                                onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">File</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                                            />
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setModalVisible(false)}>Cancel</button>
                                    <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitLoading}>
                                        {submitLoading ? <div className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">Loading...</span></div> : 'Upload'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </>
            )}
        </div>
    )
}

export default Certificates
