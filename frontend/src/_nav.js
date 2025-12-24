import React from 'react'

const _nav = [
  {
    component: 'nav-item',
    name: 'Dashboard',
    to: '/dashboard',
    icon: '⏱️',
  },
  {
    component: 'nav-group',
    name: 'Master',
    to: '/master',
    icon: '⚙️',
    items: [
      {
        component: 'nav-item',
        name: 'Attachment Types',
        to: '/master/attachment-types',
      },
    ],
  },
  {
    component: 'nav-group',
    name: 'Admin',
    to: '/base',
    icon: '👥',
    items: [
      {
        component: 'nav-item',
        name: 'Users',
        to: '/users',
      },
    ],
  },
  {
    component: 'nav-group',
    name: 'Seller',
    to: '/seller',
    icon: '💼',
    items: [
      {
        component: 'nav-item',
        name: 'Users',
        to: '/seller/users',
      },
      {
        component: 'nav-item',
        name: 'Invited Quotations',
        to: '/seller/invited-quotations',
      },
      {
        component: 'nav-item',
        name: 'My Quotations',
        to: '/seller/my-quotations',
      },
      {
        component: 'nav-item',
        name: 'Certificates Attachments',
        to: '/seller/certificates',
      },
    ],
  },
  {
    component: 'nav-group',
    name: 'Buyer',
    to: '/buyer',
    icon: '🛒',
    items: [
      {
        component: 'nav-item',
        name: 'Users',
        to: '/buyer/users',
      },
      {
        component: 'nav-item',
        name: 'Add Quotation',
        to: '/buyer/add-quotation',
      },
      {
        component: 'nav-item',
        name: 'My Quotations',
        to: '/buyer/my-quotations',
      },
      // {
      //   component: 'nav-item',
      //   name: 'Add Item',
      //   to: '/buyer/add-item',
      // },
    ],
  },
  {
    component: 'nav-group',
    name: 'Transactions',
    to: '/buttons',
    icon: '💰',
    items: [
      {
        component: 'nav-item',
        name: 'Bids',
        to: '/buttons/buttons',
      },
    ],
  },
  {
    component: 'nav-group',
    name: 'Reports',
    icon: '📊',
    items: [
    ],
  },
]

export default _nav
