"use client";
import { AppDispatch } from "@/redux/store";
import { setUserData } from "@/redux/userSlice";
import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

function useGetMe() {
    const dispatch = useDispatch<AppDispatch>()
  useEffect(() => {
    const getMe = async () => {
      const result = await axios.get("/api/auth/me");
      dispatch(setUserData(result.data.user))
    };
    getMe();
  }, [dispatch]);
}

export default useGetMe;
