import React, { useState, useEffect } from 'react'
import { userAPI } from '../../services/userService'
import { toast } from 'react-toastify'

const Users = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        tinNo: '',
        businessLicence: '',
        userType: '',
        password: '',
        confirmPassword: ''
    })

    useEffect(() => {
        const user = userAPI.getCurrentUser()
        setCurrentUser(user)
        fetchUsers(user)
    }, [])

    const fetchUsers = async (user) => {
        try {
            setLoading(true)
            let response
            if (user?.type === 'admin') {
                // Admin sees all
                response = await userAPI.getAllUsers()
            } else {
                // Buyer/Seller (OWNER of their account) sees their sub-accounts + themselves
                response = await userAPI.getSubAccounts()
            }
            setUsers(response.data || [])
        } catch (err) {
            console.error('Error fetching users:', err)
            toast.error(err.message || 'Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (user) => {
        setEditingUser(user)
        setFormData({
            fullName: user.full_name,
            email: user.email,
            phone: user.phone || '',
            tinNo: user.tin_no || '',
            businessLicence: user.business_licence || '',
            userType: user.type,
            password: '',
            confirmPassword: '',
            status: user.status
        })
        setModalVisible(true)
    }

    const handleCreate = () => {
        setEditingUser(null)
        setFormData({
            fullName: '',
            email: '',
            phone: '',
            tinNo: '',
            businessLicence: '',
            userType: currentUser?.type === 'admin' ? '' : currentUser?.type, // Admin chooses, others inherit
            password: '',
            confirmPassword: ''
        })
        setModalVisible(true)
    }

    const handleSubmit = async () => {
        if (!formData.fullName || !formData.email || (!editingUser && !formData.password)) {
            toast.error('Please fill in all required fields')
            return
        }

        if (currentUser?.type === 'admin' && !editingUser && !formData.userType) {
            toast.error('Please select a user type')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (formData.password && formData.password.length < 8) {
            toast.error('Password must be at least 8 characters long')
            return
        }

        try {
            setSubmitLoading(true)

            if (editingUser) {
                await userAPI.updateUser(editingUser.id, formData)
                toast.success('User updated successfully!')
            } else {
                if (currentUser?.type === 'admin') {
                    // Admin creates Main Accounts
                    await userAPI.register({
                        ...formData,
                        userType: formData.userType
                    })
                } else {
                    // Buyer/Seller creates Sub-Users
                    await userAPI.createSubUser({
                        ...formData,
                        roleId: 'USER' // Default role for sub-users
                    })
                }
                toast.success('User created successfully!')
            }

            setModalVisible(false)
            setEditingUser(null)
            fetchUsers(currentUser)
        } catch (err) {
            console.error('Operation error:', err)
            toast.error(err.message || 'Operation failed')
        } finally {
            setSubmitLoading(false)
        }
    }

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm) ||
        user.tin_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.business_licence?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="row">
            <div className="col-12">
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3 flex-grow-1">
                            <div className="input-group" style={{ maxWidth: '300px' }}>
                                <span className="input-group-text bg-white">
                                    <span role="img" aria-label="search">🔍</span>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={handleCreate}>
                            <span className="me-2">➕</span>
                            {currentUser?.type === 'admin' ? 'Register New Account' : 'Add User'}
                        </button>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead style={{ backgroundColor: '#f0f0f0' }}>
                                    <tr>
                                        <th>Full Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>TIN No</th>
                                        <th>Licence</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Created At</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="9" className="text-center py-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="text-center py-4">
                                                No users found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id}>
                                                <td>{user.full_name}</td>
                                                <td>{user.email}</td>
                                                <td>{user.phone || '-'}</td>
                                                <td>{user.tin_no || '-'}</td>
                                                <td>{user.business_licence || '-'}</td>
                                                <td>
                                                    <span className={`badge bg-${user.type === 'admin' ? 'danger' : user.type === 'seller' ? 'info text-dark' : 'primary'}`}>
                                                        {user.type?.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${user.status === 'active' ? 'success' : 'secondary'}`}>
                                                        {user.status?.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="text-center">
                                                    <button className="btn btn-sm btn-info text-white" onClick={() => handleEdit(user)}>
                                                        <span role="img" aria-label="edit">✎</span>
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
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{editingUser ? 'Edit User' : 'Add User'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setModalVisible(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <form>
                                        <div className="mb-3">
                                            <label className="form-label">Full Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. John Doe"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                placeholder="name@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Phone</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="0768 000 000"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">TIN Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="TIN Number"
                                                value={formData.tinNo}
                                                onChange={(e) => setFormData({ ...formData, tinNo: e.target.value })}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Business Licence</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Business Licence"
                                                value={formData.businessLicence}
                                                onChange={(e) => setFormData({ ...formData, businessLicence: e.target.value })}
                                            />
                                        </div>

                                        {currentUser?.type === 'admin' && (
                                            <div className="mb-3">
                                                <label className="form-label">User Type</label>
                                                <select
                                                    className="form-select"
                                                    value={formData.userType}
                                                    onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                                                    disabled={!!editingUser}
                                                >
                                                    <option value="">Select Type</option>
                                                    <option value="buyer">Buyer</option>
                                                    <option value="seller">Seller</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <label className="form-label">Password {editingUser && <span className="text-muted fw-normal">(Leave blank to keep current)</span>}</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Confirm Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                placeholder="••••••••"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            />
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setModalVisible(false)}>Cancel</button>
                                    <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitLoading}>
                                        {submitLoading ? <div className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">Loading...</span></div> : (editingUser ? 'Update User' : 'Create User')}
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

export default Users
