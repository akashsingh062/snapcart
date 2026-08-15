"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
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
      } catch {
        // Failed to fetch orders
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
      if (res.data?.message) {
        alert(res.data.message);
      }
      setOrders((prev) =>
        prev.map((ord) => (ord._id === orderId ? { ...ord, status: newStatus } : ord))
      );
    } catch (error: unknown) {
      const errObj = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const msg =
        errObj.response?.data?.message ||
        errObj.response?.data?.error ||
        errObj.message ||
        "Order cannot be delivered. Failed to update status.";
      alert(`⚠️ ${msg}`);
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
    } catch {
      alert("Failed to update payment status. Please try again.");
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
  const cannotBeDeliveredOrders = orders.filter(
    (o) => o.status.toLowerCase() === "cannot be delivered"
  ).length;

  const tabs = ["all", "pending", "out of delivery", "delivered", "cannot be delivered"];

  return (
    <div className="w-[95%] max-w-5xl mx-auto pt-20 pb-16 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Orders</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Manage and track all customer orders
        </p>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-6 text-sm">
        <span className="text-slate-400">
          Total <span className="font-semibold text-slate-900">{totalOrders}</span>
        </span>
        <span className="text-slate-400">
          Pending <span className="font-semibold text-amber-600">{pendingOrders}</span>
        </span>
        <span className="text-slate-400">
          Active <span className="font-semibold text-blue-600">{outOfDeliveryOrders}</span>
        </span>
        <span className="text-slate-400">
          Delivered <span className="font-semibold text-emerald-700">{deliveredOrders}</span>
        </span>
        {cannotBeDeliveredOrders > 0 && (
          <span className="text-slate-400">
            Failed <span className="font-semibold text-rose-600">{cannotBeDeliveredOrders}</span>
          </span>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:border-slate-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer shrink-0 ${
                statusFilter === tab
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <Loader2 size={24} className="animate-spin text-slate-400" />
          <p className="text-slate-400 text-sm">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <PackageX size={32} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 mb-1">No orders found</h3>
          <p className="text-slate-400 text-sm">
            Try adjusting your search or filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
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
