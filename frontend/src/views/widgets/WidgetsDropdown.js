import React from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { CRow, CCol, CCard, CCardBody } from '@coreui/react'
import { cilArrowRight, cilFile, cilBuilding, cilHome, cilClipboard } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const WidgetsDropdown = (props) => {
  const navigate = useNavigate()

  const widgets = [
    {
      title: 'Users',
      count: 1,
      icon: cilFile,
      iconColor: '#FF6B6B',
      iconBg: '#FFE5E5',
      route: '/users'
    },
    {
      title: 'Bids',
      count: 0,
      icon: cilClipboard,
      iconColor: '#4ECDC4',
      iconBg: '#E0F7F6',
      route: '/buttons/buttons'
    },
    {
      title: 'Bids',
      count: 0,
      icon: cilBuilding,
      iconColor: '#45B7D1',
      iconBg: '#E1F5FE',
      route: '/buttons/buttons'
    },
    {
      title: 'Bids',
      count: 0,
      icon: cilHome,
      iconColor: '#96CEB4',
      iconBg: '#E8F5E9',
      route: '/buttons/buttons'
    }
  ]

  return (
    <CRow className={props.className} xs={{ gutter: 3 }}>
      {widgets.map((widget, index) => (
        <CCol key={index} sm={6} lg={3}>
          <CCard className="border-0 shadow-sm">
            <CCardBody className="p-4">
              <div className="d-flex align-items-start justify-content-between mb-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded"
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: widget.iconBg
                  }}
                >
                  <CIcon
                    icon={widget.icon}
                    size="xl"
                    style={{ color: widget.iconColor }}
                  />
                </div>
                <div className="text-end">
                  <h3 className="mb-0 fw-bold">{widget.count}</h3>
                </div>
              </div>

              <h6 className="mb-3 text-dark fw-semibold">{widget.title}</h6>

              <div className="d-flex align-items-center justify-content-between">
                <small className="text-muted">
                  <span style={{ color: widget.applications > 0 ? '#FF6B6B' : '#6c757d' }}>{widget.applications}</span>
                </small>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(widget.route)
                  }}
                  className="text-decoration-none d-flex align-items-center"
                  style={{ color: '#4A90E2', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer' }}
                >
                  View <CIcon icon={cilArrowRight} size="sm" className="ms-1" />
                </a>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      ))}
    </CRow>
  )
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
}

export default WidgetsDropdown
