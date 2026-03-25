// Action Types
export const ADD_TO_COMPARE = "ADD_TO_COMPARE";
export const REMOVE_FROM_COMPARE = "REMOVE_FROM_COMPARE";
export const CLEAR_COMPARE = "CLEAR_COMPARE";

// Action Creators
export const addToCompare = (product) => ({
  type: ADD_TO_COMPARE,
  payload: product
});

export const removeFromCompare = (productId) => ({
  type: REMOVE_FROM_COMPARE,
  payload: productId
});

export const clearCompare = () => ({
  type: CLEAR_COMPARE
});
