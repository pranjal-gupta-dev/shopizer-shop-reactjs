import React, { Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { removeFromCompare, clearCompare } from "../../redux/actions/compareActions";
import Breadcrumb from "../../wrappers/breadcrumb/Breadcrumb";

const Compare = () => {
  const dispatch = useDispatch();
  const compareItems = useSelector(state => state.compareData.compareItems);

  if (compareItems.length === 0) {
    return (
      <Fragment>
        <Helmet>
          <title>Compare Products | Shopizer</title>
        </Helmet>
        <Breadcrumb />
        <div className="compare-empty-area pt-100 pb-100">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="compare-empty text-center">
                  <i className="fa fa-balance-scale" style={{ fontSize: "80px", color: "#ccc" }} />
                  <h3 className="mt-30">No products to compare</h3>
                  <p>Add products to compare their features and specifications</p>
                  <Link to={process.env.PUBLIC_URL + "/"} className="btn btn-primary mt-20">
                    Browse Products
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }

  const allAttributes = [...new Set(
    compareItems.flatMap(item => 
      (item.attributes || []).map(attr => attr.name)
    )
  )];

  return (
    <Fragment>
      <Helmet>
        <title>Compare Products ({compareItems.length}) | Shopizer</title>
      </Helmet>
      <Breadcrumb />
      
      <div className="compare-main-area pt-90 pb-100">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="compare-page">
                <div className="compare-header mb-30">
                  <h2>Compare Products ({compareItems.length})</h2>
                  <button 
                    className="btn btn-danger"
                    onClick={() => dispatch(clearCompare())}
                  >
                    <i className="fa fa-trash" /> Clear All
                  </button>
                </div>

                <div className="compare-table-wrapper">
                  <table className="compare-table">
                    <tbody>
                      <tr>
                        <th className="compare-label">Product</th>
                        {compareItems.map(item => (
                          <td key={item.id} className="compare-product-cell">
                            <div className="compare-product">
                              <button
                                className="remove-btn"
                                onClick={() => dispatch(removeFromCompare(item.id))}
                                title="Remove"
                              >
                                <i className="fa fa-times" />
                              </button>
                              <Link to={process.env.PUBLIC_URL + `/product/${item.id}`}>
                                <img src={item.image} alt={item.name} />
                              </Link>
                              <h4 className="product-name">
                                <Link to={process.env.PUBLIC_URL + `/product/${item.id}`}>
                                  {item.name}
                                </Link>
                              </h4>
                            </div>
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <th className="compare-label">Price</th>
                        {compareItems.map(item => (
                          <td key={item.id}>
                            <span className="price">
                              ${item.finalPrice || item.price}
                            </span>
                            {item.finalPrice && item.finalPrice < item.price && (
                              <span className="old-price ml-2">
                                ${item.price}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <th className="compare-label">SKU</th>
                        {compareItems.map(item => (
                          <td key={item.id}>{item.sku || "N/A"}</td>
                        ))}
                      </tr>

                      <tr>
                        <th className="compare-label">Description</th>
                        {compareItems.map(item => (
                          <td key={item.id}>
                            <div className="description">
                              {item.description 
                                ? item.description.substring(0, 200) + "..." 
                                : "No description available"}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {allAttributes.map(attrName => (
                        <tr key={attrName}>
                          <th className="compare-label">{attrName}</th>
                          {compareItems.map(item => {
                            const attr = (item.attributes || []).find(
                              a => a.name === attrName
                            );
                            return (
                              <td key={item.id}>
                                {attr ? attr.value : "—"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}

                      <tr>
                        <th className="compare-label">Action</th>
                        {compareItems.map(item => (
                          <td key={item.id}>
                            <Link 
                              to={process.env.PUBLIC_URL + `/product/${item.id}`} 
                              className="btn btn-primary btn-sm"
                            >
                              View Details
                            </Link>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Compare;
