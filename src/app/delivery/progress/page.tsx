"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Banknote,
  Calendar,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Target,
  User,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
    } catch {
      // Failed to load progress
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await axios.get("/api/auth/delivery/progress");
        if (isMounted && res.data?.success) {
          setMetrics(res.data.metrics);
          setHistory(res.data.history || []);
        }
      } catch {
        // Failed to load progress
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const filteredHistory = history.filter((item) => {
    if (filter === "cod") return item.paymentMethod.toLowerCase() === "cod";
    if (filter === "online") return item.paymentMethod.toLowerCase() !== "cod";
    return true;
  });

  const goalPercent = metrics
    ? Math.min(100, Math.round((metrics.completedToday / metrics.dailyGoal) * 100))
    : 0;

  // Build chart data from actual delivery history — group by hour
  const chartData = React.useMemo(() => {
    if (!history.length) return [];

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayDeliveries = history.filter(
      (h) => new Date(h.completedAt) >= todayStart
    );

    // Group into 2-hour buckets across the day
    const buckets: { [key: string]: number } = {};
    const labels = ["6AM", "8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM", "10PM"];
    const hourStarts = [6, 8, 10, 12, 14, 16, 18, 20, 22];

    labels.forEach((l) => { buckets[l] = 0; });

    todayDeliveries.forEach((d) => {
      const h = new Date(d.completedAt).getHours();
      for (let i = hourStarts.length - 1; i >= 0; i--) {
        if (h >= hourStarts[i]) {
          buckets[labels[i]]++;
          break;
        }
      }
    });

    // Cumulative
    let cumulative = 0;
    return labels.map((label) => {
      cumulative += buckets[label];
      return { time: label, deliveries: cumulative };
    });
  }, [history]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-2">
        <Loader2 size={24} className="animate-spin text-slate-400" />
        <p className="text-slate-400 text-sm">Loading progress...</p>
      </div>
    );
  }

  return (
    <div className="w-[95%] max-w-3xl mx-auto pt-20 pb-16 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Progress</h1>
            <p className="text-slate-400 text-sm">Your delivery stats & earnings</p>
          </div>
        </div>
        <button
          onClick={() => fetchProgress(true)}
          disabled={refreshing}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Package size={13} /> Total Delivered
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {metrics?.totalCompleted || 0}
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-0.5">
            +{metrics?.completedToday || 0} today
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <span className="text-xs">₹</span> Total Earnings
          </p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            ₹{metrics?.totalEarnings || 0}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">₹50 per delivery</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Banknote size={13} /> COD Collected
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ₹{metrics?.totalCodCollected || 0}
          </p>
          <p className="text-xs text-amber-600 mt-0.5">Cash to deposit</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <CreditCard size={13} /> Online Orders
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {metrics?.totalOnlineDelivered || 0}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Prepaid deliveries</p>
        </div>
      </div>

      {/* Daily Goal */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
            <Target size={15} className="text-emerald-600" />
            Today&apos;s Goal
          </p>
          <span className="text-xs font-medium text-slate-500">
            {metrics?.completedToday || 0} / {metrics?.dailyGoal || 10}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className="bg-emerald-600 h-2 rounded-full transition-all duration-700"
            style={{ width: `${goalPercent}%` }}
          />
        </div>
        <p className="text-xs text-slate-400">
          {goalPercent >= 100
            ? "Daily goal completed!"
            : `${Math.max(0, (metrics?.dailyGoal || 10) - (metrics?.completedToday || 0))} more for daily target`}
        </p>
      </div>

      {/* Today's Deliveries Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <p className="text-sm font-medium text-slate-900">Today&apos;s delivery timeline</p>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#CBD5E1"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#CBD5E1"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E2E8F0",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,.07)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="deliveries"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#fillGreen)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Delivery History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Completed Orders ({filteredHistory.length})
          </h2>
          <div className="flex items-center gap-1">
            {(["all", "cod", "online"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                  filter === tab
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center border border-slate-200">
            <CheckCircle2 size={28} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-900">No deliveries yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Complete orders to see your history here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredHistory.map((item) => (
              <div
                key={item.assignmentId}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                {/* Order header */}
                <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      #{item.orderId.slice(-6).toUpperCase()}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-0.5">
                      <CheckCircle2 size={10} /> Delivered
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={11} />
                    {item.completedAt
                      ? new Date(item.completedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Recently"}
                  </span>
                </div>

                {/* Details */}
                <div className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-1">
                    <p className="text-slate-900 font-medium flex items-center gap-1">
                      <User size={12} className="text-slate-400" />
                      {item.customerName}
                    </p>
                    {item.customerMobile && item.customerMobile !== "N/A" && (
                      <p className="text-slate-400 flex items-center gap-1">
                        <Phone size={11} />
                        {item.customerMobile}
                      </p>
                    )}
                    <p className="text-slate-400 flex items-center gap-1 line-clamp-1">
                      <MapPin size={11} />
                      {item.fullAddress}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1 shrink-0">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border flex items-center gap-1 ${
                      item.paymentMethod.toLowerCase() === "cod"
                        ? "bg-amber-50 text-amber-700 border-amber-100"
                        : "bg-blue-50 text-blue-700 border-blue-100"
                    }`}>
                      {item.paymentMethod.toLowerCase() === "cod" ? (
                        <><Banknote size={11} /> ₹{item.totalAmount}</>
                      ) : (
                        <><CreditCard size={11} /> Prepaid</>
                      )}
                    </span>
                    <span className="text-emerald-700 font-semibold text-sm">
                      +₹{item.earning}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
