import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { IGrocery } from "@/components/GroceryItemCard";

export interface ICartItem extends IGrocery {
  quantity: number;
}

interface ICartSlice {
  cartData: ICartItem[];
  subTotal: number;
  deliveryFee: number;
  platformFee: number;
  finalTotal: number;
}

const initialState: ICartSlice = {
  cartData: [],
  subTotal: 0,
  deliveryFee: 0,
  platformFee: 0,
  finalTotal: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<ICartItem>) => {
      const existingItem = state.cartData.find(
        (item) => item._id === action.payload._id
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.cartData.push(action.payload);
      }
      cartSlice.caseReducers.calculateTotal(state);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartData = state.cartData.filter(
        (item) => item._id !== action.payload
      );
      cartSlice.caseReducers.calculateTotal(state);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ _id: string; quantity: number }>
    ) => {
      const item = state.cartData.find((i) => i._id === action.payload._id);
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.cartData = state.cartData.filter(
            (i) => i._id !== action.payload._id
          );
        }
      }
      cartSlice.caseReducers.calculateTotal(state);
    },
    calculateTotal: (state) => {
      state.subTotal = state.cartData.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0
      );

      if (state.cartData.length === 0 || state.subTotal === 0) {
        state.deliveryFee = 0;
        state.platformFee = 0;
        state.finalTotal = 0;
      } else {
        // Free delivery above ₹250, else ₹30
        state.deliveryFee = state.subTotal >= 250 ? 0 : 30;
        state.platformFee = 5;
        state.finalTotal = state.subTotal + state.deliveryFee + state.platformFee;
      }
    },
    emptyCart: (state) => {
      state.cartData = [];
      state.subTotal = 0;
      state.deliveryFee = 0;
      state.platformFee = 0;
      state.finalTotal = 0;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  calculateTotal,
  emptyCart,
} = cartSlice.actions;

export default cartSlice.reducer;
