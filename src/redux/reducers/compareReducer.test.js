import compareReducer from './compareReducer';
import { 
  ADD_TO_COMPARE, 
  REMOVE_FROM_COMPARE, 
  CLEAR_COMPARE 
} from '../actions/compareActions';

describe('compareReducer', () => {
  const mockProduct1 = { id: 1, name: 'Product 1', price: 100, sku: 'PROD-001' };
  const mockProduct2 = { id: 2, name: 'Product 2', price: 200, sku: 'PROD-002' };
  const mockProduct3 = { id: 3, name: 'Product 3', price: 300, sku: 'PROD-003' };
  const mockProduct4 = { id: 4, name: 'Product 4', price: 400, sku: 'PROD-004' };
  const mockProduct5 = { id: 5, name: 'Product 5', price: 500, sku: 'PROD-005' };

  it('should return initial state', () => {
    const state = compareReducer(undefined, {});
    expect(state).toEqual({ compareItems: [] });
  });

  it('should add product to compare', () => {
    const state = compareReducer(undefined, {
      type: ADD_TO_COMPARE,
      payload: mockProduct1
    });
    expect(state.compareItems).toHaveLength(1);
    expect(state.compareItems[0]).toEqual(mockProduct1);
  });

  it('should add multiple products to compare', () => {
    let state = { compareItems: [] };
    
    state = compareReducer(state, {
      type: ADD_TO_COMPARE,
      payload: mockProduct1
    });
    
    state = compareReducer(state, {
      type: ADD_TO_COMPARE,
      payload: mockProduct2
    });
    
    expect(state.compareItems).toHaveLength(2);
    expect(state.compareItems[0].id).toBe(1);
    expect(state.compareItems[1].id).toBe(2);
  });

  it('should not add duplicate product', () => {
    let state = { compareItems: [mockProduct1] };
    state = compareReducer(state, {
      type: ADD_TO_COMPARE,
      payload: mockProduct1
    });
    expect(state.compareItems).toHaveLength(1);
  });

  it('should not add more than 4 products', () => {
    let state = { 
      compareItems: [mockProduct1, mockProduct2, mockProduct3, mockProduct4] 
    };
    state = compareReducer(state, {
      type: ADD_TO_COMPARE,
      payload: mockProduct5
    });
    expect(state.compareItems).toHaveLength(4);
    expect(state.compareItems.find(p => p.id === 5)).toBeUndefined();
  });

  it('should remove product from compare', () => {
    let state = { compareItems: [mockProduct1, mockProduct2, mockProduct3] };
    state = compareReducer(state, {
      type: REMOVE_FROM_COMPARE,
      payload: 2
    });
    expect(state.compareItems).toHaveLength(2);
    expect(state.compareItems.find(p => p.id === 2)).toBeUndefined();
    expect(state.compareItems[0].id).toBe(1);
    expect(state.compareItems[1].id).toBe(3);
  });

  it('should remove first product from compare', () => {
    let state = { compareItems: [mockProduct1, mockProduct2] };
    state = compareReducer(state, {
      type: REMOVE_FROM_COMPARE,
      payload: 1
    });
    expect(state.compareItems).toHaveLength(1);
    expect(state.compareItems[0].id).toBe(2);
  });

  it('should remove last product from compare', () => {
    let state = { compareItems: [mockProduct1, mockProduct2] };
    state = compareReducer(state, {
      type: REMOVE_FROM_COMPARE,
      payload: 2
    });
    expect(state.compareItems).toHaveLength(1);
    expect(state.compareItems[0].id).toBe(1);
  });

  it('should handle removing non-existent product', () => {
    let state = { compareItems: [mockProduct1, mockProduct2] };
    state = compareReducer(state, {
      type: REMOVE_FROM_COMPARE,
      payload: 999
    });
    expect(state.compareItems).toHaveLength(2);
  });

  it('should clear all products', () => {
    let state = { compareItems: [mockProduct1, mockProduct2, mockProduct3] };
    state = compareReducer(state, { type: CLEAR_COMPARE });
    expect(state.compareItems).toHaveLength(0);
  });

  it('should clear empty compare list', () => {
    let state = { compareItems: [] };
    state = compareReducer(state, { type: CLEAR_COMPARE });
    expect(state.compareItems).toHaveLength(0);
  });

  it('should handle unknown action type', () => {
    let state = { compareItems: [mockProduct1] };
    state = compareReducer(state, { type: 'UNKNOWN_ACTION' });
    expect(state.compareItems).toHaveLength(1);
    expect(state).toEqual({ compareItems: [mockProduct1] });
  });

  it('should maintain immutability when adding product', () => {
    const initialState = { compareItems: [mockProduct1] };
    const newState = compareReducer(initialState, {
      type: ADD_TO_COMPARE,
      payload: mockProduct2
    });
    
    expect(initialState.compareItems).toHaveLength(1);
    expect(newState.compareItems).toHaveLength(2);
    expect(newState).not.toBe(initialState);
  });

  it('should maintain immutability when removing product', () => {
    const initialState = { compareItems: [mockProduct1, mockProduct2] };
    const newState = compareReducer(initialState, {
      type: REMOVE_FROM_COMPARE,
      payload: 1
    });
    
    expect(initialState.compareItems).toHaveLength(2);
    expect(newState.compareItems).toHaveLength(1);
    expect(newState).not.toBe(initialState);
  });
});
