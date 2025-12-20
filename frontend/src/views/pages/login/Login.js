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
import { cilLockLocked, cilLowVision, cilAddressBook } from '@coreui/icons'
import { userAPI } from '../../../services/userService'

const cilEye = ["512 512", "<path class='ci-primary' d='M256,64C140.552,64,42.32,156.402,10.666,218.062 c-3.928,7.662-3.928,16.214,0,23.876C42.32,303.598,140.552,396,256,396c115.448,0,213.68-92.402,245.334-154.062 c3.928-7.662,3.928-16.214,0-23.876C469.68,156.402,371.448,64,256,64z M256,356c-99.256,0-196.406-82.532-232.022-135.5 c35.616-52.968,132.766-135.5,232.022-135.5c99.256,0,196.406,82.532,232.022,135.5C452.406,273.468,355.256,356,256,356z M256,120 c-61.856,0-112,50.144-112,112s50.144,112,112,112s112-50.144,112-112S317.856,120,256,120z M256,304c-44.183,0-80-35.817-80-80 s35.817-80,80-80s80,35.817,80,80S300.183,304,256,304z'/>"]
import logo from '../../../assets/images/logo.png'

const Login = () => {
  const navigate = useNavigate()
  // Default credentials as requested
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const toaster = useRef()

  const addToast = (errorMessage) => {
    setToast(
      <CToast autohide={true} visible={true} color="danger" className="text-white align-items-center">
        <div className="d-flex">
          <CToastBody>{errorMessage}</CToastBody>
        </div>
      </CToast>
    )
  }

  const userLogin = async () => {
    if (!email || !password) {
      addToast('Please enter both email and password')
      return
    }

    setLoading(true)
    try {
      const response = await userAPI.login(email, password)

      if (response.status === 'success') {
        // Token and user data are already stored in userService.js
        // Navigate to dashboard
        navigate('/dashboard')
      } else {
        addToast(response.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      addToast(error.message || 'Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const forgetPassword = () => {
    // Placeholder for forgot password logic
    console.log("Forgot password clicked")
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <CToaster ref={toaster} push={toast} placement="top-end" />

      {/* Main Content */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center">
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={5}>
              <CCard className="border-0 shadow-sm p-4">
                <CCardBody>
                  <div className="text-center mb-4">
                    <img src={logo} alt="Logo" height="80" className="mb-3" />

                    <p className="text-muted small">Provide your email and password to login</p>
                  </div>

                  <CForm>
                    <div className="mb-3">
                      <CFormLabel htmlFor="email" className="small text-muted fw-semibold">Email Address</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText className="bg-transparent border-end-0">
                          <CIcon icon={cilAddressBook} className="text-muted" />
                        </CInputGroupText>
                        <CFormInput
                          type="email"
                          id="email"
                          placeholder="Enter your email"
                          autoComplete="username"
                          className="border-start-0"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </CInputGroup>
                    </div>

                    <div className="mb-3">
                      <CFormLabel htmlFor="password" className="small text-muted fw-semibold">Password</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText className="bg-transparent border-end-0">
                          <CIcon icon={cilLockLocked} className="text-muted" />
                        </CInputGroupText>
                        <CFormInput
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          placeholder="Enter password"
                          autoComplete="current-password"
                          className="border-start-0 border-end-0"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <CInputGroupText
                          className="bg-transparent border-start-0"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <CIcon icon={showPassword ? cilEye : cilLowVision} className="text-muted" />
                        </CInputGroupText>
                      </CInputGroup>
                    </div>

                    <div className="d-flex justify-content-end mb-4">
                      <Link to="/forgot-password" onClick={forgetPassword} style={{ textDecoration: 'none', fontSize: '0.85rem' }}>
                        Forgot Password?
                      </Link>
                    </div>

                    <div className="d-grid gap-2 mb-3">
                      <CButton
                        color="primary"
                        className="py-2 text-white fw-semibold"
                        style={{ backgroundColor: '#7da0c2', borderColor: '#7da0c2' }}
                        onClick={userLogin}
                        disabled={loading}
                      >
                        {loading ? 'Logging in...' : 'Login'}
                      </CButton>
                    </div>

                    <div className="text-center small text-muted">
                      Don't have an account? <Link to="/register" style={{ textDecoration: 'none', fontWeight: '600' }}>Register Now</Link>
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

export default Login
