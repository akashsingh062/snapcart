"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  PackageX,
  ShoppingBag,
  Truck,
  Phone,
  Navigation,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getSocket } from "@/lib/socket";

interface IOrderItem {
  _id?: string;
  grocery: string;
  name: string;
  price: string;
  unit: string;
  image: string;
  quantity: number;
}

export interface IDeliveryBoyRef {
  _id: string;
  name?: string;
  mobile?: string;
  image?: string;
}

interface IOrder {
  _id: string;
  assignedDeliveryBoy?: IDeliveryBoyRef | string | null;
  items: IOrderItem[];
  totalAmount: string;
  paymentMethod: "cod" | "online" | string;
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
  status: "pending" | "out of delivery" | "delivered" | string;
  createdAt: string;
}

const MyOrders = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/api/auth/user/order");
        if (res.data?.orders) {
          setOrders(res.data.orders);
        }
      } catch {
        // Failed to fetch orders
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const handleStatusUpdate = (data: {
      orderId: string;
      status: string;
      assignedDeliveryBoy?: IDeliveryBoyRef | string;
    }) => {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === data.orderId
            ? {
                ...order,
                status: data.status,
                ...(data.assignedDeliveryBoy
                  ? { assignedDeliveryBoy: data.assignedDeliveryBoy }
                  : {}),
              }
            : order
        )
      );
    };

    socket?.on("order-status-update", handleStatusUpdate);

    return () => {
      socket?.off("order-status-update", handleStatusUpdate);
    };
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    return order.status.toLowerCase() === activeTab.toLowerCase();
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return (
          <span className="bg-green-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <CheckCircle2 size={14} /> Delivered
          </span>
        );
      case "out of delivery":
      case "out_of_delivery":
        return (
          <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <Truck size={14} /> Out of Delivery
          </span>
        );
      case "cannot be delivered":
      case "cannot_be_delivered":
        return (
          <span className="bg-rose-100 text-rose-800 border border-rose-200 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <PackageX size={14} /> Cannot be Delivered
          </span>
        );
      default:
        return (
          <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <Clock size={14} /> Order Placed
          </span>
        );
    }
  };

  return (
    <div className="w-[95%] sm:w-[90%] md:w-[85%] max-w-6xl mx-auto pt-28 pb-20 relative min-h-[85vh]">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-all group bg-white px-4 py-2 rounded-full shadow-xs hover:shadow-sm border border-slate-100/50 cursor-pointer"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          <span>Back</span>
        </button>
      </motion.div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
              <Package size={20} />
            </div>
            <span>My Orders</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 ml-13">
            Track and view details of all your previous orders
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {["all", "pending", "out of delivery", "delivered", "cannot be delivered"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all duration-200 cursor-pointer shrink-0 ${
                activeTab === tab
                  ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={36} className="animate-spin text-emerald-700" />
          <p className="text-slate-500 font-medium text-sm">Fetching your orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-md mx-auto"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-700">
            <PackageX size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Orders Found</h3>
          <p className="text-slate-500 text-sm mb-6">
            {activeTab === "all"
              ? "You haven't placed any orders yet."
              : `No orders found with status "${activeTab}".`}
          </p>
          <Link href="/">
            <button className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mx-auto cursor-pointer">
              <ShoppingBag size={18} />
              <span>Start Shopping</span>
            </button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 space-y-4"
            >
              {/* Order Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
                    <Package size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar size={12} />
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  {(order.status?.toLowerCase() === "out of delivery" ||
                    order.status?.toLowerCase() === "out_of_delivery") &&
                    Boolean(order.assignedDeliveryBoy) && (
                      <Link href={`/user/track-order/${order._id}`}>
                        <button className="px-3.5 py-1.5 bg-linear-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95">
                          <Navigation size={13} />
                          <span>Track Order</span>
                        </button>
                      </Link>
                    )}
                  {(order.status?.toLowerCase() === "out of delivery" ||
                    order.status?.toLowerCase() === "out_of_delivery") &&
                    !order.assignedDeliveryBoy && (
                      <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full flex items-center gap-1">
                        <Clock size={13} className="animate-pulse" /> Assigning Nearby Partner...
                      </span>
                    )}
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Delivery Partner Details (if assigned and order not delivered) */}
              {order.assignedDeliveryBoy &&
                typeof order.assignedDeliveryBoy === "object" &&
                order.status?.toLowerCase() !== "delivered" && (
                  <div className="bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        <Truck size={20} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                          Assigned Delivery Partner
                        </p>
                        <p className="text-sm font-extrabold text-slate-900">
                          {order.assignedDeliveryBoy.name || "Delivery Partner"}
                        </p>
                      </div>
                    </div>
                    {order.assignedDeliveryBoy.mobile && (
                      <a
                        href={`tel:${order.assignedDeliveryBoy.mobile}`}
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                      >
                        <Phone size={13} />
                        <span>Call Partner</span>
                      </a>
                    )}
                  </div>
                )}

              {/* Order Items */}
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100"
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-white">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Qty: <span className="font-bold text-emerald-700">{item.quantity}</span> • ₹{item.price} each
                      </p>
                    </div>
                    <span className="font-bold text-sm text-slate-900 shrink-0">
                      ₹{Number(item.price) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Footer Info */}
              <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-2 text-xs text-slate-600 max-w-md">
                  <MapPin size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">Delivery Address: </span>
                    <span>
                      {order.address?.fullAddress}, {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-xs flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl font-semibold text-gray-700">
                    {order.paymentMethod?.toLowerCase() === "cod" ? (
                      <>
                        <Banknote size={14} className="text-emerald-700" /> COD
                      </>
                    ) : (
                      <>
                        <CreditCard size={14} className="text-blue-600" /> Paid Online
                      </>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-400 font-medium uppercase">Total Paid</p>
                    <p className="text-xl font-extrabold text-emerald-700">₹{order.totalAmount}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;