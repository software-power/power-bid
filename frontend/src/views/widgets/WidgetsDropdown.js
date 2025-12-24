import React from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

const WidgetsDropdown = (props) => {
  const navigate = useNavigate()

  const widgets = [
    {
      title: 'Users',
      count: 1,
      icon: '📄',
      iconColor: '#FF6B6B',
      iconBg: '#FFE5E5',
      route: '/users'
    },
    {
      title: 'Bids',
      count: 0,
      icon: '📋',
      iconColor: '#4ECDC4',
      iconBg: '#E0F7F6',
      route: '/buttons/buttons'
    },
    {
      title: 'Bids',
      count: 0,
      icon: '🏢',
      iconColor: '#45B7D1',
      iconBg: '#E1F5FE',
      route: '/buttons/buttons'
    },
    {
      title: 'Bids',
      count: 0,
      icon: '🏠',
      iconColor: '#96CEB4',
      iconBg: '#E8F5E9',
      route: '/buttons/buttons'
    }
  ]

  return (
    <div className={`row ${props.className} g-3`}>
      {widgets.map((widget, index) => (
        <div key={index} className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex align-items-start justify-content-between mb-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded"
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: widget.iconBg,
                    fontSize: '1.5rem',
                    color: widget.iconColor
                  }}
                >
                  {widget.icon}
                </div>
                <div className="text-end">
                  <h3 className="mb-0 fw-bold">{widget.count}</h3>
                </div>
              </div>

              <h6 className="mb-3 text-dark fw-semibold">{widget.title}</h6>

              <div className="d-flex align-items-center justify-content-between">
                <small className="text-muted">
                  {/* widget.applications was undefined in original code, assumed 0 or missing */}
                  <span style={{ color: '#6c757d' }}></span>
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
                  View <span className="ms-1">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
}

export default WidgetsDropdown
