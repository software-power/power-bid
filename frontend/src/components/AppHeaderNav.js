import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'

export const AppHeaderNav = ({ items }) => {
    // Helper component for Nav Item
    const NavItem = ({ item }) => {
        const { name, icon, to, badge } = item
        return (
            <li className="nav-item">
                <NavLink to={to} className="nav-link d-flex align-items-center">
                    {icon && <span className="me-2">{icon}</span>}
                    {name}
                    {badge && (
                        <span className={`badge bg-${badge.color} ms-2`}>
                            {badge.text}
                        </span>
                    )}
                </NavLink>
            </li>
        )
    }

    // Helper component for Nav Dropdown (Group)
    const NavGroup = ({ item }) => {
        const { name, icon, items } = item
        const [isOpen, setIsOpen] = useState(false)

        return (
            <li
                className={`nav-item dropdown ${isOpen ? 'show' : ''}`}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                <a
                    className="nav-link dropdown-toggle d-flex align-items-center"
                    href="#"
                    role="button"
                    aria-expanded={isOpen}
                    onClick={(e) => e.preventDefault()}
                >
                    {icon && <span className="me-2">{icon}</span>}
                    {name}
                </a>
                <ul className={`dropdown-menu ${isOpen ? 'show' : ''}`}>
                    {items && items.map((subItem, index) => (
                        subItem.items ? (
                            // Nested dropdowns are tricky in standard Bootstrap without extra CSS/JS.
                            // For simplicty, flat lists or simplistic nesting.
                            // Given requirements, let's assume one level deep or render recursively.
                            // Recursive rendering for deeper levels might require custom styling for sub-menus.
                            <NavGroup key={index} item={subItem} />
                        ) : (
                            <li key={index}>
                                <NavLink to={subItem.to} className="dropdown-item d-flex align-items-center">
                                    {subItem.icon && <span className="me-2">{subItem.icon}</span>}
                                    {subItem.name}
                                    {subItem.badge && (
                                        <span className={`badge bg-${subItem.badge.color} ms-2`}>
                                            {subItem.badge.text}
                                        </span>
                                    )}
                                </NavLink>
                            </li>
                        )
                    ))}
                </ul>
            </li>
        )
    }

    return (
        <ul className="navbar-nav me-auto mb-2 mb-lg-0 w-100 flex-row gap-3">
            {items && items.map((item, index) => {
                // If the item type is 'nav-group' (based on `component` string or just presence of `items`)
                // In _nav.js we set component: 'nav-group' for groups.
                if (item.component === 'nav-group' || (item.items && item.items.length > 0)) {
                    return <NavGroup key={index} item={item} />
                } else {
                    return <NavItem key={index} item={item} />
                }
            })}
        </ul>
    )
}
