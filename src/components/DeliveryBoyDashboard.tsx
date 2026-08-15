"use client";

import { IDeliveryAssignment } from "@/models/deliveryAssignment.modal";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { getDistanceKm } from "@/lib/geo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  MapPin,
  Phone,
  Clock,
  RefreshCw,
  Truck,
  CreditCard,
  Banknote,
  User,
  X,
  Loader2,
  Navigation,
  TrendingUp,
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
  const router = useRouter();
  const [assignments, setAssignments] = useState<PopulatedAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setMyLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {},
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

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
    } catch {
      // Failed to fetch assignments
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
      } catch {
        // Failed to fetch assignments
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
      if (!newAssignment || !newAssignment._id) return;

      if (myLocation && newAssignment.order?.address) {
        const dist = getDistanceKm(
          myLocation.lat,
          myLocation.lng,
          newAssignment.order.address.latitude,
          newAssignment.order.address.longitude
        );
        if (dist > 10) return;
      }

      setAssignments((prev) => {
        if (prev.some((a) => String(a._id) === String(newAssignment._id))) return prev;
        return [newAssignment, ...prev];
      });
    };

    socket?.on("new-assignment", handleNewAssignment);

    const handleRemoveAssignment = (data: { assignmentId: string }) => {
      setAssignments((prev) => prev.filter((a) => String(a._id) !== String(data.assignmentId)));
    };

    socket?.on("remove-assignment", handleRemoveAssignment);

    return () => {
      socket?.off("new-assignment", handleNewAssignment);
      socket?.off("remove-assignment", handleRemoveAssignment);
    };
  }, [myLocation]);

  const handleAccept = async (id: string) => {
    setAcceptingId(id);
    try {
      const res = await axios.get(`/api/auth/delivery/assignment/${id}/accept-assignment`);
      if (res.data?.success) {
        alert(res.data.message || "Assignment accepted successfully! 🚀");
        setAssignments((prev) => prev.filter((a) => String(a._id) !== String(id)));
        router.push("/delivery/current-order");
      } else {
        alert(res.data?.message || "Could not accept assignment");
      }
    } catch (error: unknown) {
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
      setAssignments((prev) => prev.filter((a) => String(a._id) !== String(id)));
    } catch {
      // Failed to reject assignment
    }
  };

  return (
    <div className="w-full min-h-screen bg-white pt-20 pb-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Delivery Requests</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {assignments.length} {assignments.length === 1 ? "order" : "orders"} nearby
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/delivery/progress">
              <button className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5">
                <TrendingUp size={14} />
                Progress & Rewards
              </button>
            </Link>
            <Link href="/delivery/current-order">
              <button className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium cursor-pointer hover:bg-slate-800 transition-colors flex items-center gap-1.5">
                <Truck size={14} />
                Active Task
              </button>
            </Link>
            <button
              onClick={() => fetchAssignments(true)}
              disabled={refreshing || loading}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 size={24} className="animate-spin text-slate-400" />
            <p className="text-slate-400 text-sm">Loading assignments...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Package size={32} className="text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-slate-900">No delivery requests</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              New orders in your area will appear here automatically.
            </p>
            <button
              onClick={() => fetchAssignments(true)}
              className="mt-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium cursor-pointer hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              Check again
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((a, index) => {
              const order = a.order;
              const isCOD = order?.paymentMethod?.toLowerCase() === "cod";

              return (
                <div
                  key={a._id?.toString() || index}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors"
                >
                  {/* Card Header */}
                  <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        #{order?._id?.toString().slice(-6).toUpperCase()}
                      </span>
                      {order?.createdAt && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {myLocation && order?.address?.latitude && order?.address?.longitude && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
                          <Navigation size={11} />
                          {getDistanceKm(
                            myLocation.lat,
                            myLocation.lng,
                            order.address.latitude,
                            order.address.longitude
                          ).toFixed(1)} km
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium border flex items-center gap-1 ${
                          isCOD
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}
                      >
                        {isCOD ? <><Banknote size={12} /> COD</> : <><CreditCard size={12} /> Paid</>}
                      </span>
                    </div>
                  </div>

                  {/* Customer & Address */}
                  <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-b border-slate-100">
                    <div className="space-y-1">
                      <p className="text-slate-400 font-medium flex items-center gap-1">
                        <User size={12} /> Customer
                      </p>
                      <p className="font-medium text-slate-900">
                        {order?.address?.fullName || "Customer"}
                      </p>
                      {order?.address?.mobile && (
                        <a
                          href={`tel:${order.address.mobile}`}
                          className="text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          <Phone size={11} />
                          {order.address.mobile}
                        </a>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400 font-medium flex items-center gap-1">
                        <MapPin size={12} /> Delivery
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        {order?.address?.fullAddress}
                      </p>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="text-sm">
                      <span className="text-slate-400 text-xs">
                        {order?.items?.length || 0} items •{" "}
                      </span>
                      <span className="font-semibold text-slate-900">
                        ₹{order?.totalAmount || "0"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(a._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <X size={13} />
                        Skip
                      </button>

                      <button
                        onClick={() => handleAccept(a._id)}
                        disabled={acceptingId === a._id}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        {acceptingId === a._id ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          <>
                            <Truck size={13} />
                            Accept
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
