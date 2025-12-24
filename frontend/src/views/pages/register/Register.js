import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../../../assets/images/logo.png'
import { userAPI } from '../../../services/userService'
import { toast } from 'react-toastify'

const Register = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    tinNo: '',
    businessLicence: '',
    password: '',
    confirmPassword: '',
  })

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
      toast.error('Please fill in all required fields')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
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

      toast.success('Registration successful! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)'
    }}>
      {/* Main Content */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center py-4 px-3">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-11 col-md-10 col-lg-8 col-xl-7">
              <div className="card border-0 shadow-lg" style={{
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}>
                <div className="card-body p-4 p-sm-5">
                  {/* Logo Section */}
                  <div className="text-center mb-4">
                    <div className="mb-3" style={{
                      animation: 'fadeInDown 0.6s ease-out'
                    }}>
                      <img
                        src={logo}
                        alt="PowerComputers Logo"
                        className="img-fluid"
                        style={{
                          maxHeight: '100px',
                          height: 'auto',
                          width: 'auto',
                          maxWidth: '100%'
                        }}
                      />
                    </div>
                    <p className="text-muted mb-0" style={{
                      fontSize: '0.9rem',
                      fontWeight: '400'
                    }}>
                      Create your seller account to get started
                    </p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
                    {/* Full Name */}
                    <div className="mb-3">
                      <label htmlFor="fullName" className="form-label fw-semibold text-secondary" style={{ fontSize: '0.875rem' }}>
                        Full Name *
                      </label>
                      <div className="input-group shadow-sm" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                        <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '8px 0 0 8px' }}>
                          <span className="text-muted">👤</span>
                        </span>
                        <input
                          type="text"
                          id="fullName"
                          placeholder="Ex. John Doe"
                          className="form-control border-start-0"
                          style={{
                            fontSize: '0.95rem',
                            padding: '0.625rem 0.75rem'
                          }}
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Email and Phone Row */}
                    <div className="row">
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label htmlFor="email" className="form-label fw-semibold text-secondary" style={{ fontSize: '0.875rem' }}>
                            Email Address *
                          </label>
                          <div className="input-group shadow-sm" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                            <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '8px 0 0 8px' }}>
                              <span className="text-muted">✉️</span>
                            </span>
                            <input
                              type="email"
                              id="email"
                              placeholder="name@example.com"
                              className="form-control border-start-0"
                              style={{
                                fontSize: '0.95rem',
                                padding: '0.625rem 0.75rem'
                              }}
                              value={formData.email}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label htmlFor="phone" className="form-label fw-semibold text-secondary" style={{ fontSize: '0.875rem' }}>
                            Phone Number
                          </label>
                          <div className="input-group shadow-sm" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                            <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '8px 0 0 8px' }}>
                              <span className="text-muted">📞</span>
                            </span>
                            <input
                              type="tel"
                              id="phone"
                              placeholder="0700 000 000"
                              className="form-control border-start-0"
                              style={{
                                fontSize: '0.95rem',
                                padding: '0.625rem 0.75rem'
                              }}
                              value={formData.phone}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TIN and Business License Row */}
                    <div className="row">
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label htmlFor="tinNo" className="form-label fw-semibold text-secondary" style={{ fontSize: '0.875rem' }}>
                            TIN Number
                          </label>
                          <div className="input-group shadow-sm" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                            <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '8px 0 0 8px' }}>
                              <span className="text-muted">📄</span>
                            </span>
                            <input
                              type="text"
                              id="tinNo"
                              placeholder="TIN Number"
                              className="form-control border-start-0"
                              style={{
                                fontSize: '0.95rem',
                                padding: '0.625rem 0.75rem'
                              }}
                              value={formData.tinNo}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label htmlFor="businessLicence" className="form-label fw-semibold text-secondary" style={{ fontSize: '0.875rem' }}>
                            Business License No.
                          </label>
                          <div className="input-group shadow-sm" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                            <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '8px 0 0 8px' }}>
                              <span className="text-muted">📄</span>
                            </span>
                            <input
                              type="text"
                              id="businessLicence"
                              placeholder="License Number"
                              className="form-control border-start-0"
                              style={{
                                fontSize: '0.95rem',
                                padding: '0.625rem 0.75rem'
                              }}
                              value={formData.businessLicence}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Password Row */}
                    <div className="row">
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label htmlFor="password" className="form-label fw-semibold text-secondary" style={{ fontSize: '0.875rem' }}>
                            Password *
                          </label>
                          <div className="input-group shadow-sm" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                            <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '8px 0 0 8px' }}>
                              <span className="text-muted">🔒</span>
                            </span>
                            <input
                              type="password"
                              id="password"
                              placeholder="Create password (min 8 characters)"
                              className="form-control border-start-0"
                              style={{
                                fontSize: '0.95rem',
                                padding: '0.625rem 0.75rem'
                              }}
                              value={formData.password}
                              onChange={handleChange}
                              required
                              minLength={8}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label htmlFor="confirmPassword" className="form-label fw-semibold text-secondary" style={{ fontSize: '0.875rem' }}>
                            Confirm Password *
                          </label>
                          <div className="input-group shadow-sm" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                            <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '8px 0 0 8px' }}>
                              <span className="text-muted">🔒</span>
                            </span>
                            <input
                              type="password"
                              id="confirmPassword"
                              placeholder="Confirm password"
                              className="form-control border-start-0"
                              style={{
                                fontSize: '0.95rem',
                                padding: '0.625rem 0.75rem'
                              }}
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              required
                              minLength={8}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Register Button */}
                    <div className="d-grid gap-2 my-4">
                      <button
                        type="submit"
                        className="btn text-white fw-semibold shadow-sm"
                        style={{
                          backgroundColor: '#7da0c2',
                          borderColor: '#7da0c2',
                          padding: '0.75rem',
                          fontSize: '1rem',
                          borderRadius: '8px',
                          transition: 'all 0.3s ease',
                          transform: loading ? 'scale(0.98)' : 'scale(1)'
                        }}
                        onClick={handleRegister}
                        disabled={loading}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.currentTarget.style.backgroundColor = '#6a8fb0';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(125, 160, 194, 0.4)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.currentTarget.style.backgroundColor = '#7da0c2';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '';
                          }
                        }}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Creating Account...
                          </>
                        ) : 'Register as Seller'}
                      </button>
                    </div>

                    {/* Login Link */}
                    <div className="text-center">
                      <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                        Already have an account?{' '}
                      </span>
                      <Link
                        to="/login"
                        className="text-decoration-none fw-semibold"
                        style={{
                          fontSize: '0.9rem',
                          color: '#7da0c2',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#5a7fa2'}
                        onMouseLeave={(e) => e.target.style.color = '#7da0c2'}
                      >
                        Login
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 576px) {
          .card-body {
            padding: 1.5rem !important;
          }
        }

        /* Focus states for better accessibility */
        .form-control:focus {
          border-color: #7da0c2 !important;
          box-shadow: 0 0 0 0.2rem rgba(125, 160, 194, 0.25) !important;
        }

        /* Input group hover effect */
        .input-group:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
        }
      `}</style>
    </div>
  )
}

export default Register
