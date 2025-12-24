import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const ThemeView = ({ colorClass }) => {
  return (
    <table className="table w-100 table-sm mt-2">
      <tbody>
        <tr>
          <td className="text-muted small">Class:</td>
          <td className="fw-bold small">{colorClass}</td>
        </tr>
      </tbody>
    </table>
  )
}

const ThemeColor = ({ className, children }) => {
  const classes = classNames(className, 'theme-color w-100 rounded mb-3 shadow-sm')
  return (
    <div className="col-12 col-sm-6 col-md-4 col-xl-2 mb-4">
      <div className={classes} style={{ paddingTop: '75%' }}></div>
      {children}
      <ThemeView colorClass={className} />
    </div>
  )
}

ThemeColor.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
}

const Colors = () => {
  return (
    <>
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          Theme colors
        </div>
        <div className="card-body">
          <div className="row">
            <ThemeColor className="bg-primary">
              <h6>Brand Primary Color</h6>
            </ThemeColor>
            <ThemeColor className="bg-secondary">
              <h6>Brand Secondary Color</h6>
            </ThemeColor>
            <ThemeColor className="bg-success">
              <h6>Brand Success Color</h6>
            </ThemeColor>
            <ThemeColor className="bg-danger">
              <h6>Brand Danger Color</h6>
            </ThemeColor>
            <ThemeColor className="bg-warning">
              <h6>Brand Warning Color</h6>
            </ThemeColor>
            <ThemeColor className="bg-info">
              <h6>Brand Info Color</h6>
            </ThemeColor>
            <ThemeColor className="bg-light">
              <h6>Brand Light Color</h6>
            </ThemeColor>
            <ThemeColor className="bg-dark text-white">
              <h6>Brand Dark Color</h6>
            </ThemeColor>
          </div>
        </div>
      </div>
    </>
  )
}

export default Colors
