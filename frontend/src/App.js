import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom'

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './scss/style.scss'


// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const TenderInvitation = React.lazy(() => import('./views/public/TenderInvitation'))
const ProtectedRoute = React.lazy(() => import('./components/ProtectedRoute')) // Import ProtectedRoute

const App = () => {
  // Simple theme initialization
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', 'light')
  }, [])

  return (
    <HashRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Navigate to="login" replace />} />
          <Route exact path="/login" name="Login Page" element={<Login />} />
          <Route exact path="/logout" name="Logout Page" element={<Login />} />
          <Route exact path="/register" name="Register Page" element={<Register />} />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />
          <Route exact path="/tender/invitation/:token" name="Tender Invitation" element={<TenderInvitation />} />

          {/* Protected Routes */}
          <Route path="*" name="Home" element={
            <ProtectedRoute>
              <DefaultLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
