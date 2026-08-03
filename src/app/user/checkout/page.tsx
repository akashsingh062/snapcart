"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Building,
  Home,
  MapPin,
  Navigation,
  Phone,
  PinIcon,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const Checkout = () => {
  const router = useRouter();
  const { userData } = useSelector((state: RootState) => state.user);
  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    fullAddress: "",
  });
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    const fetchIpFallback = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.latitude && data.longitude) {
          setPosition([data.latitude, data.longitude]);
          setAddress((prev) => ({
            ...prev,
            city: prev.city || data.city || "",
            state: prev.state || data.region || "",
            pincode: prev.pincode || data.postal || "",
          }));
        } else {
          setPosition([28.6139, 77.2090]);
        }
      } catch {
        setPosition([28.6139, 77.2090]);
      }
    };

    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (error) => {
          console.warn("Browser geolocation failed/denied, using IP fallback:", error.message);
          fetchIpFallback();
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      fetchIpFallback();
    }
  }, []);

  useEffect(() => {
    if (userData) {
      const timer = setTimeout(() => {
        setAddress((prev) => {
          if (prev.fullName === (userData.name || "") && prev.mobile === (userData.mobile || "")) {
            return prev;
          }
          return {
            ...prev,
            fullName: prev.fullName || userData.name || "",
            mobile: prev.mobile || userData.mobile || "",
          };
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [userData]);

  return (
    <div className="w-[92%] md:w-[80%] mx-auto py-10 relative">
      {/* title */}
      <motion.div
        whileTap={{ scale: 0.97 }}
        onClick={() => router.back()}
        className="absolute left-0 top-2 flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to cart
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold text-green-700 tracking-tight"
      >
        Checkout
      </motion.h1>

      <div className="grid md:grid-cols-2 gap-8 mt-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-green-700" /> Delivery Address
          </h2>
          <div className="space-y-4">
            <div className="relative">
              <User size={18} className="absolute left-3 top-3 text-green-600" />
              <input
                type="text"
                value={address.fullName}
                onChange={(e) =>
                  setAddress((prev) => ({ ...prev, fullName: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-3 text-green-600" />
              <input
                type="text"
                value={address.mobile}
                onChange={(e) =>
                  setAddress((prev) => ({ ...prev, mobile: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="relative">
              <Home size={18} className="absolute left-3 top-3 text-green-600" />
              <input
                type="text"
                placeholder="Full Address"
                value={address.fullAddress}
                onChange={(e) =>
                  setAddress((prev) => ({ ...prev, fullAddress: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="relative">
                <Building size={18} className="absolute left-3 top-3 text-green-600" />
                <input
                  type="text"
                  placeholder="City"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, city: e.target.value }))
                  }
                />
              </div>
              <div className="relative">
                <Navigation size={18} className="absolute left-3 top-3 text-green-600" />
                <input
                  type="text"
                  placeholder="State"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, state: e.target.value }))
                  }
                />
              </div>
              <div className="relative">
                <PinIcon size={18} className="absolute left-3 top-3 text-green-600" />
                <input
                  type="text"
                  placeholder="Pincode"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, pincode: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <input
                type="text"
                placeholder="Search city or area..."
                className="w-full pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <button className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 hover:text-white transition-all duration-300">
                Search
              </button>
            </div>

            <div className="relative mt-6 h-80 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
              <MapView position={position} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;
