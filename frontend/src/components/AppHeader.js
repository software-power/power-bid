import React, { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  useColorModes,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilContrast,
  cilEnvelopeOpen,
  cilList,
  cilMenu,
  cilMoon,
  cilSun,
} from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import { AppHeaderNav } from './AppHeaderNav'
import navigation from '../_nav'
import logo from '../assets/images/logo.png'

const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  // Sidebar controls removed as sidebar is deprecated

  useEffect(() => {
    const handleScroll = () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    }

    document.addEventListener('scroll', handleScroll)
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <CHeader position="static" className="mb-4 p-0 shadow-none border-0" ref={headerRef} style={{ zIndex: 1030 }}>
      {/* Row 1: Branding and User Actions */}
      <CContainer fluid className="border-bottom px-4 py-2 bg-white d-flex justify-content-between align-items-center">
        {/* Branding */}
        <div className="d-flex align-items-center">
          <img src={logo} alt="Power Computers" height={40} />
        </div>

        {/* User Actions */}
        <div className="d-flex align-items-center gap-3">
          {/* Version Badge */}
          <span className="text-secondary small d-none d-md-block">The token is not compatible with this server, please contact powercomputer</span>
          <CBadge color="danger" className="ms-2">Ver 1.0.0</CBadge>

          <div className="vr h-100 mx-2 text-body text-opacity-75"></div>

          {/* Fullscreen Toggle (Placeholder) */}
          <CIcon icon={cilBell} size="lg" className="text-secondary pointer" />

          {/* Theme Toggle */}
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false} className="d-flex align-items-center">
              {colorMode === 'dark' ? (
                <CIcon icon={cilMoon} size="lg" />
              ) : colorMode === 'auto' ? (
                <CIcon icon={cilContrast} size="lg" />
              ) : (
                <CIcon icon={cilSun} size="lg" />
              )}
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem
                active={colorMode === 'light'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('light')}
              >
                <CIcon className="me-2" icon={cilSun} size="lg" /> Light
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'dark'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('dark')}
              >
                <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'auto'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('auto')}
              >
                <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>

          {/* Profile Dropdown */}
          <AppHeaderDropdown />
        </div>
      </CContainer>

      {/* Row 2: Navigation Menu */}
      <CContainer fluid className="px-4 py-2 border-bottom bg-white d-none d-md-flex">
        <CHeaderNav className="w-100">
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
        </CHeaderNav>
      </CContainer>

    </CHeader>
  )
}

export default AppHeader
