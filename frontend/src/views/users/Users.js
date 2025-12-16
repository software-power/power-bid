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
    CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilPlus, cilPencil, cilTrash, cilZoom, cilOptions, cilLockLocked, cilEnvelopeClosed, cilPhone, cilLocationPin, cilFile, cilCloudUpload, cilUser } from '@coreui/icons'
import { userAPI } from '../../services/userService'
import { toast } from 'react-toastify'

const Users = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    // Removed local error/success state for toast usage where applicable, keeping error for specific field validation if needed or generic error
    const [error, setError] = useState(null)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        tinNumber: '',
        userType: '',
        certificate: null,
        businessLicense: null,
        password: '',
        confirmPassword: ''
    })

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await userAPI.getAllUsers()
            setUsers(response.data || [])
        } catch (err) {
            console.error('Error fetching users:', err)
            toast.error(err.message || 'Failed to load users')
            setError(err.message || 'Failed to load users')
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
            address: user.address || '',
            tinNumber: user.tin_number || '',
            userType: user.type,
            certificate: null,
            businessLicense: null,
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
            address: '',
            tinNumber: '',
            userType: '',
            certificate: null,
            businessLicense: null,
            password: '',
            confirmPassword: ''
        })
        setModalVisible(true)
    }

    const handleSubmit = async () => {
        // Validation
        if (!formData.fullName || !formData.email || (!editingUser && !formData.password) || (!editingUser && !formData.userType)) {
            toast.error('Please fill in all required fields')
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
            setError(null)

            if (editingUser) {
                // Update existing user
                await userAPI.updateUser(editingUser.id, formData)
                toast.success('User updated successfully!')
            } else {
                // Register new user
                await userAPI.register(formData)
                toast.success('User registered successfully!')
            }

            setModalVisible(false)
            setEditingUser(null)

            // Reset form
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                address: '',
                tinNumber: '',
                userType: '',
                certificate: null,
                businessLicense: null,
                password: '',
                confirmPassword: ''
            })

            // Refresh users list
            fetchUsers()
        } catch (err) {
            console.error('Operation error:', err)
            toast.error(err.message || 'Operation failed')
        } finally {
            setSubmitLoading(false)
        }
    }

    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
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
                                    placeholder="Search by name, email or phone"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </CInputGroup>
                        </div>
                        <CButton
                            color="primary"
                            className="d-flex align-items-center gap-2"
                            onClick={handleCreate}
                        >
                            <CIcon icon={cilPlus} /> Register New User
                        </CButton>
                    </CCardHeader>
                    <CCardBody className="p-0">
                        <div className="table-responsive">
                            <CTable hover className="mb-0">
                                <CTableHead style={{ backgroundColor: '#f0f0f0' }}>
                                    <CTableRow>
                                        <CTableHeaderCell className="text-center">No.</CTableHeaderCell>
                                        <CTableHeaderCell>Full Name</CTableHeaderCell>
                                        <CTableHeaderCell>Email</CTableHeaderCell>
                                        <CTableHeaderCell>Phone</CTableHeaderCell>
                                        <CTableHeaderCell>Type</CTableHeaderCell>
                                        <CTableHeaderCell>Role</CTableHeaderCell>
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
                                                <div className="mt-2">Loading users...</div>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ) : filteredUsers.length === 0 ? (
                                        <CTableRow>
                                            <CTableDataCell colSpan="9" className="text-center py-4">
                                                No users found
                                            </CTableDataCell>
                                        </CTableRow>
                                    ) : (
                                        filteredUsers.map((user, index) => (
                                            <CTableRow key={user.id}>
                                                <CTableDataCell className="text-center">{index + 1}</CTableDataCell>
                                                <CTableDataCell>{user.full_name}</CTableDataCell>
                                                <CTableDataCell>{user.email}</CTableDataCell>
                                                <CTableDataCell>{user.phone || '-'}</CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadge color={user.type === 'admin' ? 'danger' : user.type === 'seller' ? 'info' : 'primary'}>
                                                        {user.type?.toUpperCase()}
                                                    </CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell>{user.role_id}</CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadge color={user.status === 'active' ? 'success' : user.status === 'inactive' ? 'secondary' : 'warning'} className="px-3 py-1">
                                                        {user.status?.toUpperCase()}
                                                    </CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                                                </CTableDataCell>
                                                <CTableDataCell className="text-center">
                                                    <div className="d-flex gap-2 justify-content-center">
                                                        <CButton
                                                            color="primary"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="rounded-circle p-2"
                                                            style={{ width: '32px', height: '32px' }}
                                                            title="View"
                                                        >
                                                            <CIcon icon={cilZoom} />
                                                        </CButton>
                                                        <CButton
                                                            color="info"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="rounded-circle p-2"
                                                            style={{ width: '32px', height: '32px' }}
                                                            title="Edit"
                                                            onClick={() => handleEdit(user)}
                                                        >
                                                            <CIcon icon={cilPencil} />
                                                        </CButton>
                                                        <CDropdown>
                                                            <CDropdownToggle
                                                                color="secondary"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="rounded-circle p-2"
                                                                style={{ width: '32px', height: '32px' }}
                                                            >
                                                                <CIcon icon={cilOptions} />
                                                            </CDropdownToggle>
                                                            <CDropdownMenu>
                                                                <CDropdownItem>Delete</CDropdownItem>
                                                                <CDropdownItem>Suspend</CDropdownItem>
                                                            </CDropdownMenu>
                                                        </CDropdown>
                                                    </div>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))
                                    )}
                                </CTableBody>
                            </CTable>
                        </div>

                        {/* Pagination Footer */}
                        <div className="d-flex justify-content-between align-items-center p-3 border-top">
                            <small className="text-muted">
                                Showing {filteredUsers.length} of {users.length} entries
                            </small>
                            <div className="d-flex gap-2 align-items-center">
                                <CButton size="sm" variant="outline" disabled>«</CButton>
                                <CButton size="sm" variant="outline" disabled>‹</CButton>
                                <CButton size="sm" color="primary">1</CButton>
                                <CButton size="sm" variant="outline" disabled>›</CButton>
                                <CButton size="sm" variant="outline" disabled>»</CButton>
                                <select className="form-select form-select-sm ms-2" style={{ width: 'auto' }}>
                                    <option>25</option>
                                    <option>50</option>
                                    <option>100</option>
                                </select>
                            </div>
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>

            {/* Registration Modal */}
            <CModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                size="lg"
                backdrop="static"
            >
                <CModalHeader>
                    <CModalTitle>{editingUser ? 'Edit User' : 'Register New User'}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <CRow className="mb-3">
                            <CCol md={12}>
                                <CFormLabel htmlFor="fullName">Full Name</CFormLabel>
                                <CInputGroup>
                                    <CInputGroupText className="bg-light">
                                        <CIcon icon={cilFile} />
                                    </CInputGroupText>
                                    <CFormInput
                                        id="fullName"
                                        placeholder="Enter full name"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </CInputGroup>
                            </CCol>
                        </CRow>

                        <CRow className="mb-3">
                            <CCol md={12}>
                                <CFormLabel htmlFor="userType">User Type</CFormLabel>
                                <CInputGroup>
                                    <CInputGroupText className="bg-light">
                                        <CIcon icon={cilUser} />
                                    </CInputGroupText>
                                    <CFormSelect
                                        id="userType"
                                        value={formData.userType}
                                        onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                                    >
                                        <option value="">Select user type</option>
                                        <option value="buyer">Buyer</option>
                                        <option value="seller">Seller</option>
                                        <option value="admin">Admin</option>
                                    </CFormSelect>
                                </CInputGroup>
                            </CCol>
                        </CRow>

                        <CRow className="mb-3">
                            <CCol md={6}>
                                <CFormLabel htmlFor="email">Email Address</CFormLabel>
                                <CInputGroup>
                                    <CInputGroupText className="bg-light">
                                        <CIcon icon={cilEnvelopeClosed} />
                                    </CInputGroupText>
                                    <CFormInput
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </CInputGroup>
                            </CCol>
                            <CCol md={6}>
                                <CFormLabel htmlFor="phone">Phone Number</CFormLabel>
                                <CInputGroup>
                                    <CInputGroupText className="bg-light">
                                        <CIcon icon={cilPhone} />
                                    </CInputGroupText>
                                    <CFormInput
                                        id="phone"
                                        placeholder="Enter phone number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </CInputGroup>
                            </CCol>
                        </CRow>

                        <CRow className="mb-3">
                            <CCol md={12}>
                                <CFormLabel htmlFor="address">Address</CFormLabel>
                                <CInputGroup>
                                    <CInputGroupText className="bg-light">
                                        <CIcon icon={cilLocationPin} />
                                    </CInputGroupText>
                                    <CFormInput
                                        id="address"
                                        placeholder="Enter business address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </CInputGroup>
                            </CCol>
                        </CRow>

                        <CRow className="mb-3">
                            <CCol md={6}>
                                <CFormLabel htmlFor="tinNumber">TIN Number</CFormLabel>
                                <CInputGroup>
                                    <CInputGroupText className="bg-light">
                                        <CIcon icon={cilFile} />
                                    </CInputGroupText>
                                    <CFormInput
                                        id="tinNumber"
                                        placeholder="Enter TIN number"
                                        value={formData.tinNumber}
                                        onChange={(e) => setFormData({ ...formData, tinNumber: e.target.value })}
                                    />
                                </CInputGroup>
                            </CCol>
                            <CCol md={6}>
                                <CFormLabel htmlFor="certificate">Upload Certificate</CFormLabel>
                                <CInputGroup>
                                    <CInputGroupText className="bg-light">
                                        <CIcon icon={cilCloudUpload} />
                                    </CInputGroupText>
                                    <CFormInput
                                        id="certificate"
                                        type="file"
                                        onChange={(e) => setFormData({ ...formData, certificate: e.target.files[0] })}
                                    />
                                </CInputGroup>
                                <small className="text-muted">
                                    {formData.certificate ? formData.certificate.name : 'No file chosen'}
                                </small>
                            </CCol>
                        </CRow>

                        <CRow className="mb-3">
                            <CCol md={12}>
                                <CFormLabel htmlFor="businessLicense">Business License</CFormLabel>
                                <CInputGroup>
                                    <CInputGroupText className="bg-light">
                                        <CIcon icon={cilCloudUpload} />
                                    </CInputGroupText>
                                    <CFormInput
                                        id="businessLicense"
                                        type="file"
                                        onChange={(e) => setFormData({ ...formData, businessLicense: e.target.files[0] })}
                                    />
                                </CInputGroup>
                                <small className="text-muted">
                                    {formData.businessLicense ? formData.businessLicense.name : 'No file chosen'}
                                </small>
                            </CCol>
                        </CRow>

                        <CRow className="mb-3">
                            <CCol md={6}>
                                <CFormLabel htmlFor="password">Password</CFormLabel>
                                <CInputGroup>
                                    <CInputGroupText className="bg-light">
                                        <CIcon icon={cilLockLocked} />
                                    </CInputGroupText>
                                    <CFormInput
                                        id="password"
                                        type="password"
                                        placeholder="Create password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </CInputGroup>
                            </CCol>
                            <CCol md={6}>
                                <CFormLabel htmlFor="confirmPassword">Confirm Password</CFormLabel>
                                <CInputGroup>
                                    <CInputGroupText className="bg-light">
                                        <CIcon icon={cilLockLocked} />
                                    </CInputGroupText>
                                    <CFormInput
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirm password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    />
                                </CInputGroup>
                            </CCol>
                        </CRow>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setModalVisible(false)} disabled={submitLoading}>
                        Cancel
                    </CButton>
                    <CButton color="primary" onClick={handleSubmit} disabled={submitLoading}>
                        {submitLoading ? (
                            <>
                                <CSpinner size="sm" className="me-2" />
                                {editingUser ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            editingUser ? 'Update User' : 'Create Account'
                        )}
                    </CButton>
                </CModalFooter>
            </CModal>
        </CRow>
    )
}

export default Users
