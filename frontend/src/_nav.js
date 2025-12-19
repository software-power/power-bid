import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilExternalLink,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilSettings,
  cilPeople,
  cilBriefcase,
  cilCart,
  cilMoney,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} size="lg" />,
  },
  {
    component: CNavGroup,
    name: 'Master',
    to: '/master',
    icon: <CIcon icon={cilSettings} size="lg" />,
    items: [
      {
        component: CNavItem,
        name: 'Attachment Types',
        to: '/master/attachment-types',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Admin',
    to: '/base',
    icon: <CIcon icon={cilPeople} size="lg" />,
    items: [
      {
        component: CNavItem,
        name: 'Users',
        to: '/users',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Seller',
    to: '/seller',
    icon: <CIcon icon={cilBriefcase} size="lg" />,
    items: [
      {
        component: CNavItem,
        name: 'Users',
        to: '/seller/users',
      },
      {
        component: CNavItem,
        name: 'Add Quotation',
        to: '/seller/add-quotation',
      },
      {
        component: CNavItem,
        name: 'Invited Quotations',
        to: '/seller/invited-quotations',
      },
      {
        component: CNavItem,
        name: 'My Quotations',
        to: '/seller/my-quotations',
      },
      {
        component: CNavItem,
        name: 'Certificates Attachments',
        to: '/seller/certificates',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Buyer',
    to: '/buyer',
    icon: <CIcon icon={cilCart} size="lg" />,
    items: [
      {
        component: CNavItem,
        name: 'Users',
        to: '/buyer/users',
      },
      {
        component: CNavItem,
        name: 'Add Quotation',
        to: '/buyer/add-quotation',
      },
      {
        component: CNavItem,
        name: 'My Quotations',
        to: '/buyer/my-quotations',
      },
      {
        component: CNavItem,
        name: 'Add Item',
        to: '/buyer/add-item',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Transactions',
    to: '/buttons',
    icon: <CIcon icon={cilMoney} size="lg" />,
    items: [
      {
        component: CNavItem,
        name: 'Bids',
        to: '/buttons/buttons',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Reports',
    icon: <CIcon icon={cilChartPie} size="lg" />,
    items: [



      {
        component: CNavItem,
        name: 'Bids',
        to: '/forms/rangeR',
      },

      {
        component: CNavItem,
        name: (
          <React.Fragment>
            {'Rating'}
            <CIcon icon={cilExternalLink} size="sm" className="ms-2" />
          </React.Fragment>
        ),
        href: 'https://coreui.io/react/docs/forms/rating/',
        badge: {
          color: 'danger',
          text: 'PRO',
        },
      },
      {
        component: CNavItem,
        name: 'Select',
        to: '/forms/select',
      },
      {
        component: CNavItem,
        name: (
          <React.Fragment>
            {'Stepper'}
            <CIcon icon={cilExternalLink} size="sm" className="ms-2" />
          </React.Fragment>
        ),
        href: 'https://coreui.io/react/docs/forms/stepper/',
        badge: {
          color: 'danger',
          text: 'PRO',
        },
      },
      {
        component: CNavItem,
        name: (
          <React.Fragment>
            {'Time Picker'}
            <CIcon icon={cilExternalLink} size="sm" className="ms-2" />
          </React.Fragment>
        ),
        href: 'https://coreui.io/react/docs/forms/time-picker/',
        badge: {
          color: 'danger',
          text: 'PRO',
        },
      },
      {
        component: CNavItem,
        name: 'Layout',
        to: '/forms/layout',
      },
      {
        component: CNavItem,
        name: 'Validation',
        to: '/forms/validation',
      },
    ],
  },





]

export default _nav
