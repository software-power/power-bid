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
    CInputGroup,
    CInputGroupText,
    CBadge,
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CForm,
    CFormLabel,
    CFormSelect,
    CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilPlus, cilPencil, cilZoom, cilOptions, cilLockLocked, cilEnvelopeClosed, cilPhone, cilUser } from '@coreui/icons'
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
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3 flex-grow-1">
                            <CInputGroup style={{ maxWidth: '300px' }}>
                                <CInputGroupText className="bg-white">
                                    <CIcon icon={cilSearch} />
                                </CInputGroupText>
                                <CFormInput
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </CInputGroup>
                        </div>
                        <CButton color="primary" onClick={handleCreate}>
                            <CIcon icon={cilPlus} className="me-2" />
                            {currentUser?.type === 'admin' ? 'Register New Account' : 'Add User'}
                        </CButton>
                    </CCardHeader>
                    <CCardBody className="p-0">
                        <div className="table-responsive">
                            <CTable hover className="mb-0">
                                <CTableHead style={{ backgroundColor: '#f0f0f0' }}>
                                    <CTableRow>
                                        <CTableHeaderCell>Full Name</CTableHeaderCell>
                                        <CTableHeaderCell>Email</CTableHeaderCell>
                                        <CTableHeaderCell>Phone</CTableHeaderCell>
                                        <CTableHeaderCell>TIN No</CTableHeaderCell>
                                        <CTableHeaderCell>Licence</CTableHeaderCell>
                                        <CTableHeaderCell>Type</CTableHeaderCell>
                                        <CTableHeaderCell>Status</CTableHeaderCell>
                                        <CTableHeaderCell>Created At</CTableHeaderCell>
                                        <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {loading ? (
                                        <CTableRow>
                                            <CTableDataCell colSpan="9" className="text-center py-4">
                                                <CSpinner color="primary" />
                                            </CTableDataCell>
                                        </CTableRow>
                                    ) : filteredUsers.length === 0 ? (
                                        <CTableRow>
                                            <CTableDataCell colSpan="9" className="text-center py-4">
                                                No users found
                                            </CTableDataCell>
                                        </CTableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <CTableRow key={user.id}>
                                                <CTableDataCell>{user.full_name}</CTableDataCell>
                                                <CTableDataCell>{user.email}</CTableDataCell>
                                                <CTableDataCell>{user.phone || '-'}</CTableDataCell>
                                                <CTableDataCell>{user.tin_no || '-'}</CTableDataCell>
                                                <CTableDataCell>{user.business_licence || '-'}</CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadge color={user.type === 'admin' ? 'danger' : user.type === 'seller' ? 'info' : 'primary'}>
                                                        {user.type?.toUpperCase()}
                                                    </CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadge color={user.status === 'active' ? 'success' : 'secondary'}>
                                                        {user.status?.toUpperCase()}
                                                    </CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                                                </CTableDataCell>
                                                <CTableDataCell className="text-center">
                                                    <CButton color="info" variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                                                        <CIcon icon={cilPencil} />
                                                    </CButton>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))
                                    )}
                                </CTableBody>
                            </CTable>
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>

            <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static" size="lg">
                <CModalHeader>
                    <CModalTitle>{editingUser ? 'Edit User' : 'Add User'}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm className="modal-form-grid">
                        <div className="mb-3">
                            <CFormLabel>Full Name</CFormLabel>
                            <CFormInput
                                placeholder="e.g. John Doe"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <CFormLabel>Email</CFormLabel>
                            <CFormInput
                                type="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="mb-3">
                            <CFormLabel>Phone</CFormLabel>
                            <CFormInput
                                placeholder="0768 000 000"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="mb-3">
                            <CFormLabel>TIN Number</CFormLabel>
                            <CFormInput
                                placeholder="TIN Number"
                                value={formData.tinNo}
                                onChange={(e) => setFormData({ ...formData, tinNo: e.target.value })}
                            />
                        </div>

                        <div className="mb-3">
                            <CFormLabel>Business Licence</CFormLabel>
                            <CFormInput
                                placeholder="Business Licence"
                                value={formData.businessLicence}
                                onChange={(e) => setFormData({ ...formData, businessLicence: e.target.value })}
                            />
                        </div>

                        {currentUser?.type === 'admin' && (
                            <div className="mb-3">
                                <CFormLabel>User Type</CFormLabel>
                                <CFormSelect
                                    value={formData.userType}
                                    onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                                    disabled={!!editingUser}
                                >
                                    <option value="">Select Type</option>
                                    <option value="buyer">Buyer</option>
                                    <option value="seller">Seller</option>
                                    <option value="admin">Admin</option>
                                </CFormSelect>
                            </div>
                        )}

                        <div className="mb-3">
                            <CFormLabel>Password {editingUser && <span className="text-muted fw-normal">(Leave blank to keep current)</span>}</CFormLabel>
                            <CFormInput
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <CFormLabel>Confirm Password</CFormLabel>
                            <CFormInput
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" variant="outline" onClick={() => setModalVisible(false)}>Cancel</CButton>
                    <CButton color="primary" onClick={handleSubmit} disabled={submitLoading}>
                        {submitLoading ? <CSpinner size="sm" /> : (editingUser ? 'Update User' : 'Create User')}
                    </CButton>
                </CModalFooter>
            </CModal>
        </CRow>
    )
}

export default Users
