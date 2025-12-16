import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="https://powercomputers.net" target="_blank" rel="noopener noreferrer">
          Power Computers
        </a>
        <span className="ms-1">&copy; 2025 Power Computers.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="https://powercomputers.net" target="_blank" rel="noopener noreferrer">
          Power Computers Bidding System
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
