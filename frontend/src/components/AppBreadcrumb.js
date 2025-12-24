import React from 'react'
import { useLocation, Link } from 'react-router-dom'

import routes from '../routes'

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname

  const getRouteName = (pathname, routes) => {
    // Exact match
    const currentRoute = routes.find((route) => route.path === pathname)
    if (currentRoute) return currentRoute.name

    // Pattern match for routes with parameters (e.g., /edit-quotation/:id)
    const matchedRoute = routes.find(route => {
      if (!route.path) return false;
      const routePath = route.path.split('/');
      const currentPath = pathname.split('/');

      if (routePath.length !== currentPath.length) return false;

      return routePath.every((segment, i) => {
        return segment.startsWith(':') || segment === currentPath[i];
      });
    });

    return matchedRoute ? matchedRoute.name : false
  }

  const getBreadcrumbs = (location) => {
    const breadcrumbs = []
    location.split('/').reduce((prev, curr, index, array) => {
      const currentPathname = `${prev}/${curr}`
      const routeName = getRouteName(currentPathname, routes)
      routeName &&
        breadcrumbs.push({
          pathname: currentPathname,
          name: routeName,
          active: index + 1 === array.length ? true : false,
        })
      return currentPathname
    })
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs(currentLocation)

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb my-0">
        <li className="breadcrumb-item">
          <Link to="/">Home</Link>
        </li>
        {breadcrumbs.map((breadcrumb, index) => {
          return (
            <li
              className={`breadcrumb-item ${breadcrumb.active ? 'active' : ''}`}
              key={index}
              {...(breadcrumb.active ? { 'aria-current': 'page' } : {})}
            >
              {breadcrumb.active ? (
                breadcrumb.name
              ) : (
                <Link to={breadcrumb.pathname}>{breadcrumb.name}</Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default React.memo(AppBreadcrumb)
