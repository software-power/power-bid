import React from 'react'
import PropTypes from 'prop-types'

const WidgetsBrand = (props) => {
  return (
    <div className={`row ${props.className || ''} g-4`}>
      {/* Facebook Widget */}
      <div className="col-sm-6 col-xl-4 col-xxl-3">
        <div className="card text-white" style={{ backgroundColor: '#3b5998' }}>
          <div className="card-header border-0 d-flex justify-content-center py-4 bg-transparent">
            <span style={{ fontSize: '3rem' }}>f</span>
          </div>
          <div className="card-body row text-center bg-white text-dark rounded-bottom p-2 mx-0">
            <div className="col border-end pt-2">
              <div className="fs-5 fw-bold">89K</div>
              <div className="text-uppercase text-muted small">friends</div>
            </div>
            <div className="col pt-2">
              <div className="fs-5 fw-bold">459</div>
              <div className="text-uppercase text-muted small">feeds</div>
            </div>
          </div>
        </div>
      </div>

      {/* Twitter Widget */}
      <div className="col-sm-6 col-xl-4 col-xxl-3">
        <div className="card text-white" style={{ backgroundColor: '#00aced' }}>
          <div className="card-header border-0 d-flex justify-content-center py-4 bg-transparent">
            <span style={{ fontSize: '3rem' }}>🐦</span>
          </div>
          <div className="card-body row text-center bg-white text-dark rounded-bottom p-2 mx-0">
            <div className="col border-end pt-2">
              <div className="fs-5 fw-bold">973k</div>
              <div className="text-uppercase text-muted small">followers</div>
            </div>
            <div className="col pt-2">
              <div className="fs-5 fw-bold">1.792</div>
              <div className="text-uppercase text-muted small">tweets</div>
            </div>
          </div>
        </div>
      </div>

      {/* LinkedIn Widget */}
      <div className="col-sm-6 col-xl-4 col-xxl-3">
        <div className="card text-white" style={{ backgroundColor: '#4875b4' }}>
          <div className="card-header border-0 d-flex justify-content-center py-4 bg-transparent">
            <span style={{ fontSize: '3rem' }}>in</span>
          </div>
          <div className="card-body row text-center bg-white text-dark rounded-bottom p-2 mx-0">
            <div className="col border-end pt-2">
              <div className="fs-5 fw-bold">500</div>
              <div className="text-uppercase text-muted small">contacts</div>
            </div>
            <div className="col pt-2">
              <div className="fs-5 fw-bold">1.292</div>
              <div className="text-uppercase text-muted small">feeds</div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Widget */}
      <div className="col-sm-6 col-xl-4 col-xxl-3">
        <div className="card text-white bg-warning">
          <div className="card-header border-0 d-flex justify-content-center py-4 bg-transparent">
            <span style={{ fontSize: '3rem' }}>📅</span>
          </div>
          <div className="card-body row text-center bg-white text-dark rounded-bottom p-2 mx-0">
            <div className="col border-end pt-2">
              <div className="fs-5 fw-bold">12+</div>
              <div className="text-uppercase text-muted small">events</div>
            </div>
            <div className="col pt-2">
              <div className="fs-5 fw-bold">4</div>
              <div className="text-uppercase text-muted small">meetings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

WidgetsBrand.propTypes = {
  className: PropTypes.string,
  withCharts: PropTypes.bool,
}

export default WidgetsBrand
