import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))


// Admin
// Users
const Users = React.lazy(() => import('./views/users/Users'))

// Master
const AttachmentTypes = React.lazy(() => import('./views/master/AttachmentTypes'))
const Certificates = React.lazy(() => import('./views/seller/Certificates'))

// Profile
const Profile = React.lazy(() => import('./views/profile/Profile'))

// Buyer
const AddQuotation = React.lazy(() => import('./views/buyer/AddQuotation'))
const Quotations = React.lazy(() => import('./views/buyer/Quotations'))
const QuotationComparison = React.lazy(() => import('./views/buyer/QuotationComparison'))

// Seller
const InvitedQuotations = React.lazy(() => import('./views/seller/InvitedQuotations'))
const SubmittedQuotations = React.lazy(() => import('./views/seller/SubmittedQuotations'))
const SubmitQuotation = React.lazy(() => import('./views/seller/SubmitQuotation'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/profile', name: 'Profile', element: Profile },
  { path: '/theme', name: 'Theme', element: Colors, exact: true },
  { path: '/users', name: 'Users', element: Users },
  { path: '/buyer/users', name: 'Buyer Users', element: Users },
  { path: '/buyer/add-quotation', name: 'Add Quotation', element: AddQuotation },
  { path: '/buyer/edit-quotation/:id', name: 'Edit Quotation', element: AddQuotation },
  { path: '/buyer/my-quotations', name: 'My Quotations', element: Quotations },
  { path: '/buyer/quotation-comparison/:tenderId', name: 'Quotation Comparison', element: QuotationComparison },
  { path: '/seller/users', name: 'Seller Users', element: Users },
  { path: '/seller/invited-quotations', name: 'Invited Quotations', element: InvitedQuotations },
  { path: '/seller/my-quotations', name: 'My Quotations', element: SubmittedQuotations },
  { path: '/seller/submit-quotation/:token', name: 'Submit Quotation', element: SubmitQuotation },
  { path: '/seller/submit-quotation/tender/:tenderId', name: 'Submit Quotation', element: SubmitQuotation },
  { path: '/master/attachment-types', name: 'Attachment Types', element: AttachmentTypes },
  { path: '/seller/certificates', name: 'Certificates Attachments', element: Certificates },
]

export default routes
