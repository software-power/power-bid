import React from 'react'

const Page404 = () => {
  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="clearfix">
              <h1 className="float-start display-3 me-4">404</h1>
              <h4 className="pt-3">Oops! You{"'"}re lost.</h4>
              <p className="text-secondary float-start">
                The page you are looking for was not found.
              </p>
            </div>
            <div className="input-group">
              <span className="input-group-text">
                <span role="img" aria-label="search">🔍</span>
              </span>
              <input type="text" className="form-control" placeholder="What are you looking for?" />
              <button className="btn btn-info text-white">Search</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page404
