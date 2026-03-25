import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { removeFromCompare, clearCompare } from "../../redux/actions/compareActions";

const CompareBar = () => {
  const dispatch = useDispatch();
  const compareItems = useSelector(state => state.compareData.compareItems);

  if (compareItems.length === 0) return null;

  return (
    <div className="compare-bar">
      <div className="container">
        <div className="compare-bar-content">
          <div className="compare-items">
            {compareItems.map(item => (
              <div key={item.id} className="compare-item">
                <img src={item.image} alt={item.name} />
                <button
                  className="remove-btn"
                  onClick={() => dispatch(removeFromCompare(item.id))}
                  title="Remove from compare"
                >
                  ×
                </button>
              </div>
            ))}
            
            {[...Array(4 - compareItems.length)].map((_, index) => (
              <div key={`empty-${index}`} className="compare-item empty">
                <i className="fa fa-plus" />
              </div>
            ))}
          </div>
          
          <div className="compare-actions">
            <span className="compare-count">
              {compareItems.length} of 4 products
            </span>
            <button
              className="btn-clear"
              onClick={() => dispatch(clearCompare())}
            >
              Clear All
            </button>
            <Link to={process.env.PUBLIC_URL + "/compare"} className="btn-compare">
              Compare Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;
