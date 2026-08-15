"use client";
import { AppDispatch } from "@/redux/store";
import { setUserData } from "@/redux/userSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

function useGetMe() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const getMe = async () => {
      try {
        const result = await axios.get("/api/auth/me");
        if (result.data?.user) {
          dispatch(setUserData(result.data.user));
        }
      } catch {
        // Ignored
      }
    };
    getMe();
  }, [dispatch]);
}

export default useGetMe;
