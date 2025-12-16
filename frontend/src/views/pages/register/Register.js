import React from 'react'
import { Link } from 'react-router-dom'
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
  CNavbar,
  CNavbarNav,
  CNavItem,
  CNavLink,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilHome,
  cilBriefcase,
  cilCommentBubble,
  cilUser,
  cilLockLocked,
  cilLowVision,
  cilAddressBook,
  cilPhone,
  cilLocationPin,
  cilFile,
  cilCloudUpload
} from '@coreui/icons'
import logo from '../../../assets/images/logo.png'

const Register = () => {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Top Navbar */}
      {/* <CNavbar colorScheme="light" className="bg-white border-bottom px-5 py-3">
        <CContainer fluid className="justify-content-end">
          <CNavbarNav className="d-flex flex-row align-items-center gap-4">
            <CNavItem>
              <CNavLink href="#" className="d-flex align-items-center text-secondary fw-semibold" style={{ fontSize: '0.9rem' }}>
                <CIcon icon={cilHome} className="me-2" /> HOME
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink href="#" className="d-flex align-items-center text-secondary fw-semibold" style={{ fontSize: '0.9rem' }}>
                <CIcon icon={cilBriefcase} className="me-2" /> VACANCIES
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink href="#" className="d-flex align-items-center text-secondary fw-semibold" style={{ fontSize: '0.9rem' }}>
                <CIcon icon={cilCommentBubble} className="me-2" /> FEEDBACK
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <CButton color="primary" className="px-4 fw-bold text-white d-flex align-items-center">
                  <CIcon icon={cilUser} className="me-2" /> LOGIN
                </CButton>
              </Link>
            </CNavItem>
          </CNavbarNav>
        </CContainer>
      </CNavbar> */}

      {/* Main Content */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={8} lg={6}>
              <CCard className="border-0 shadow-sm p-4">
                <CCardBody>
                  <div className="text-center mb-4">
                    <img src={logo} alt="Logo" height="80" className="mb-3" />
                    {/* <h3 className="fw-bold text-dark">Create Account</h3> */}
                    <p className="text-muted small">Provide your details to register</p>
                  </div>

                  <CForm>
                    <CRow>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel htmlFor="email" className="small text-muted fw-semibold">Email Address</CFormLabel>
                          <CInputGroup>
                            <CInputGroupText className="bg-transparent border-end-0">
                              <CIcon icon={cilAddressBook} className="text-muted" />
                            </CInputGroupText>
                            <CFormInput type="email" id="email" placeholder="Enter your email" className="border-start-0" />
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
                            <CFormInput type="tel" id="phone" placeholder="Enter phone number" className="border-start-0" />
                          </CInputGroup>
                        </div>
                      </CCol>
                    </CRow>

                    <div className="mb-3">
                      <CFormLabel htmlFor="address" className="small text-muted fw-semibold">Address</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText className="bg-transparent border-end-0">
                          <CIcon icon={cilLocationPin} className="text-muted" />
                        </CInputGroupText>
                        <CFormInput type="text" id="address" placeholder="Enter business address" className="border-start-0" />
                      </CInputGroup>
                    </div>

                    <CRow>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel htmlFor="tin" className="small text-muted fw-semibold">TIN Number</CFormLabel>
                          <CInputGroup>
                            <CInputGroupText className="bg-transparent border-end-0">
                              <CIcon icon={cilFile} className="text-muted" />
                            </CInputGroupText>
                            <CFormInput type="text" id="tin" placeholder="Enter TIN number" className="border-start-0" />
                          </CInputGroup>
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel htmlFor="certificate" className="small text-muted fw-semibold">Upload Certificate</CFormLabel>
                          <CInputGroup>
                            <CInputGroupText className="bg-transparent border-end-0">
                              <CIcon icon={cilCloudUpload} className="text-muted" />
                            </CInputGroupText>
                            <CFormInput type="file" id="certificate" className="border-start-0" />
                          </CInputGroup>
                        </div>
                      </CCol>
                    </CRow>

                    <div className="mb-3">
                      <CFormLabel htmlFor="license" className="small text-muted fw-semibold">Business License</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText className="bg-transparent border-end-0">
                          <CIcon icon={cilFile} className="text-muted" />
                        </CInputGroupText>
                        <CFormInput type="file" id="license" className="border-start-0" />
                      </CInputGroup>
                    </div>


                    <CRow>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel htmlFor="password" className="small text-muted fw-semibold">Password</CFormLabel>
                          <CInputGroup>
                            <CInputGroupText className="bg-transparent border-end-0">
                              <CIcon icon={cilLockLocked} className="text-muted" />
                            </CInputGroupText>
                            <CFormInput type="password" id="password" placeholder="Create password" className="border-start-0 border-end-0" />
                            <CInputGroupText className="bg-transparent border-start-0">
                              <CIcon icon={cilLowVision} className="text-muted" />
                            </CInputGroupText>
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
                            <CFormInput type="password" id="confirmPassword" placeholder="Confirm password" className="border-start-0 border-end-0" />
                            <CInputGroupText className="bg-transparent border-start-0">
                              <CIcon icon={cilLowVision} className="text-muted" />
                            </CInputGroupText>
                          </CInputGroup>
                        </div>
                      </CCol>
                    </CRow>

                    <div className="d-grid gap-2 my-4">
                      <CButton color="primary" className="py-2 text-white fw-semibold" style={{ backgroundColor: '#7da0c2', borderColor: '#7da0c2' }}>
                        Create Account
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
