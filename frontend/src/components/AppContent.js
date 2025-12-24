import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

// routes config
import routes from '../routes'

const AppContent = () => {
  return (
    <div className="container-fluid px-4">
      <Suspense fallback={<div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>}>
        <Routes>
          {routes.map((route, idx) => {
            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  element={<route.element />}
                />
              )
            )
          })}
          <Route path="/" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default React.memo(AppContent)
