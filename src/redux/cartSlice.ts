import { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { IGrocery } from "@/components/GroceryItemCard";

export interface ICartItem extends IGrocery {
  quantity: number;
}
interface ICartSlice {
  cartData: ICartItem[];
}
const initialState: ICartSlice = {
  cartData: [],
};
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart:(state,action:PayloadAction<ICartItem>)=>{
      const existingItem = state.cartData.find(item => item._id === action.payload._id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.cartData.push(action.payload);
      }
    },
    removeFromCart:(state,action:PayloadAction<string>)=>{
      state.cartData = state.cartData.filter(item => item._id !== action.payload);
    },
    updateQuantity:(state,action:PayloadAction<{ _id: string; quantity: number }>)=>{
      const item = state.cartData.find(i => i._id === action.payload._id);
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.cartData = state.cartData.filter(i => i._id !== action.payload._id);
        }
      }
    }
  },
});

export const {addToCart, removeFromCart, updateQuantity} = cartSlice.actions;
export default cartSlice.reducer;
