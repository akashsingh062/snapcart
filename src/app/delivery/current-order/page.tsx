"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  CheckCircle2,
  Key,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User as UserIcon,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import LiveTrackingMap from "@/components/LiveTrackingMap";
import { getSocket } from "@/lib/socket";
import DeliveryChat from "@/components/DeliveryChat";

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
  assignedTo?: string | { _id?: string; name?: string };
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
  const [showChatModal, setShowChatModal] = useState<boolean>(false);
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [sendOtpSuccess, setSendOtpSuccess] = useState<string>("");

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
      () => {},
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
      } catch {
        // Failed to fetch current order
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCurrentOrder();
    return () => {
      isMounted = false;
    };
  }, []);

  const openOtpModal = () => {
    setOtpInput("");
    setOtpError("");
    setSendOtpSuccess("");
    setShowOtpModal(true);
  };

  const handleVerifyAndCompleteDelivery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!assignment || !assignment.order) return;
    if (!otpInput || otpInput.trim().length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP code");
      return;
    }

    setCompleting(true);
    setOtpError("");
    try {
      // Step 1: Verify OTP
      const verifyRes = await axios.post("/api/auth/delivery/otp/verify", {
        orderId: assignment.order._id,
        otp: otpInput.trim(),
      });

      if (!verifyRes.data?.success) {
        setOtpError(verifyRes.data?.message || "Invalid OTP. Please check with customer.");
        setCompleting(false);
        return;
      }

      // Step 2: Complete Assignment
      let res;
      try {
        res = await axios.post("/api/auth/delivery/complete-assignment", {
          assignmentId: assignment._id,
          otp: otpInput.trim(),
        });
      } catch {
        res = await axios.post(
          `/api/auth/delivery/assignment/${assignment._id}/complete-assignment`,
          { otp: otpInput.trim() }
        );
      }

      if (res.data?.success) {
        setShowOtpModal(false);
        alert("🎉 Order verified and marked as Delivered successfully!");
        setAssignment(null);
        router.push("/");
      } else {
        setOtpError(res.data?.message || "Could not mark order as delivered.");
      }
    } catch (error: unknown) {
      const errObj = error as { response?: { data?: { message?: string } }; message?: string };
      setOtpError(
        errObj.response?.data?.message ||
          errObj.message ||
          "Failed to verify OTP & complete delivery."
      );
    } finally {
      setCompleting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!assignment || !assignment.order) return;
    setSendingOtp(true);
    setSendOtpSuccess("");
    setOtpError("");
    try {
      const res = await axios.post("/api/auth/delivery/otp/send", {
        orderId: assignment.order._id,
      });
      if (res.data?.success) {
        setSendOtpSuccess("New OTP sent to customer's registered email!");
      } else {
        setOtpError(res.data?.message || "Failed to resend OTP.");
      }
    } catch (error: unknown) {
      const errObj = error as { response?: { data?: { message?: string } }; message?: string };
      setOtpError(errObj.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-2">
        <Loader2 size={24} className="animate-spin text-slate-400" />
        <p className="text-slate-400 text-sm">Loading active delivery...</p>
      </div>
    );
  }

  if (!assignment || !assignment.order) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <Truck size={32} className="text-slate-300 mb-4" />
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          No Active Delivery
        </h2>
        <p className="text-slate-400 text-sm mb-6 max-w-sm">
          You don&apos;t have any orders assigned right now.
        </p>
        <Link href="/">
          <button className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg cursor-pointer transition-colors">
            Go to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  const order = assignment.order;
  const isCod = order.paymentMethod?.toLowerCase() === "cod";

  return (
    <div className="w-[95%] max-w-3xl mx-auto pt-18 pb-8 space-y-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </Link>

        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-md border border-amber-100 flex items-center gap-1.5">
          <Truck size={13} />
          Active Delivery
        </span>
      </div>

      {/* Order Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Order #{order._id.slice(-6).toUpperCase()}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className={`px-3 py-1.5 rounded-lg border text-right ${
          isCod
            ? "bg-amber-50 border-amber-200 text-amber-800"
            : "bg-emerald-50 border-emerald-200 text-emerald-800"
        }`}>
          <p className="text-[10px] font-medium uppercase">{isCod ? "Collect Cash" : "Prepaid"}</p>
          <p className="text-sm font-bold">
            {isCod ? `₹${order.totalAmount}` : "Paid Online"}
          </p>
        </div>
      </div>

      {/* Map */}
      <div className="w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-slate-200">
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
      </div>

      {/* Customer & Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
          <h3 className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <UserIcon size={14} /> Customer
          </h3>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {order.address?.fullName || order.user?.name || "Customer"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {order.address?.mobile || order.user?.mobile || "N/A"}
            </p>
          </div>
          <div className="flex gap-2">
            {(order.address?.mobile || order.user?.mobile) && (
              <a
                href={`tel:${order.address?.mobile || order.user?.mobile}`}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone size={13} /> Call
              </a>
            )}
            <button
              type="button"
              onClick={() => setShowChatModal(true)}
              className="flex-1 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageSquare size={13} /> Chat
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
          <h3 className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <MapPin size={14} /> Delivery Address
          </h3>
          <p className="text-sm text-slate-800 leading-relaxed">
            {order.address?.fullAddress}
          </p>
          <p className="text-xs text-slate-500">
            {order.address?.city}, {order.address?.state} - {order.address?.pincode}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <ShoppingBag size={14} /> Items ({order.items?.length || 0})
          </h3>
          <span className="text-sm font-semibold text-slate-900">
            ₹{order.totalAmount}
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {order.items?.map((item, idx) => (
            <div key={idx} className="px-4 py-2.5 flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-white">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                <p className="text-xs text-slate-400">{item.quantity} × ₹{item.price}</p>
              </div>
              <span className="text-sm font-semibold text-slate-900 shrink-0">
                ₹{Number(item.price) * item.quantity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Delivery */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 text-center space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Ready to complete delivery?
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Ensure all items are handed over and payment collected (if COD).
        </p>
        <button
          onClick={openOtpModal}
          disabled={completing}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2"
        >
          <Key size={16} />
          Verify OTP & Complete
        </button>
      </div>

      {/* OTP Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl border border-slate-200 relative space-y-5"
            >
              <button
                onClick={() => setShowOtpModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="text-center space-y-1.5">
                <ShieldCheck size={24} className="text-emerald-600 mx-auto" />
                <h3 className="text-base font-semibold text-slate-900">OTP Verification</h3>
                <p className="text-xs text-slate-400">
                  Enter the 6-digit code from the customer
                </p>
              </div>

              <form onSubmit={handleVerifyAndCompleteDelivery} className="space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value.replace(/\D/g, ""));
                    setOtpError("");
                  }}
                  placeholder="000000"
                  autoFocus
                  className="w-full py-3 px-4 text-center text-xl font-mono font-bold tracking-[0.4em] bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg outline-hidden transition-colors text-slate-900 placeholder:text-slate-300"
                />

                {otpError && (
                  <p className="text-xs text-rose-600 font-medium text-center bg-rose-50 border border-rose-100 rounded-lg p-2">
                    {otpError}
                  </p>
                )}

                {sendOtpSuccess && (
                  <p className="text-xs text-emerald-700 font-medium text-center bg-emerald-50 border border-emerald-100 rounded-lg p-2">
                    {sendOtpSuccess}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={completing || otpInput.length !== 6}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {completing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Verify & Complete
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Didn&apos;t get code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={sendingOtp}
                  className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {sendingOtp ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Mail size={12} />
                  )}
                  {sendingOtp ? "Sending..." : "Resend OTP"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {showChatModal && order && assignment && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <DeliveryChat
              orderId={order._id}
              userId={order.user && typeof order.user === "object" ? (order.user as { _id?: string })._id || "" : String(order.user || "")}
              deliveryBoyId={assignment.assignedTo && typeof assignment.assignedTo === "object" ? (assignment.assignedTo as { _id?: string })._id || "" : String(assignment.assignedTo || "")}
              currentUserId={assignment.assignedTo && typeof assignment.assignedTo === "object" ? (assignment.assignedTo as { _id?: string })._id || "" : String(assignment.assignedTo || "")}
              recipientName={order.address?.fullName || (typeof order.user === "object" ? (order.user as { name?: string }).name : "") || "Customer"}
              onClose={() => setShowChatModal(false)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
