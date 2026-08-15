"use client";
import { getSocket } from "@/lib/socket";
import { RootState } from "@/redux/store";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const GeoUpdater = () => {
  const { userData } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!userData?._id) return;
    const socket = getSocket();
    socket.emit("identity", userData._id);

    if (!navigator.geolocation) return;

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        socket.emit("update-location", {
          userId: userData._id,
          latitude: lat,
          longitude: lng,
        });
      },
      () => {
        // Location access denied or unavailable
      },
      {
        enableHighAccuracy: true,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watcher);
    };
  }, [userData]);

  return null;
};

export default GeoUpdater;
