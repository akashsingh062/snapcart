"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Loader2,
  MapPin,
  Package,
  PackageX,
  Phone,
  Search,
  Truck,
  User as UserIcon,
} from "lucide-react";
import Image from "next/image";
import axios from "axios";

interface IOrderItem {
  _id?: string;
  grocery: string;
  name: string;
  price: string;
  unit: string;
  image: string;
  quantity: number;
}

interface IUserRef {
  _id: string;
  name?: string;
  email?: string;
  mobile?: string;
}

interface IOrder {
  _id: string;
  user?: IUserRef | null;
  items: IOrderItem[];
  isPaid?: boolean;
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

export default function ManageOrders() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/api/auth/admin/get-orders");
        if (isMounted && res.data?.success && res.data?.orders) {
          setOrders(res.data.orders);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchOrders();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await axios.patch("/api/auth/admin/get-orders", {
        orderId,
        status: newStatus,
      });
      if (res.data?.success && res.data?.order) {
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? res.data.order : ord))
        );
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTogglePayment = async (orderId: string, currentIsPaid: boolean) => {
    setUpdatingId(orderId);
    try {
      const res = await axios.patch("/api/auth/admin/get-orders", {
        orderId,
        isPaid: !currentIsPaid,
      });
      if (res.data?.success && res.data?.order) {
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? res.data.order : ord))
        );
      }
    } catch (error) {
      console.error("Failed to update payment status:", error);
      alert("Failed to update payment status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" ||
      order.status.toLowerCase() === statusFilter.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      order._id.toLowerCase().includes(query) ||
      order.address?.fullName?.toLowerCase().includes(query) ||
      order.address?.mobile?.includes(query) ||
      order.address?.fullAddress?.toLowerCase().includes(query) ||
      order.user?.name?.toLowerCase().includes(query) ||
      order.user?.email?.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.status.toLowerCase() === "pending"
  ).length;
  const outOfDeliveryOrders = orders.filter(
    (o) =>
      o.status.toLowerCase() === "out of delivery" ||
      o.status.toLowerCase() === "out_of_delivery"
  ).length;
  const deliveredOrders = orders.filter(
    (o) => o.status.toLowerCase() === "delivered"
  ).length;
  const totalRevenue = orders.reduce(
    (acc, o) => acc + (Number(o.totalAmount) || 0),
    0
  );

  return (
    <div className="w-[94%] md:w-[88%] mx-auto py-10 min-h-[85vh]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-green-700 tracking-tight flex items-center gap-3">
            <Package size={32} /> Admin Manage Orders
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor, update order statuses, and manage customer shipments
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0">
            <Package size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Orders</p>
            <p className="text-xl font-bold text-gray-900">{totalOrders}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Pending</p>
            <p className="text-xl font-bold text-gray-900">{pendingOrders}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Truck size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Out for Delivery</p>
            <p className="text-xl font-bold text-gray-900">{outOfDeliveryOrders}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Delivered</p>
            <p className="text-xl font-bold text-gray-900">{deliveredOrders}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Revenue</p>
            <p className="text-xl font-bold text-gray-900">₹{totalRevenue}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, Customer, Phone, City..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-green-600 shadow-xs"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
          {["all", "pending", "out of delivery", "delivered"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200 cursor-pointer shrink-0 ${
                statusFilter === tab
                  ? "bg-green-700 text-white shadow-md shadow-green-700/20"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={36} className="animate-spin text-green-700" />
          <p className="text-gray-500 font-medium text-sm">Loading admin orders...</p>
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
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Matching Orders</h3>
          <p className="text-gray-500 text-sm">
            Try adjusting your search query or status filter.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg space-y-4"
            >
              {/* Top Row: Order ID, Date, Status Selector & Payment Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-green-700 text-white flex items-center justify-center shadow-md shrink-0">
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

                {/* Status Selector & Payment Status Pill */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Payment Status Toggle */}
                  <button
                    onClick={() => handleTogglePayment(order._id, !!order.isPaid)}
                    disabled={updatingId === order._id}
                    title="Click to toggle payment status"
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      order.isPaid
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-amber-100 text-amber-800 border-amber-200"
                    }`}
                  >
                    {updatingId === order._id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : order.isPaid ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <Clock size={13} />
                    )}
                    <span>{order.isPaid ? "Paid" : "Unpaid (Click to Pay)"}</span>
                  </button>

                  {/* Order Status Selector */}
                  <div className="relative">
                    <select
                      value={order.status.toLowerCase()}
                      disabled={updatingId === order._id}
                      onChange={(e) =>
                        handleUpdateStatus(order._id, e.target.value)
                      }
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer border focus:outline-none capitalize shadow-xs transition-all ${
                        order.status.toLowerCase() === "delivered"
                          ? "bg-green-700 text-white border-green-800"
                          : order.status.toLowerCase() === "out of delivery" ||
                            order.status.toLowerCase() === "out_of_delivery"
                          ? "bg-amber-500 text-white border-amber-600"
                          : "bg-blue-600 text-white border-blue-700"
                      }`}
                    >
                      <option value="pending" className="bg-white text-gray-900">
                        Pending
                      </option>
                      <option value="out of delivery" className="bg-white text-gray-900">
                        Out of Delivery
                      </option>
                      <option value="delivered" className="bg-white text-gray-900">
                        Delivered
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Customer & Address Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                {/* Customer info */}
                <div className="space-y-1.5">
                  <p className="font-bold text-gray-900 flex items-center gap-1.5">
                    <UserIcon size={14} className="text-green-700" />
                    <span>Customer Details:</span>
                  </p>
                  <p className="text-gray-700 font-semibold pl-5">
                    {order.address?.fullName || order.user?.name || "N/A"}
                  </p>
                  <p className="text-gray-500 flex items-center gap-1.5 pl-5">
                    <Phone size={12} className="text-gray-400" />
                    {order.address?.mobile || order.user?.mobile || "N/A"}
                  </p>
                </div>

                {/* Address info */}
                <div className="space-y-1.5 border-t md:border-t-0 pt-2 md:pt-0 border-gray-200">
                  <p className="font-bold text-gray-900 flex items-center gap-1.5">
                    <MapPin size={14} className="text-green-700" />
                    <span>Delivery Address:</span>
                  </p>
                  <p className="text-gray-600 pl-5">
                    {order.address?.fullAddress}, {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                  </p>
                </div>
              </div>

              {/* Order Items List */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Ordered Items ({order.items.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-gray-100 shadow-2xs"
                    >
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-200 bg-gray-50">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-gray-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Qty: <span className="font-bold text-green-700">{item.quantity}</span> • ₹{item.price}
                        </p>
                      </div>
                      <span className="font-bold text-xs text-gray-900 shrink-0">
                        ₹{Number(item.price) * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary & Payment Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-700 font-semibold bg-gray-100 px-3 py-1.5 rounded-xl">
                  {order.paymentMethod?.toLowerCase() === "cod" ? (
                    <>
                      <Banknote size={15} className="text-green-700" /> Cash on Delivery (COD)
                    </>
                  ) : (
                    <>
                      <CreditCard size={15} className="text-blue-600" /> Online Payment
                    </>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-[11px] text-gray-400 font-medium uppercase">Total Amount</p>
                  <p className="text-xl font-extrabold text-green-700">₹{order.totalAmount}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
