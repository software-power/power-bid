import React from 'react'

const Page500 = () => {
  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <span className="clearfix">
              <h1 className="float-start display-3 me-4">500</h1>
              <h4 className="pt-3">Houston, we have a problem!</h4>
              <p className="text-secondary float-start">
                The page you are looking for is temporarily unavailable.
              </p>
            </span>
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

export default Page500
