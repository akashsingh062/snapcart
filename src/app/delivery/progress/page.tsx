"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Award,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Loader2,
  MapPin,
  PackageCheck,
  RefreshCw,
  Target,
  User,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";

interface IHistoryItem {
  assignmentId: string;
  orderId: string;
  customerName: string;
  customerMobile: string;
  fullAddress: string;
  city: string;
  totalAmount: number;
  paymentMethod: string;
  isPaid: boolean;
  completedAt: string;
  earning: number;
}

interface IProgressMetrics {
  totalCompleted: number;
  completedToday: number;
  totalEarnings: number;
  totalCodCollected: number;
  totalOnlineDelivered: number;
  dailyGoal: number;
  onTimeRate: string;
}

export default function DeliveryProgressPage() {
  const [metrics, setMetrics] = useState<IProgressMetrics | null>(null);
  const [history, setHistory] = useState<IHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filter, setFilter] = useState<"all" | "cod" | "online">("all");

  const fetchProgress = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await axios.get("/api/auth/delivery/progress");
      if (res.data?.success) {
        setMetrics(res.data.metrics);
        setHistory(res.data.history || []);
      }
    } catch (error) {
      console.error("Failed to load progress:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const filteredHistory = history.filter((item) => {
    if (filter === "cod") return item.paymentMethod.toLowerCase() === "cod";
    if (filter === "online") return item.paymentMethod.toLowerCase() !== "cod";
    return true;
  });

  const goalPercent = metrics
    ? Math.min(100, Math.round((metrics.completedToday / metrics.dailyGoal) * 100))
    : 0;

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="animate-spin text-emerald-700" />
        <p className="text-slate-500 font-bold text-sm">
          Loading your delivery performance & earnings...
        </p>
      </div>
    );
  }

  return (
    <div className="w-[95%] sm:w-[90%] md:w-[85%] max-w-6xl mx-auto pt-24 pb-24 space-y-8">
      {/* Top Navigation Bar */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between gap-4"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-emerald-800 font-extrabold text-xs rounded-full border border-slate-200 shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <ArrowLeft size={16} />
          <span>Back to Portal</span>
        </Link>

        <button
          onClick={() => fetchProgress(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-full border border-slate-200 shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin text-emerald-700" : ""} />
          <span>{refreshing ? "Updating..." : "Refresh Stats"}</span>
        </button>
      </motion.div>

      {/* Hero Banner Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden space-y-6"
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-emerald-200 border border-white/15">
              <Award size={14} className="text-amber-400" />
              <span>Partner Performance Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              My Progress & Earnings 🎉
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm max-w-xl">
              Track your completed orders, daily goals, cash collected, and payout history in real time.
            </p>
          </div>

          {/* Completion Rate Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center shrink-0 self-start sm:self-auto space-y-1">
            <p className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">
              Success Rate
            </p>
            <p className="text-xl font-black text-white">
              {metrics?.onTimeRate || "98.5%"}
            </p>
            <p className="text-[10px] text-emerald-200 font-semibold">
              On-Time Delivery
            </p>
          </div>
        </div>

        {/* Daily Goal Bar */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-100">
              <Target size={16} className="text-amber-400" />
              Today&apos;s Target: {metrics?.completedToday || 0} / {metrics?.dailyGoal || 10} Deliveries Completed
            </span>
            <span className="text-amber-300 font-black">
              {goalPercent >= 100
                ? "🎯 Goal Achieved! Extra Bonus Unlocked!"
                : `${metrics ? metrics.dailyGoal - metrics.completedToday : 0} more for Daily Bonus (₹150)`}
            </span>
          </div>

          {/* Progress track */}
          <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goalPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-linear-to-r from-amber-400 to-amber-500 h-full rounded-full shadow-sm"
            />
          </div>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Completed */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-md space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <PackageCheck size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Delivered
            </p>
            <p className="text-3xl font-black text-slate-900 mt-0.5">
              {metrics?.totalCompleted || 0}
            </p>
            <p className="text-xs font-bold text-emerald-600 mt-1">
              +{metrics?.completedToday || 0} completed today
            </p>
          </div>
        </motion.div>

        {/* Card 2: Total Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-md space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Earnings
            </p>
            <p className="text-3xl font-black text-emerald-700 mt-0.5">
              ₹{metrics?.totalEarnings || 0}
            </p>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              ₹50 per delivery payout
            </p>
          </div>
        </motion.div>

        {/* Card 3: Cash Collected (COD) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-md space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Banknote size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              COD Cash Collected
            </p>
            <p className="text-3xl font-black text-slate-900 mt-0.5">
              ₹{metrics?.totalCodCollected || 0}
            </p>
            <p className="text-xs text-amber-700 font-bold mt-1">
              Cash in hand to deposit
            </p>
          </div>
        </motion.div>

        {/* Card 4: Prepaid Online Orders */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-md space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Online Prepaid Delivered
            </p>
            <p className="text-3xl font-black text-slate-900 mt-0.5">
              {metrics?.totalOnlineDelivered || 0}
            </p>
            <p className="text-xs text-blue-600 font-bold mt-1">
              Direct digital payment
            </p>
          </div>
        </motion.div>
      </div>

      {/* Completed Orders History Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-md space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Clock size={20} className="text-emerald-700" />
              <span>Completed Delivery History ({filteredHistory.length})</span>
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Detailed breakdown of all your successfully fulfilled orders.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("cod")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filter === "cod"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              COD
            </button>
            <button
              onClick={() => setFilter("online")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filter === "online"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Online
            </button>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 size={30} />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No Completed Deliveries Yet
            </h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              Accept orders from your portal and complete deliveries to see your history and earnings list grow!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <div
                key={item.assignmentId}
                className="bg-slate-50/70 border border-slate-200/70 hover:border-emerald-200 rounded-2xl p-4 sm:p-5 transition-all space-y-3 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-extrabold text-slate-900 text-sm">
                      Order #{item.orderId.slice(-6).toUpperCase()}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                      <CheckCircle2 size={11} /> Delivered
                    </span>
                  </div>

                  <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                    <Calendar size={13} className="text-slate-400" />
                    {item.completedAt
                      ? new Date(item.completedAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Recently"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Customer Info */}
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 flex items-center gap-1">
                      <User size={13} className="text-emerald-700" />
                      <span>{item.customerName}</span>
                    </p>
                    <p className="text-slate-500 pl-4 font-mono text-[11px]">
                      📞 {item.customerMobile}
                    </p>
                  </div>

                  {/* Address */}
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 flex items-center gap-1">
                      <MapPin size={13} className="text-emerald-700" />
                      <span>Delivery Address</span>
                    </p>
                    <p className="text-slate-600 pl-4 line-clamp-1">
                      {item.fullAddress}
                    </p>
                  </div>

                  {/* Payment & Earning */}
                  <div className="sm:text-right space-y-1">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-200/80 text-slate-800">
                      {item.paymentMethod.toLowerCase() === "cod" ? (
                        <>
                          <Banknote size={12} className="text-emerald-700" />
                          <span>COD: ₹{item.totalAmount}</span>
                        </>
                      ) : (
                        <>
                          <CreditCard size={12} className="text-blue-600" />
                          <span>Prepaid Online: ₹{item.totalAmount}</span>
                        </>
                      )}
                    </div>
                    <p className="text-emerald-700 font-extrabold text-xs">
                      Payout Earned: +₹{item.earning}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
