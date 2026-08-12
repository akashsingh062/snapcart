"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  Phone,
  ShoppingBag,
  Truck,
  User as UserIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import LiveTrackingMap from "@/components/LiveTrackingMap";
import { getSocket } from "@/lib/socket";

interface ICustomer {
  _id?: string;
  name?: string;
  mobile?: string;
  email?: string;
}

interface IOrderItem {
  _id?: string;
  name: string;
  price: string;
  unit: string;
  image: string;
  quantity: number;
}

interface IPopulatedOrder {
  _id: string;
  user?: ICustomer | null;
  assignedDeliveryBoy?: string | { _id: string; name?: string; email?: string; mobile?: string } | null;
  items: IOrderItem[];
  totalAmount: string;
  paymentMethod: "cod" | "online" | string;
  isPaid?: boolean;
  address: {
    fullName: string;
    mobile: string;
    city: string;
    state: string;
    pincode: string;
    fullAddress: string;
    latitude?: number;
    longitude?: number;
  };
  status: string;
  createdAt: string;
}

interface IActiveAssignment {
  _id: string;
  order: IPopulatedOrder;
  status: "broadcasted" | "assigned" | "completed";
  acceptedAt?: string;
  createdAt?: string;
}

export default function DeliveryBoyCurrentOrderPage() {
  const router = useRouter();
  const [assignment, setAssignment] = useState<IActiveAssignment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [completing, setCompleting] = useState<boolean>(false);
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Live GPS location tracking for delivery partner
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;

    const socket = getSocket();

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setDriverLocation({ lat: latitude, lng: longitude });

        const driverId =
          assignment?.order?.assignedDeliveryBoy &&
          typeof assignment.order.assignedDeliveryBoy === "object"
            ? assignment.order.assignedDeliveryBoy._id
            : assignment?.order?.assignedDeliveryBoy;

        // Emit location signal to update user's map in real time
        socket?.emit("update-location", {
          userId: driverId,
          latitude,
          longitude,
        });
      },
      (err) => {
        console.warn("Geolocation watch error:", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [assignment?.order?.assignedDeliveryBoy]);

  useEffect(() => {
    let isMounted = true;
    const fetchCurrentOrder = async () => {
      try {
        const res = await axios.get("/api/auth/delivery/current-order");
        if (isMounted) {
          if (res.data?.success && res.data?.assignment) {
            setAssignment(res.data.assignment);
          } else {
            setAssignment(null);
          }
        }
      } catch (error) {
        console.error("Fetch current order error:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCurrentOrder();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleMarkDelivered = async () => {
    if (!assignment) return;
    setCompleting(true);
    try {
      let res;
      try {
        res = await axios.get(
          `/api/auth/delivery/complete-assignment?assignmentId=${assignment._id}`
        );
      } catch {
        res = await axios.get(
          `/api/auth/delivery/assignment/${assignment._id}/complete-assignment`
        );
      }
      if (res.data?.success) {
        alert("🎉 Order marked as Delivered successfully!");
        setAssignment(null);
        router.push("/");
      } else {
        alert(res.data?.message || "Could not mark order as delivered.");
      }
    } catch (error: unknown) {
      console.error("Complete delivery error:", error);
      const errObj = error as { response?: { data?: { message?: string } }; message?: string };
      alert(
        errObj.response?.data?.message ||
          errObj.message ||
          "Failed to mark order as delivered."
      );
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="animate-spin text-emerald-700" />
        <p className="text-slate-500 font-medium text-sm">
          Loading your active delivery task...
        </p>
      </div>
    );
  }

  if (!assignment || !assignment.order) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
          <Truck size={40} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          No Active Delivery Task
        </h2>
        <p className="text-slate-500 text-sm mb-6 max-w-sm">
          You currently have no active orders assigned to deliver.
        </p>
        <Link href="/">
          <button className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-md cursor-pointer transition-all">
            Go to Partner Dashboard
          </button>
        </Link>
      </div>
    );
  }

  const order = assignment.order;
  const isCod = order.paymentMethod?.toLowerCase() === "cod";

  return (
    <div className="w-[92%] md:w-[80%] max-w-4xl mx-auto pt-20 sm:pt-24 pb-8 min-h-[85vh] space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-bold text-sm transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Partner Dashboard</span>
        </Link>

        <span className="px-3.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200 flex items-center gap-1.5">
          <Truck size={14} />
          <span>Out for Delivery</span>
        </span>
      </div>

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-emerald-800 to-teal-800 text-white rounded-3xl p-6 shadow-xl space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-emerald-200 text-xs font-bold uppercase tracking-wider">
              Current Active Delivery
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
              Order #{order._id.slice(-6).toUpperCase()}
            </h1>
          </div>

          <div
            className={`px-4 py-2.5 rounded-2xl border backdrop-blur-md text-right shrink-0 ${
              isCod
                ? "bg-amber-500/20 border-amber-300/30 text-amber-100"
                : "bg-emerald-500/20 border-emerald-300/30 text-emerald-100"
            }`}
          >
            <p className="text-[10px] uppercase font-bold tracking-wider">
              {isCod ? "Cash to Collect (COD)" : "Payment Status"}
            </p>
            <p className="text-xl font-extrabold text-white">
              {isCod ? `₹${order.totalAmount}` : "Prepaid Online"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Interactive OpenStreetMap Live Map */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-95 rounded-3xl overflow-hidden shadow-lg border border-slate-200"
      >
        <LiveTrackingMap
          userLocation={[
            Number(order.address?.latitude) || 28.6139,
            Number(order.address?.longitude) || 77.209,
          ]}
          driverLocation={
            driverLocation && Number(driverLocation.lat) && Number(driverLocation.lng)
              ? [Number(driverLocation.lat), Number(driverLocation.lng)]
              : null
          }
          customerName={order.address?.fullName || "Delivery Address"}
          driverName="You (Delivery Partner)"
          fullAddress={order.address?.fullAddress}
        />
      </motion.div>

      {/* Main Grid: Customer Details & Map Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <UserIcon size={18} className="text-emerald-700" />
                <span>Customer Information</span>
              </h3>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Customer Name
                </p>
                <p className="text-base font-extrabold text-slate-900">
                  {order.address?.fullName || order.user?.name || "Customer"}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Mobile Number
                </p>
                <p className="text-sm font-bold text-slate-700">
                  {order.address?.mobile || order.user?.mobile || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {(order.address?.mobile || order.user?.mobile) && (
            <a
              href={`tel:${order.address?.mobile || order.user?.mobile}`}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
            >
              <Phone size={15} />
              <span>Call Customer</span>
            </a>
          )}
        </motion.div>

        {/* Address Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <MapPin size={18} className="text-emerald-700" />
                <span>Delivery Address</span>
              </h3>
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-slate-800 font-bold leading-relaxed">
                {order.address?.fullAddress}
              </p>
              <p className="text-slate-500 font-semibold">
                {order.address?.city}, {order.address?.state} -{" "}
                {order.address?.pincode}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Ordered Items Summary */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <ShoppingBag size={18} className="text-emerald-700" />
            <span>Items to Deliver ({order.items?.length || 0})</span>
          </h3>
          <span className="font-extrabold text-slate-900 text-base">
            Total Amount: ₹{order.totalAmount}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {order.items?.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80"
            >
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-white">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {item.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Qty: <span className="font-bold text-emerald-700">{item.quantity}</span> • ₹{item.price}
                </p>
              </div>
              <span className="font-extrabold text-xs text-slate-900 shrink-0">
                ₹{Number(item.price) * item.quantity}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Mark as Delivered Main Action */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-lg text-center space-y-3"
      >
        <h3 className="text-lg font-extrabold text-slate-900">
          Ready to Complete Delivery?
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Ensure you have handed over all items to the customer and collected cash (if COD) before marking as delivered.
        </p>

        <button
          onClick={handleMarkDelivered}
          disabled={completing}
          className="w-full sm:w-auto px-8 py-3.5 bg-linear-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-700/20 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
        >
          {completing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Marking as Delivered...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              <span>Mark Order as Delivered 🎉</span>
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
