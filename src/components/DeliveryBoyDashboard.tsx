"use client";

import { IDeliveryAssignment } from "@/models/deliveryAssignment.modal";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import Link from "next/link";
import {
  Package,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  RefreshCw,
  Truck,
  CreditCard,
  Banknote,
  User,
  X,
  ShoppingBag,
  Loader2,
} from "lucide-react";

interface PopulatedOrder {
  _id: string;
  items?: Array<{
    name: string;
    price: string;
    unit?: string;
    image?: string;
    quantity: number;
  }>;
  totalAmount?: string;
  paymentMethod?: "cod" | "online" | string;
  isPaid?: boolean;
  address?: {
    fullName?: string;
    mobile?: string;
    city?: string;
    state?: string;
    pincode?: string;
    fullAddress: string;
    latitude?: number;
    longitude?: number;
  };
  status?: string;
  createdAt?: string;
}

interface PopulatedAssignment extends Omit<IDeliveryAssignment, "order" | "createdAt"> {
  _id: string;
  order: PopulatedOrder;
  status: "broadcasted" | "assigned" | "completed";
  createdAt?: string;
}

const DeliveryBoyDashboard = () => {
  const [assignments, setAssignments] = useState<PopulatedAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchAssignments = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await axios.get("/api/auth/delivery/get-assignments");
      if (result.data?.success && Array.isArray(result.data.assignments)) {
        setAssignments(result.data.assignments);
      } else if (Array.isArray(result.data)) {
        setAssignments(result.data);
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error("Fetch assignments error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadInitialAssignments = async () => {
      try {
        const result = await axios.get("/api/auth/delivery/get-assignments");
        if (isMounted) {
          if (result.data?.success && Array.isArray(result.data.assignments)) {
            setAssignments(result.data.assignments);
          } else if (Array.isArray(result.data)) {
            setAssignments(result.data);
          } else {
            setAssignments([]);
          }
        }
      } catch (error) {
        console.error("Fetch assignments error:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialAssignments();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const handleNewAssignment = (newAssignment: PopulatedAssignment) => {
      console.log("⚡ [Delivery Dashboard] New assignment received:", newAssignment);
      if (!newAssignment || !newAssignment._id) return;
      setAssignments((prev) => {
        if (prev.some((a) => String(a._id) === String(newAssignment._id))) return prev;
        return [newAssignment, ...prev];
      });
    };

    socket?.on("new-assignment", handleNewAssignment);

    return () => {
      socket?.off("new-assignment", handleNewAssignment);
    };
  }, []);

  const handleAccept = async (id: string) => {
    setAcceptingId(id);
    try {
      const res = await axios.get(`/api/auth/delivery/assignment/${id}/accept-assignment`);
      if (res.data?.success) {
        alert(res.data.message || "Assignment accepted successfully! 🚀");
        setAssignments((prev) => prev.filter((a) => String(a._id) !== String(id)));
      } else {
        alert(res.data?.message || "Could not accept assignment");
      }
    } catch (error: unknown) {
      console.error("Accept assignment error:", error);
      const errObj = error as { response?: { data?: { message?: string } }; message?: string };
      const errMsg = errObj.response?.data?.message || errObj.message || "Failed to accept assignment";
      alert(errMsg);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.post("/api/auth/delivery/reject-assignment", { assignmentId: id });
    } catch {
      // optimistic state removal
    }
    setAssignments((prev) => prev.filter((a) => a._id !== id));
  };

  const totalCodCash = assignments
    .filter((a) => a.order?.paymentMethod?.toLowerCase() === "cod")
    .reduce((acc, a) => acc + (parseFloat(a.order?.totalAmount || "0") || 0), 0);

  return (
    <div className="w-full min-h-screen bg-slate-50/70 pt-28 sm:pt-29 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Hero Banner */}
        <div className="bg-linear-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-emerald-900/10 border border-emerald-600/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 text-emerald-300 text-xs font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Delivery Partner Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Delivery Assignments
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm">
              Review and accept order delivery requests in your area.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <Link href="/delivery/current-order">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 active:scale-95 transition-all text-xs font-extrabold shadow-md cursor-pointer">
                <Truck size={15} />
                <span>Active Delivery Task</span>
              </button>
            </Link>

            <button
              onClick={() => fetchAssignments(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-xs font-bold border border-white/20 backdrop-blur-md cursor-pointer"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              <span>{refreshing ? "Refreshing..." : "Refresh Requests"}</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pending Requests
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {assignments.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Est. COD Cash
            </p>
            <p className="text-2xl font-black text-amber-600 mt-1">
              ₹{totalCodCash}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Status
              </p>
              <p className="text-xs font-extrabold text-emerald-600 mt-1 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Ready for Delivery
              </p>
            </div>
          </div>
        </div>

        {/* Assignments List Section */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="h-5 w-28 bg-slate-200 rounded-md" />
                  <div className="h-6 w-20 bg-slate-200 rounded-full" />
                </div>
                <div className="h-12 bg-slate-100 rounded-2xl" />
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/70 shadow-xs space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Truck size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No Delivery Broadcasts Right Now
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You are all caught up! New order delivery requests in your area will appear here automatically.
            </p>
            <button
              onClick={() => fetchAssignments(true)}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              Check Again
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
              Active Delivery Orders ({assignments.length})
            </h2>

            {assignments.map((a, index) => {
              const order = a.order;
              const isCOD = order?.paymentMethod?.toLowerCase() === "cod";

              return (
                <div
                  key={a._id?.toString() || index}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 space-y-4"
                >
                  {/* Card Header: Order ID, Date, Payment Tag */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-700/20 shrink-0">
                        <Package size={18} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                          Order #{order?._id?.toString().slice(-6).toUpperCase()}
                        </h3>
                        {order?.createdAt && (
                          <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                            <Clock size={11} />
                            {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border ${
                          isCOD
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}
                      >
                        {isCOD ? (
                          <>
                            <Banknote size={13} className="text-amber-600" />
                            COD (Cash)
                          </>
                        ) : (
                          <>
                            <CreditCard size={13} className="text-emerald-600" />
                            Prepaid Online
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Customer Details & Delivery Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    {/* Customer Info */}
                    <div className="space-y-1.5">
                      <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <User size={12} className="text-emerald-700" /> Customer
                      </p>
                      <p className="font-extrabold text-slate-800">
                        {order?.address?.fullName || "Valued Customer"}
                      </p>
                      {order?.address?.mobile && (
                        <a
                          href={`tel:${order.address.mobile}`}
                          className="inline-flex items-center gap-1.5 text-emerald-700 font-bold hover:underline"
                        >
                          <Phone size={11} />
                          <span>{order.address.mobile}</span>
                        </a>
                      )}
                    </div>

                    {/* Delivery Address & Map Action */}
                    <div className="space-y-1.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/70">
                      <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <MapPin size={12} className="text-emerald-700" /> Delivery Address
                      </p>
                      <p className="text-slate-700 font-medium leading-relaxed">
                        {order?.address?.fullAddress}
                      </p>
                    </div>
                  </div>

                  {/* Order Summary & Footer Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    {order?.totalAmount && (
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5">
                          <ShoppingBag size={14} className="text-emerald-700" />
                          <span>
                            {order.items?.length ? `${order.items.length} Items • ` : ""}
                            Total: <strong className="text-slate-900">₹{order.totalAmount}</strong>
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2.5 ml-auto">
                      <button
                        onClick={() => handleReject(a._id)}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 text-xs font-bold rounded-2xl border border-slate-200 transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <X size={14} />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleAccept(a._id)}
                        disabled={acceptingId === a._id}
                        className="px-5 py-2.5 bg-linear-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 active:scale-95 disabled:opacity-60 text-white text-xs font-extrabold rounded-2xl shadow-md shadow-emerald-700/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        {acceptingId === a._id ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            <span>Accepting...</span>
                          </>
                        ) : (
                          <>
                            <Truck size={15} />
                            <span>Accept Order</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryBoyDashboard;


