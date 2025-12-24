import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userAPI } from '../../../services/userService'
import { toast } from 'react-toastify'
import logo from '../../../assets/images/logo.png'

const Login = () => {
  const navigate = useNavigate()
  // Default credentials as requested
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const userLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter both email and password')
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
        toast.error(response.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || 'Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const forgetPassword = () => {
    // Placeholder for forgot password logic
    console.log("Forgot password clicked")
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)'
    }}>
      {/* Main Content */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center py-4 px-3">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
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
                      Provide your email and password to login
                    </p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); userLogin(); }}>
                    {/* Email Input */}
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label fw-semibold text-secondary" style={{ fontSize: '0.875rem' }}>
                        Email Address
                      </label>
                      <div className="input-group shadow-sm" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                        <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '8px 0 0 8px' }}>
                          <span className="text-muted">✉️</span>
                        </span>
                        <input
                          type="email"
                          id="email"
                          placeholder="Enter your email"
                          autoComplete="username"
                          className="form-control border-start-0 border-end-0"
                          style={{
                            fontSize: '0.95rem',
                            padding: '0.625rem 0.75rem'
                          }}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label fw-semibold text-secondary" style={{ fontSize: '0.875rem' }}>
                        Password
                      </label>
                      <div className="input-group shadow-sm" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                        <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '8px 0 0 8px' }}>
                          <span className="text-muted">🔒</span>
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          placeholder="Enter password"
                          autoComplete="current-password"
                          className="form-control border-start-0 border-end-0"
                          style={{
                            fontSize: '0.95rem',
                            padding: '0.625rem 0.75rem'
                          }}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              userLogin();
                            }
                          }}
                          required
                        />
                        <span
                          className="input-group-text bg-white border-start-0"
                          style={{
                            cursor: 'pointer',
                            borderRadius: '0 8px 8px 0',
                            transition: 'background-color 0.2s ease'
                          }}
                          onClick={() => setShowPassword(!showPassword)}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <span className="text-muted">{showPassword ? '👁️' : '🙈'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="d-flex justify-content-end mb-4">
                      <Link
                        to="/forgot-password"
                        onClick={forgetPassword}
                        className="text-decoration-none"
                        style={{
                          fontSize: '0.875rem',
                          color: '#7da0c2',
                          fontWeight: '500',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#5a7fa2'}
                        onMouseLeave={(e) => e.target.style.color = '#7da0c2'}
                      >
                        Forgot Password?
                      </Link>
                    </div>

                    {/* Login Button */}
                    <div className="d-grid gap-2 mb-4">
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
                        onClick={userLogin}
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
                            Logging in...
                          </>
                        ) : 'Login'}
                      </button>
                    </div>

                    {/* Register Link */}
                    <div className="text-center">
                      <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                        Don't have an account?{' '}
                      </span>
                      <Link
                        to="/register"
                        className="text-decoration-none fw-semibold"
                        style={{
                          fontSize: '0.9rem',
                          color: '#7da0c2',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#5a7fa2'}
                        onMouseLeave={(e) => e.target.style.color = '#7da0c2'}
                      >
                        Register Now
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

export default Login
