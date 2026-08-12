"use client";

import React, { useEffect, useState, use } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Navigation,
  Package,
  Phone,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getSocket } from "@/lib/socket";
import LiveTrackingMap from "@/components/LiveTrackingMap";

interface IDeliveryBoy {
  _id: string;
  name: string;
  mobile?: string;
  image?: string;
  location?: {
    coordinates?: [number, number];
  };
  isOnline?: boolean;
}

interface IOrderItem {
  _id?: string;
  name: string;
  price: string;
  unit: string;
  image: string;
  quantity: number;
}

interface IOrderDetails {
  _id: string;
  items: IOrderItem[];
  totalAmount: string;
  paymentMethod: string;
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
  assignedDeliveryBoy?: IDeliveryBoy | null;
  status: "pending" | "out of delivery" | "delivered" | string;
  createdAt: string;
}

export default function TrackOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const router = useRouter();

  const [order, setOrder] = useState<IOrderDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await axios.get(`/api/auth/user/track-order/${orderId}`);
        if (res.data?.success && res.data?.order) {
          setOrder(res.data.order);
          if (res.data.order.assignedDeliveryBoy?.location?.coordinates) {
            const [lng, lat] =
              res.data.order.assignedDeliveryBoy.location.coordinates;
            setDriverLocation({ lat, lng });
          }
        }
      } catch (error) {
        console.error("Fetch track order error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Real-time socket listener for order status and driver location updates
  useEffect(() => {
    const socket = getSocket();

    const handleStatusUpdate = (data: {
      orderId: string;
      status: string;
      assignedDeliveryBoy?: IDeliveryBoy;
    }) => {
      if (data.orderId === orderId) {
        setOrder((prev) =>
          prev
            ? {
                ...prev,
                status: data.status,
                ...(data.assignedDeliveryBoy
                  ? { assignedDeliveryBoy: data.assignedDeliveryBoy }
                  : {}),
              }
            : prev
        );
      }
    };

    const handleLocationUpdate = (data: {
      userId: string;
      latitude: number;
      longitude: number;
    }) => {
      if (
        order?.assignedDeliveryBoy &&
        order.assignedDeliveryBoy._id === data.userId
      ) {
        setDriverLocation({ lat: data.latitude, lng: data.longitude });
      }
    };

    socket?.on("order-status-update", handleStatusUpdate);
    socket?.on("update-location", handleLocationUpdate);

    return () => {
      socket?.off("order-status-update", handleStatusUpdate);
      socket?.off("update-location", handleLocationUpdate);
    };
  }, [orderId, order?.assignedDeliveryBoy]);

  const getStatusStep = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return 3;
      case "out of delivery":
      case "out_of_delivery":
        return 2;
      default:
        return 1;
    }
  };

  const currentStep = getStatusStep(order?.status);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="animate-spin text-emerald-700" />
        <p className="text-slate-500 font-medium text-sm">
          Loading live tracking details...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mb-4">
          <Package size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Order Not Found
        </h2>
        <p className="text-slate-500 text-sm mb-6 max-w-sm">
          We couldn&apos;t load the tracking information for this order.
        </p>
        <button
          onClick={() => router.push("/user/my-orders")}
          className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  const isOutOfDelivery =
    order.status?.toLowerCase() === "out of delivery" ||
    order.status?.toLowerCase() === "out_of_delivery";

  if (!isOutOfDelivery) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-700 mb-4 border border-amber-200 shadow-xs">
          <Clock size={32} />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">
          Live Tracking Unavailable
        </h2>
        <p className="text-slate-500 text-sm mb-6 max-w-md leading-relaxed">
          Live tracking is only accessible when your order is{" "}
          <strong className="text-emerald-700 font-bold">Out for Delivery</strong>.
          <br />
          Current Order Status:{" "}
          <span className="capitalize font-extrabold text-slate-800">
            {order.status}
          </span>
        </p>
        <button
          onClick={() => router.push("/user/my-orders")}
          className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-md cursor-pointer transition-all"
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="w-[92%] md:w-[80%] max-w-4xl mx-auto pt-20 sm:pt-24 pb-8 min-h-[85vh] space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-bold text-sm cursor-pointer transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to My Orders</span>
        </button>

        <span className="px-3.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
          Order #{order._id.slice(-6).toUpperCase()}
        </span>
      </div>

      {/* Hero Tracking Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-emerald-800 to-teal-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-6"
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-emerald-200 mb-3 border border-white/15">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Tracking Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {currentStep === 3
                ? "Order Delivered 🎉"
                : currentStep === 2
                ? "Out for Delivery 🚚"
                : "Order Placed & Preparing 📦"}
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
              {currentStep === 3
                ? "Your order has been successfully delivered."
                : currentStep === 2
                ? "Your delivery partner is on the way with your order."
                : "Your order has been received and is being packed."}
            </p>
          </div>

          <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-right shrink-0">
            <p className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">
              Est. Delivery Time
            </p>
            <p className="text-lg font-extrabold text-white">
              {currentStep === 3 ? "Delivered" : "20 - 30 Mins"}
            </p>
          </div>
        </div>

        {/* Visual Progress Stepper */}
        <div className="relative z-10 pt-4 border-t border-white/15 grid grid-cols-3 gap-2 text-center text-xs">
          {/* Step 1 */}
          <div className="space-y-2">
            <div
              className={`w-10 h-10 mx-auto rounded-2xl flex items-center justify-center font-bold shadow-md transition-all ${
                currentStep >= 1
                  ? "bg-white text-emerald-800"
                  : "bg-white/20 text-white/60"
              }`}
            >
              <CheckCircle2 size={20} />
            </div>
            <p className="font-bold text-white text-[11px] sm:text-xs">
              Order Placed
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <div
              className={`w-10 h-10 mx-auto rounded-2xl flex items-center justify-center font-bold shadow-md transition-all ${
                currentStep >= 2
                  ? "bg-white text-emerald-800"
                  : "bg-white/20 text-white/60"
              }`}
            >
              <Truck size={20} />
            </div>
            <p
              className={`font-bold text-[11px] sm:text-xs ${
                currentStep >= 2 ? "text-white" : "text-white/60"
              }`}
            >
              Out for Delivery
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <div
              className={`w-10 h-10 mx-auto rounded-2xl flex items-center justify-center font-bold shadow-md transition-all ${
                currentStep === 3
                  ? "bg-white text-emerald-800"
                  : "bg-white/20 text-white/60"
              }`}
            >
              <Package size={20} />
            </div>
            <p
              className={`font-bold text-[11px] sm:text-xs ${
                currentStep === 3 ? "text-white" : "text-white/60"
              }`}
            >
              Delivered
            </p>
          </div>
        </div>
      </motion.div>

      {/* Interactive OpenStreetMap Live Map (Only displayed when order is Out for Delivery) */}
      {(order.status?.toLowerCase() === "out of delivery" ||
        order.status?.toLowerCase() === "out_of_delivery") && (
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
            driverName={order.assignedDeliveryBoy?.name || "Delivery Partner"}
            fullAddress={order.address?.fullAddress}
          />
        </motion.div>
      )}

      {/* Main Grid: Partner & Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Partner Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Truck size={18} className="text-emerald-700" />
              <span>Delivery Partner</span>
            </h3>
            {order.assignedDeliveryBoy && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Assigned
              </span>
            )}
          </div>

          {order.assignedDeliveryBoy ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-emerald-600 to-teal-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shrink-0">
                  {order.assignedDeliveryBoy.name?.charAt(0).toUpperCase() ||
                    "D"}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    {order.assignedDeliveryBoy.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Verified Snapcart Delivery Partner
                  </p>
                </div>
              </div>

              {order.assignedDeliveryBoy.mobile && (
                <a
                  href={`tel:${order.assignedDeliveryBoy.mobile}`}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Phone size={15} />
                  <span>Call {order.assignedDeliveryBoy.name}</span>
                </a>
              )}

              {driverLocation && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <p className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Navigation size={13} className="text-emerald-700 animate-pulse" />
                    <span>Live GPS Position Signal</span>
                  </p>
                  <p className="text-slate-500 pl-4 font-mono text-[11px]">
                    Lat: {driverLocation.lat.toFixed(5)}, Lng:{" "}
                    {driverLocation.lng.toFixed(5)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Clock size={24} />
              </div>
              <p className="text-xs font-bold text-slate-700">
                Assigning Nearest Delivery Partner
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                A delivery partner will accept your order shortly. Live partner details will appear here automatically.
              </p>
            </div>
          )}
        </motion.div>

        {/* Delivery Address & Location Card */}
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
              <p className="font-extrabold text-slate-900 text-sm">
                {order.address?.fullName}
              </p>
              <p className="text-slate-600 leading-relaxed font-semibold">
                {order.address?.fullAddress}
              </p>
              <p className="text-slate-500">
                {order.address?.city}, {order.address?.state} -{" "}
                {order.address?.pincode}
              </p>
              <p className="text-slate-500 pt-1 font-semibold flex items-center gap-1.5">
                <Phone size={12} className="text-slate-400" />
                <span>{order.address?.mobile}</span>
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
            <span>Ordered Items ({order.items.length})</span>
          </h3>
          <span className="font-extrabold text-slate-900 text-base">
            Total: ₹{order.totalAmount}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {order.items.map((item, idx) => (
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
    </div>
  );
}
