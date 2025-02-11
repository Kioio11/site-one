import { createContext, ReactNode, useContext, useReducer } from "react";
import { Service } from "@shared/schema";

interface CartItem extends Service {}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Service }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "CLEAR_CART" };

interface CartContextType {
  state: CartState;
  items: CartItem[];
  calculateTotal: () => number;
  addItem: (item: Service) => void;
  removeItem: (itemId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM":
      // Check if item already exists
      const exists = state.items.some(item => item.id === action.payload.id);
      if (exists) {
        return state;
      }
      console.log('Adding item to cart:', action.payload);
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addItem = (item: Service) => {
    console.log('Adding item:', item);
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeItem = (itemId: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: itemId });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const calculateTotal = () => {
    return state.items.reduce((total, item) => total + item.basePrice, 0);
  };

  return (
    <CartContext.Provider value={{ 
      state,
      items: state.items,
      calculateTotal,
      addItem,
      removeItem,
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}