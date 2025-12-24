import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userAPI } from '../../services/userService'
import avatar8 from './../../assets/images/avatars/avata.png'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleLogout = (e) => {
    e.preventDefault()
    userAPI.logout()
    navigate('/login')
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button
        className="btn p-0 pe-0 d-flex align-items-center gap-2 border-0 bg-transparent"
        type="button"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
      >
        <img
          src={avatar8}
          alt="Avatar"
          className="rounded-circle"
          style={{ width: '40px', height: '40px' }}
        />
        <div className="d-flex flex-column text-start">
          <span className="fw-semibold small">{user?.full_name || 'User'}</span>
          <span className="text-muted small" style={{ fontSize: '0.75rem' }}>{user?.type || 'Guest'}</span>
        </div>
      </button>
      <ul className={`dropdown-menu dropdown-menu-end pt-0 ${isOpen ? 'show' : ''}`} style={{ position: 'absolute', right: 0 }}>
        <li><h6 className="dropdown-header bg-light fw-semibold mb-2">Account</h6></li>
        {/* <li>
          <a className="dropdown-item d-flex align-items-center" href="#">
            <span className="me-2">🔔</span>
            Updates
            <span className="badge bg-info ms-2">42</span>
          </a>
        </li>
        <li>
          <a className="dropdown-item d-flex align-items-center" href="#">
            <span className="me-2">📧</span>
            Messages
            <span className="badge bg-success ms-2">42</span>
          </a>
        </li>
        <li>
          <a className="dropdown-item d-flex align-items-center" href="#">
            <span className="me-2">📋</span>
            Tasks
            <span className="badge bg-danger ms-2">42</span>
          </a>
        </li>
        <li>
          <a className="dropdown-item d-flex align-items-center" href="#">
            <span className="me-2">💬</span>
            Comments
            <span className="badge bg-warning text-dark ms-2">42</span>
          </a>
        </li> */}
        <li><h6 className="dropdown-header bg-light fw-semibold my-2">Settings</h6></li>
        <li>
          <a className="dropdown-item d-flex align-items-center" href="#" onClick={(e) => { e.preventDefault(); navigate('/profile'); }}>
            <span className="me-2">👤</span>
            Profile
          </a>
        </li>
        {/* <li>
          <a className="dropdown-item d-flex align-items-center" href="#">
            <span className="me-2">⚙️</span>
            Settings
          </a>
        </li>
        <li>
          <a className="dropdown-item d-flex align-items-center" href="#">
            <span className="me-2">💳</span>
            Payments
            <span className="badge bg-secondary ms-2">42</span>
          </a>
        </li>
        <li>
          <a className="dropdown-item d-flex align-items-center" href="#">
            <span className="me-2">📁</span>
            Projects
            <span className="badge bg-primary ms-2">42</span>
          </a>
        </li> */}
        <li><hr className="dropdown-divider" /></li>
        <li>
          <a className="dropdown-item d-flex align-items-center" href="#" onClick={handleLogout}>
            <span className="me-2">🔒</span>
            Logout
          </a>
        </li>
      </ul>
    </div>
  )
}

export default AppHeaderDropdown
