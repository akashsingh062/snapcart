import { createSlice } from "@reduxjs/toolkit";
import mongoose from "mongoose";

interface IUserInterface {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  mobile?: string;
  role: "user" | "deliveryBoy" | "admin";
}
interface IUserSlice {
  userData: IUserInterface | null;
}
const initialState: IUserSlice = {
  userData: null,
};
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
  },
});

export default userSlice.reducer;
export const { setUserData } = userSlice.actions;
