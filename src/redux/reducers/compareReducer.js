import { 
  ADD_TO_COMPARE, 
  REMOVE_FROM_COMPARE, 
  CLEAR_COMPARE 
} from "../actions/compareActions";

const initState = {
  compareItems: []
};

const compareReducer = (state = initState, action) => {
  switch (action.type) {
    case ADD_TO_COMPARE:
      // Enforce max 4 products
      if (state.compareItems.length >= 4) {
        return state;
      }
      
      // Prevent duplicates
      const exists = state.compareItems.find(
        item => item.id === action.payload.id
      );
      if (exists) {
        return state;
      }
      
      return {
        ...state,
        compareItems: [...state.compareItems, action.payload]
      };

    case REMOVE_FROM_COMPARE:
      return {
        ...state,
        compareItems: state.compareItems.filter(
          item => item.id !== action.payload
        )
      };

    case CLEAR_COMPARE:
      return {
        ...state,
        compareItems: []
      };

    default:
      return state;
  }
};

export default compareReducer;
