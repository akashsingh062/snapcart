"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  Package,
  PackageX,
  Search,
  Truck,
} from "lucide-react";
import axios from "axios";
import AdminOrderCard, { IOrder, IUserRef } from "@/components/AdminOrderCard";
import { getSocket } from "@/lib/socket";

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
  useEffect(() => {
    const socket = getSocket();
    const handleNewOrder = (newOrder: IOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
    };

    const handleStatusUpdate = (data: {
      orderId: string;
      status: string;
      isPaid?: boolean;
      assignedDeliveryBoy?: IUserRef | string;
    }) => {
      setOrders((prev) =>
        prev.map((ord) =>
          String(ord._id) === String(data.orderId)
            ? {
                ...ord,
                status: data.status,
                isPaid:
                  data.isPaid !== undefined
                    ? data.isPaid
                    : data.status?.toLowerCase() === "delivered"
                    ? true
                    : ord.isPaid,
                ...(data.assignedDeliveryBoy
                  ? { assignedDeliveryBoy: data.assignedDeliveryBoy }
                  : {}),
              }
            : ord
        )
      );
    };

    socket?.on("new-order", handleNewOrder);
    socket?.on("order-status-update", handleStatusUpdate);

    return () => {
      socket?.off("new-order", handleNewOrder);
      socket?.off("order-status-update", handleStatusUpdate);
    };
  }, []);
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await axios.post(`/api/auth/admin/update-order-status/${orderId}`, {
        status: newStatus,
      });
      console.log(res)
      setOrders((prev) =>
        prev.map((ord) => (ord._id === orderId ? { ...ord, status: newStatus } : ord))
      );
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
            <AdminOrderCard
              key={order._id}
              order={order}
              updatingId={updatingId}
              handleTogglePayment={handleTogglePayment}
              handleUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
