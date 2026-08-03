import { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { IGrocery } from "@/components/GroceryItemCard";

export interface ICartItem extends IGrocery {
  quantity: number;
}
interface ICartSlice {
  cartData: ICartItem[],
  subTotal: number,
  deliveryFee: number,
  finalTotal: number
}
const initialState: ICartSlice = {
  cartData: [],
  subTotal: 0,
  deliveryFee: 40,
  finalTotal: 40
};
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<ICartItem>) => {
      const existingItem = state.cartData.find(
        (item) => item._id === action.payload._id,
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.cartData.push(action.payload);
      }
      cartSlice.caseReducers.calculateTotal(state)
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartData = state.cartData.filter(
        (item) => item._id !== action.payload,
      );
      cartSlice.caseReducers.calculateTotal(state)
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ _id: string; quantity: number }>,
    ) => {
      const item = state.cartData.find((i) => i._id === action.payload._id);
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.cartData = state.cartData.filter(
            (i) => i._id !== action.payload._id,
          );
        }
      }
      cartSlice.caseReducers.calculateTotal(state)
    },
    calculateTotal:(state)=>{
      state.subTotal = state.cartData.reduce(
        (total, item)=> total + Number(item.price) * item.quantity,
        0
      )
      state.deliveryFee = state.subTotal > 4000 ? 0:40
      state.finalTotal = state.subTotal + state.deliveryFee
    }
  },
});

export const { addToCart, removeFromCart, updateQuantity, calculateTotal } = cartSlice.actions;
export default cartSlice.reducer;
