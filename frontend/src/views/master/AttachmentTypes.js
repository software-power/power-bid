import React, { useState, useEffect } from 'react'
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
        <div className="row">
            <div className="col-12">
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <strong>Attachment Types</strong>
                        <button className="btn btn-primary" onClick={handleCreate}>
                            <span className="me-2">➕</span>
                            Add Type
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Status</th>
                                        <th>Created At</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" className="text-center">
                                                <div className="spinner-border spinner-border-sm" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : types.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center">
                                                No attachment types found
                                            </td>
                                        </tr>
                                    ) : (
                                        types.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.name}</td>
                                                <td>
                                                    <span className={`badge bg-${item.status === 'active' ? 'success' : 'secondary'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(item.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <button
                                                        className={`btn btn-sm btn-${item.status === 'active' ? 'warning' : 'success'}`}
                                                        onClick={() => handleStatusToggle(item)}
                                                    >
                                                        {item.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </td>
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
                                    <h5 className="modal-title">Add Attachment Type</h5>
                                    <button type="button" className="btn-close" onClick={() => setModalVisible(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <form>
                                        <div className="mb-3">
                                            <label className="form-label">Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. TIN, BRELA, ISO"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Status</label>
                                            <select
                                                className="form-select"
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setModalVisible(false)}>Cancel</button>
                                    <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitLoading}>
                                        {submitLoading ? <div className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">Loading...</span></div> : 'Save'}
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

export default AttachmentTypes
