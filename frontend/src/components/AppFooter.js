import React from 'react'

const AppFooter = () => {
  return (
    <footer className="footer px-4 py-2 border-top d-flex flex-wrap justify-content-between align-items-center">
      <div>
        <a href="https://powercomputers.net" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
          Power Computers
        </a>
        <span className="ms-1">&copy; 2025 Power Computers.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="https://powercomputers.net" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
          Power Computers Bidding System
        </a>
      </div>
    </footer>
  )
}

export default React.memo(AppFooter)
