import React, { useEffect, useRef, useState } from 'react'
import { AppHeaderDropdown } from './header/index'
import { AppHeaderNav } from './AppHeaderNav'
import navigation from '../_nav'
import logo from '../assets/images/logo.png'

const AppHeader = () => {
  const headerRef = useRef()
  const [colorMode, setColorMode] = useState('light') // Default to light, or read from localStorage if you want persistence
  const [themeOpen, setThemeOpen] = useState(false)
  const themeDropdownRef = useRef(null)

  // Handlers for theme specific logic if needed (e.g. document attribute)
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', colorMode)
  }, [colorMode])

  useEffect(() => {
    const handleScroll = () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    }

    const handleClickOutside = (event) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
        setThemeOpen(false)
      }
    }

    document.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="header mb-4 p-0 shadow-none border-0 sticky-top bg-white" ref={headerRef} style={{ zIndex: 1030 }}>
      {/* Row 1: Branding and User Actions */}
      <div className="container-fluid border-bottom px-4 py-2 bg-white d-flex justify-content-between align-items-center">
        {/* Branding */}
        <div className="d-flex align-items-center">
          <img src={logo} alt="Power Computers" height={40} />
        </div>

        {/* User Actions */}
        <div className="d-flex align-items-center gap-3">
          {/* Version Badge */}
          <span className="text-secondary small d-none d-md-block">The token is not compatible with this server, please contact powercomputer</span>
          <span className="badge bg-danger ms-2">Ver 1.0.0</span>

          <div className="vr h-100 mx-2 text-body text-opacity-75"></div>

          {/* Fullscreen Toggle / Bell (Placeholder) */}
          <span role="button" className="text-secondary fs-5" aria-label="Notifications">🔔</span>

          {/* Theme Toggle */}
          <div className="dropdown" ref={themeDropdownRef}>
            <button
              className="btn p-0 d-flex align-items-center border-0 bg-transparent"
              type="button"
              onClick={() => setThemeOpen(!themeOpen)}
              aria-expanded={themeOpen}
            >
              <span className="fs-5 text-secondary">
                {colorMode === 'dark' ? '🌙' : colorMode === 'auto' ? '🌗' : '☀️'}
              </span>
            </button>
            <ul className={`dropdown-menu dropdown-menu-end ${themeOpen ? 'show' : ''}`} style={{ position: 'absolute', right: 0 }}>
              <li>
                <button
                  className={`dropdown-item d-flex align-items-center ${colorMode === 'light' ? 'active' : ''}`}
                  type="button"
                  onClick={() => { setColorMode('light'); setThemeOpen(false); }}
                >
                  <span className="me-2">☀️</span> Light
                </button>
              </li>
              <li>
                <button
                  className={`dropdown-item d-flex align-items-center ${colorMode === 'dark' ? 'active' : ''}`}
                  type="button"
                  onClick={() => { setColorMode('dark'); setThemeOpen(false); }}
                >
                  <span className="me-2">🌙</span> Dark
                </button>
              </li>
              <li>
                <button
                  className={`dropdown-item d-flex align-items-center ${colorMode === 'auto' ? 'active' : ''}`}
                  type="button"
                  onClick={() => { setColorMode('auto'); setThemeOpen(false); }}
                >
                  <span className="me-2">🌗</span> Auto
                </button>
              </li>
            </ul>
          </div>

          {/* Profile Dropdown */}
          <AppHeaderDropdown />
        </div>
      </div>

      {/* Row 2: Navigation Menu */}
      <div className="container-fluid px-4 py-2 border-bottom bg-white d-none d-md-flex">
        <div className="w-100">
          <AppHeaderNav items={(() => {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : {};
            const role = user.type || '';

            return navigation.filter(item => {
              if (role === 'admin') return true;

              if (role === 'buyer') {
                return item.name !== 'Admin' && item.name !== 'Seller';
              }

              if (role === 'seller') {
                return item.name !== 'Admin' && item.name !== 'Buyer';
              }

              // Default/Unknown: Hide specific role menus, show common
              return item.name !== 'Admin' && item.name !== 'Seller' && item.name !== 'Buyer';
            });
          })()} />
        </div>
      </div>

    </header>
  )
}

export default AppHeader
