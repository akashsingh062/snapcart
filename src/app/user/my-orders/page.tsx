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
      } catch (error) {
        console.error("Failed to fetch orders:", error);
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
          <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
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
      default:
        return (
          <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <Clock size={14} /> Order Placed
          </span>
        );
    }
  };

  return (
    <div className="w-[92%] md:w-[80%] mx-auto py-10 relative min-h-[85vh]">
      {/* Back Button */}
      <motion.div
        whileTap={{ scale: 0.97 }}
        onClick={() => router.back()}
        className="flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold cursor-pointer mb-6 w-fit"
      >
        <ArrowLeft size={18} />
        Back
      </motion.div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-green-700 tracking-tight flex items-center gap-3">
            <Package size={32} /> My Orders
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track and view details of all your previous orders
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {["all", "pending", "out of delivery", "delivered"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200 cursor-pointer shrink-0 ${
                activeTab === tab
                  ? "bg-green-700 text-white shadow-md shadow-green-700/20"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
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
          <Loader2 size={36} className="animate-spin text-green-700" />
          <p className="text-gray-500 font-medium text-sm">Fetching your orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-700">
            <PackageX size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-500 text-sm mb-6">
            {activeTab === "all"
              ? "You haven't placed any orders yet."
              : `No orders found with status "${activeTab}".`}
          </p>
          <Link href="/">
            <button className="bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mx-auto cursor-pointer">
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
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 space-y-4"
            >
              {/* Order Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-green-700 text-white flex items-center justify-center shadow-md">
                    <Package size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
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
                    order.status?.toLowerCase() === "out_of_delivery") && (
                    <Link href={`/user/track-order/${order._id}`}>
                      <button className="px-3.5 py-1.5 bg-linear-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95">
                        <Navigation size={13} />
                        <span>Track Order</span>
                      </button>
                    </Link>
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
                    className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50 border border-gray-100"
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-200 bg-white">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Qty: <span className="font-bold text-green-700">{item.quantity}</span> • ₹{item.price} each
                      </p>
                    </div>
                    <span className="font-bold text-sm text-gray-900 shrink-0">
                      ₹{Number(item.price) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Footer Info */}
              <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-2 text-xs text-gray-600 max-w-md">
                  <MapPin size={16} className="text-green-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900">Delivery Address: </span>
                    <span>
                      {order.address?.fullAddress}, {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                  <div className="text-xs flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-xl font-semibold text-gray-700">
                    {order.paymentMethod?.toLowerCase() === "cod" ? (
                      <>
                        <Banknote size={14} className="text-green-700" /> COD
                      </>
                    ) : (
                      <>
                        <CreditCard size={14} className="text-blue-600" /> Paid Online
                      </>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-gray-400 font-medium uppercase">Total Paid</p>
                    <p className="text-xl font-extrabold text-green-700">₹{order.totalAmount}</p>
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