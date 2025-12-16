import React from 'react'
import { NavLink } from 'react-router-dom'
import {
    CBadge,
    CDropdown,
    CDropdownDivider,
    CDropdownHeader,
    CDropdownItem,
    CDropdownMenu,
    CDropdownToggle,
    CNavLink,
    CNavItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

export const AppHeaderNav = ({ items }) => {
    const navLink = (name, icon, badge) => {
        return (
            <>
                {icon && icon}
                {name && name}
                {badge && (
                    <CBadge color={badge.color} className="ms-auto">
                        {badge.text}
                    </CBadge>
                )}
            </>
        )
    }

    const navItem = (item, index) => {
        const { component, name, badge, icon, ...rest } = item
        const Component = component
        return (
            <Component key={index}>
                <CNavLink {...(rest.to && { as: NavLink })} {...rest}>
                    {navLink(name, icon, badge)}
                </CNavLink>
            </Component>
        )
    }

    const navGroup = (item, index) => {
        const { component, name, icon, to, ...rest } = item
        const Component = CDropdown // Map CNavGroup to CDropdown for header

        return (
            <Component variant="nav-item" key={index} className="header-dropdown">
                <CDropdownToggle caret={false} className="d-flex align-items-center">
                    {icon && icon}
                    <span className="ms-2">{name}</span>
                </CDropdownToggle>
                <CDropdownMenu>
                    {item.items?.map((item, index) =>
                        item.items ? navGroup(item, index) : navItemWrapper(item, index)
                    )}
                </CDropdownMenu>
            </Component>
        )
    }

    const navItemWrapper = (item, index) => {
        // Map CNavItem to CDropdownItem if inside a dropdown (Group), else standard CNavItem in root
        // But wait, the recursive call above `navGroup` maps children.
        // If it's a top level item, it should be CNavItem.
        // If it's inside a group, it should be CDropdownItem.
        // The `AppHeaderNav` receives the root `items`.

        // Let's adjust logic. The `navGroup` renders a Dropdown. Its children are in DropdownMenu.
        // So children of a group should be rendered as CDropdownItem or nested Dropdowns.

        const { component, name, badge, icon, ...rest } = item
        return (
            <CDropdownItem
                {...(rest.to && { as: NavLink })}
                {...rest}
                key={index}
            >
                {navLink(name, icon, badge)}
            </CDropdownItem>
        )
    }

    return (
        <>
            {items &&
                items.map((item, index) => (
                    item.items ? navGroup(item, index) : navItem(item, index)
                ))}
        </>
    )
}
