import React from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { addToCompare, removeFromCompare } from "../../redux/actions/compareActions";

const AddToCompare = ({ product, className }) => {
  const dispatch = useDispatch();
  const compareItems = useSelector(state => state.compareData.compareItems);
  
  const isInCompare = compareItems.some(item => item.id === product.id);
  const isMaxReached = compareItems.length >= 4;

  const handleClick = (e) => {
    e.preventDefault();
    
    if (isInCompare) {
      dispatch(removeFromCompare(product.id));
    } else if (!isMaxReached) {
      // Extract product data with correct Shopizer structure
      const compareProduct = {
        id: product.id,
        name: product.description?.name || product.name,
        image: product.images?.[0]?.imageUrl || product.image,
        price: product.originalPrice || product.price,
        finalPrice: product.finalPrice,
        description: product.description || {},
        sku: product.sku,
        attributes: product.attributes || []
      };
      
      dispatch(addToCompare(compareProduct));
    }
  };

  return (
    <button
      className={`compare-btn ${isInCompare ? "active" : ""} ${className || ""}`}
      onClick={handleClick}
      disabled={!isInCompare && isMaxReached}
      title={
        isMaxReached && !isInCompare 
          ? "Maximum 4 products allowed" 
          : isInCompare 
          ? "Remove from compare" 
          : "Add to compare"
      }
    >
      <i className={`fa ${isInCompare ? "fa-check-square-o" : "fa-square-o"}`} />
    </button>
  );
};

AddToCompare.propTypes = {
  product: PropTypes.object.isRequired,
  className: PropTypes.string
};

export default AddToCompare;
