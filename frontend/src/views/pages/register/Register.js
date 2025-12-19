import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CRow,
  CToast,
  CToastBody,
  CToaster,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilAddressBook,
  cilLockLocked,
  cilPhone,
  cilFile,
  cilUser,
} from '@coreui/icons'
import logo from '../../../assets/images/logo.png'
import { userAPI } from '../../../services/userService'

const Register = () => {
  const navigate = useNavigate()
  const toaster = useRef()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(0)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    tinNo: '',
    businessLicence: '',
    password: '',
    confirmPassword: '',
  })

  const addToast = (message, color = 'danger') => {
    setToast(
      <CToast autohide={true} visible={true} color={color} className="text-white align-items-center">
        <div className="d-flex">
          <CToastBody>{message}</CToastBody>
        </div>
      </CToast>
    )
  }

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleRegister = async () => {
    const { fullName, email, phone, tinNo, businessLicence, password, confirmPassword } = formData

    if (!fullName || !email || !password || !confirmPassword) {
      addToast('Please fill in all required fields')
      return
    }

    if (password !== confirmPassword) {
      addToast('Passwords do not match')
      return
    }

    if (password.length < 8) {
      addToast('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      // Force userType to 'seller'
      await userAPI.register({
        fullName,
        email,
        phone,
        tinNo,
        businessLicence,
        password,
        userType: 'seller',
      })

      addToast('Registration successful! Redirecting to login...', 'success')
      setTimeout(() => navigate('/login'), 2000)
    } catch (error) {
      console.error('Registration error:', error)
      addToast(error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <CToaster ref={toaster} push={toast} placement="top-end" />

      <div className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={8} lg={6}>
              <CCard className="border-0 shadow-sm p-4">
                <CCardBody>
                  <div className="text-center mb-4">
                    <img src={logo} alt="Logo" height="80" className="mb-3" />
                    {/* <h3 className="fw-bold text-dark">Seller Registration</h3> */}
                    <p className="text-muted small">Create your seller account to get started</p>
                  </div>

                  <CForm>
                    <div className="mb-3">
                      <CFormLabel htmlFor="fullName" className="small text-muted fw-semibold">Full Name</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText className="bg-transparent border-end-0">
                          <CIcon icon={cilUser} className="text-muted" />
                        </CInputGroupText>
                        <CFormInput
                          type="text"
                          id="fullName"
                          placeholder="Ex. John Doe"
                          className="border-start-0"
                          value={formData.fullName}
                          onChange={handleChange}
                        />
                      </CInputGroup>
                    </div>

                    <CRow>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel htmlFor="email" className="small text-muted fw-semibold">Email Address</CFormLabel>
                          <CInputGroup>
                            <CInputGroupText className="bg-transparent border-end-0">
                              <CIcon icon={cilAddressBook} className="text-muted" />
                            </CInputGroupText>
                            <CFormInput
                              type="email"
                              id="email"
                              placeholder="name@example.com"
                              className="border-start-0"
                              value={formData.email}
                              onChange={handleChange}
                            />
                          </CInputGroup>
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel htmlFor="phone" className="small text-muted fw-semibold">Phone Number</CFormLabel>
                          <CInputGroup>
                            <CInputGroupText className="bg-transparent border-end-0">
                              <CIcon icon={cilPhone} className="text-muted" />
                            </CInputGroupText>
                            <CFormInput
                              type="tel"
                              id="phone"
                              placeholder="0700 000 000"
                              className="border-start-0"
                              value={formData.phone}
                              onChange={handleChange}
                            />
                          </CInputGroup>
                        </div>
                      </CCol>
                    </CRow>

                    <CRow>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel htmlFor="tinNo" className="small text-muted fw-semibold">TIN Number</CFormLabel>
                          <CInputGroup>
                            <CInputGroupText className="bg-transparent border-end-0">
                              <CIcon icon={cilFile} className="text-muted" />
                            </CInputGroupText>
                            <CFormInput
                              type="text"
                              id="tinNo"
                              placeholder="TIN Number"
                              className="border-start-0"
                              value={formData.tinNo}
                              onChange={handleChange}
                            />
                          </CInputGroup>
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel htmlFor="businessLicence" className="small text-muted fw-semibold">Business License No.</CFormLabel>
                          <CInputGroup>
                            <CInputGroupText className="bg-transparent border-end-0">
                              <CIcon icon={cilFile} className="text-muted" />
                            </CInputGroupText>
                            <CFormInput
                              type="text"
                              id="businessLicence"
                              placeholder="License Number"
                              className="border-start-0"
                              value={formData.businessLicence}
                              onChange={handleChange}
                            />
                          </CInputGroup>
                        </div>
                      </CCol>
                    </CRow>

                    <CRow>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel htmlFor="password" className="small text-muted fw-semibold">Password</CFormLabel>
                          <CInputGroup>
                            <CInputGroupText className="bg-transparent border-end-0">
                              <CIcon icon={cilLockLocked} className="text-muted" />
                            </CInputGroupText>
                            <CFormInput
                              type="password"
                              id="password"
                              placeholder="Create password"
                              className="border-start-0"
                              value={formData.password}
                              onChange={handleChange}
                            />
                          </CInputGroup>
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel htmlFor="confirmPassword" className="small text-muted fw-semibold">Confirm Password</CFormLabel>
                          <CInputGroup>
                            <CInputGroupText className="bg-transparent border-end-0">
                              <CIcon icon={cilLockLocked} className="text-muted" />
                            </CInputGroupText>
                            <CFormInput
                              type="password"
                              id="confirmPassword"
                              placeholder="Confirm password"
                              className="border-start-0"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                            />
                          </CInputGroup>
                        </div>
                      </CCol>
                    </CRow>

                    <div className="d-grid gap-2 my-4">
                      <CButton
                        color="primary"
                        className="py-2 text-white fw-semibold"
                        style={{ backgroundColor: '#7da0c2', borderColor: '#7da0c2' }}
                        onClick={handleRegister}
                        disabled={loading}
                      >
                        {loading ? 'Creating Account...' : 'Register as Seller'}
                      </CButton>
                    </div>

                    <div className="text-center small text-muted">
                      Already have an account? <Link to="/login" style={{ textDecoration: 'none', fontWeight: '600' }}>Login</Link>
                    </div>

                  </CForm>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CContainer>
      </div>
    </div>
  )
}

export default Register
