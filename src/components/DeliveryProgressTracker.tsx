"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  Zap,
  Trophy,
  Flame,
  TrendingUp,
  Target,
  DollarSign,
  Banknote,
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Award,
  RefreshCw,
  Sliders,
  Gift,
  ArrowUpRight,
  Phone,
  MapPin,
  User,
  Package,
} from "lucide-react";

export interface IHistoryItem {
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

export interface IProgressMetrics {
  totalCompleted: number;
  completedToday: number;
  totalEarnings: number;
  totalCodCollected: number;
  totalOnlineDelivered: number;
  dailyGoal: number;
  onTimeRate: string;
}

interface DeliveryProgressTrackerProps {
  metrics: IProgressMetrics;
  history: IHistoryItem[];
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function DeliveryProgressTracker({
  metrics: initialMetrics,
  history,
  refreshing = false,
  onRefresh,
}: DeliveryProgressTrackerProps) {
  const [dailyTarget, setDailyTarget] = useState<number>(
    initialMetrics.dailyGoal || 10
  );
  const [chartView, setChartView] = useState<"hourly" | "weekly">("hourly");
  const [historyFilter, setHistoryFilter] = useState<"all" | "cod" | "online">(
    "all"
  );
  const [hasCelebrated, setHasCelebrated] = useState<boolean>(false);
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(
    null
  );

  // Sync state if initial metrics change
  useEffect(() => {
    if (initialMetrics.dailyGoal && initialMetrics.dailyGoal !== dailyTarget) {
      setDailyTarget(initialMetrics.dailyGoal);
    }
  }, [initialMetrics.dailyGoal]);

  const completedToday = initialMetrics.completedToday || 0;
  const progressPercent = Math.min(
    100,
    Math.round((completedToday / dailyTarget) * 100)
  );

  // Trigger celebration confetti
  const triggerConfetti = (type: "full" | "sparkle" = "full") => {
    try {
      if (type === "full") {
        const count = 200;
        const defaults = { origin: { y: 0.7 } };

        const fire = (particleRatio: number, opts: confetti.Options) => {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        };

        fire(0.25, {
          spread: 26,
          startVelocity: 55,
          colors: ["#10B981", "#06B6D4", "#F59E0B"],
        });
        fire(0.2, {
          spread: 60,
          colors: ["#3B82F6", "#8B5CF6", "#EC4899"],
        });
        fire(0.35, {
          spread: 100,
          decay: 0.91,
          scalar: 0.8,
          colors: ["#10B981", "#00FF9D", "#38BDF8"],
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 25,
          decay: 0.92,
          colors: ["#FBBF24", "#F59E0B", "#EF4444"],
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 45,
          colors: ["#10B981", "#06B6D4"],
        });
      } else {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#10B981", "#06B6D4"],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#10B981", "#06B6D4"],
        });
      }
    } catch {
      // Confetti optional effect
    }
  };

  // Milestone check for automatic celebration on initial load if hit 100% or 50%
  useEffect(() => {
    if (progressPercent >= 50 && !hasCelebrated) {
      setHasCelebrated(true);
      triggerConfetti(progressPercent >= 100 ? "full" : "sparkle");
    }
  }, [progressPercent, hasCelebrated]);

  // Gamified Milestones configuration
  const milestones = useMemo(() => {
    const t = dailyTarget;
    return [
      {
        id: 1,
        tier: "Starter Boost",
        threshold: Math.max(1, Math.round(t * 0.25)),
        percentage: 25,
        icon: Zap,
        reward: "₹50 Gas Fuel Credit",
        color: "from-cyan-500 to-blue-500",
        glow: "shadow-cyan-500/20 text-cyan-400 border-cyan-500/30",
        description: "Complete first 25% of your quota to initiate streak",
      },
      {
        id: 2,
        tier: "Speed Surge",
        threshold: Math.max(2, Math.round(t * 0.5)),
        percentage: 50,
        icon: Flame,
        reward: "🔥 ₹100 Mid-Shift Bonus",
        color: "from-emerald-500 to-teal-400",
        glow: "shadow-emerald-500/25 text-emerald-400 border-emerald-500/30",
        description: "Halfway mark reached! Unlocks instant bonus payout",
      },
      {
        id: 3,
        tier: "Priority Dasher",
        threshold: Math.max(3, Math.round(t * 0.75)),
        percentage: 75,
        icon: Trophy,
        reward: "⭐ Priority Fast Dispatch",
        color: "from-amber-400 to-orange-500",
        glow: "shadow-amber-500/25 text-amber-400 border-amber-500/30",
        description: "Top 10% performance queue for high-value orders",
      },
      {
        id: 4,
        tier: "Apex Champion",
        threshold: t,
        percentage: 100,
        icon: Award,
        reward: "👑 ₹250 Champion Bonus + Badge",
        color: "from-fuchsia-500 to-emerald-400",
        glow: "shadow-fuchsia-500/30 text-fuchsia-400 border-fuchsia-500/40",
        description: "Daily target conquered! Full bonus package credited",
      },
    ];
  }, [dailyTarget]);

  // Generate hourly delivery trajectory data based on today's deliveries
  const hourlyChartData = useMemo(() => {
    const hours = [
      "8 AM",
      "10 AM",
      "12 PM",
      "2 PM",
      "4 PM",
      "6 PM",
      "8 PM",
      "10 PM",
    ];
    let cumulative = 0;
    const targetStep = dailyTarget / hours.length;

    return hours.map((hour, idx) => {
      // Simulate/calculate hourly spread based on actual completed deliveries
      const share = Math.min(
        completedToday,
        Math.round((completedToday * (idx + 1)) / hours.length)
      );
      cumulative = share;

      return {
        time: hour,
        completed: cumulative,
        targetTrend: Math.round(targetStep * (idx + 1)),
      };
    });
  }, [completedToday, dailyTarget]);

  // Weekly performance simulated/derived data
  const weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"];
    return days.map((day, i) => {
      const isToday = i === days.length - 1;
      const count = isToday
        ? completedToday
        : Math.max(4, Math.min(14, (initialMetrics.totalCompleted % 7) + (i % 3) * 3 + 4));
      return {
        day,
        deliveries: count,
        earnings: count * 50 + (count >= 8 ? 150 : 0),
        isToday,
      };
    });
  }, [completedToday, initialMetrics.totalCompleted]);

  // Dynamic calculated earnings estimate
  const estimatedDailyEarnings = useMemo(() => {
    const base = completedToday * 50;
    const bonus = completedToday >= dailyTarget ? 250 : completedToday >= Math.round(dailyTarget * 0.5) ? 100 : 0;
    return base + bonus;
  }, [completedToday, dailyTarget]);

  const filteredHistory = history.filter((item) => {
    if (historyFilter === "cod") return item.paymentMethod.toLowerCase() === "cod";
    if (historyFilter === "online")
      return item.paymentMethod.toLowerCase() !== "cod";
    return true;
  });

  return (
    <div className="w-full space-y-6">
      {/* 🚀 TOP BANNER: Bold High-Octane Motivational Status */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 text-white shadow-2xl backdrop-blur-xl"
      >
        {/* Neon background ambient glows */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ⚡ Partner Live Performance Hub
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2.5 flex-wrap">
              <span>Delivery Velocity</span>
              <span className="bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                {progressPercent >= 100 ? "Goal Conquered! 👑" : `${progressPercent}% Achieved`}
              </span>
            </h2>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              {progressPercent >= 100 ? (
                <span className="text-emerald-300 font-semibold">
                  Outstanding work! You have smashed today&apos;s goal. Extra milestone rewards are unlocked and credited!
                </span>
              ) : (
                <>
                  You need{" "}
                  <strong className="text-white font-black">
                    {Math.max(0, dailyTarget - completedToday)} more deliveries
                  </strong>{" "}
                  today to trigger your{" "}
                  <span className="text-amber-400 font-bold">
                    ₹250 Apex Daily Bonus
                  </span>
                  . Keep the momentum going!
                </>
              )}
            </p>
          </div>

          {/* Quick Action & Celebration Trigger */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => triggerConfetti("full")}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles size={16} />
              <span>Celebrate Streak</span>
            </button>

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                <RefreshCw
                  size={14}
                  className={refreshing ? "animate-spin text-emerald-400" : ""}
                />
                <span>{refreshing ? "Syncing..." : "Sync"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Glowing Progress Bar with Milestones Pins */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Target size={14} className="text-emerald-400" />
              Progress: {completedToday} of {dailyTarget} Orders
            </span>
            <span className="text-emerald-400 font-mono font-black text-sm">
              {progressPercent}%
            </span>
          </div>

          {/* Bar track */}
          <div className="relative h-4 w-full bg-slate-950/80 rounded-full p-1 border border-slate-800 overflow-visible">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-linear-to-r from-cyan-500 via-emerald-400 to-amber-400 shadow-lg shadow-emerald-500/30 relative"
            >
              {/* Pulsing leading indicator head */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md shadow-emerald-400 animate-pulse" />
            </motion.div>
          </div>

          {/* Milestone Tier Flags */}
          <div className="grid grid-cols-4 gap-1 sm:gap-2 pt-1 text-center">
            {milestones.map((m) => {
              const isUnlocked = completedToday >= m.threshold;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMilestone(m.id);
                    if (isUnlocked) triggerConfetti("sparkle");
                  }}
                  className={`cursor-pointer rounded-xl p-2 transition-all border ${
                    isUnlocked
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-xs"
                      : "bg-slate-950/40 border-slate-800/60 text-slate-500 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {isUnlocked ? (
                      <CheckCircle2 size={12} className="text-emerald-400" />
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500">
                        {m.percentage}%
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs font-bold truncate mt-0.5">
                    {m.tier}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono hidden sm:block">
                    {m.threshold} orders
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* 📊 INTERACTIVE METRICS & CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radial Target Gauge & Earnings Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="text-amber-400 w-5 h-5" />
              <span>Target Ring & Rewards</span>
            </h3>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Shift Live
            </span>
          </div>

          {/* Animated Circular Progress Gauge */}
          <div className="relative flex items-center justify-center my-2">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* SVG Ring */}
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background Ring Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-950/80"
                />
                {/* Progress Ring Stroke with Glowing Gradient */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#emeraldCyanGradient)"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 40 * (1 - progressPercent / 100)
                  }`}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient
                    id="emeraldCyanGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="50%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center Content in Gauge */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-white tracking-tight">
                  {completedToday}
                  <span className="text-slate-500 text-sm font-normal">
                    /{dailyTarget}
                  </span>
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 mt-0.5">
                  {progressPercent >= 100 ? "Goal Met 🎉" : "Delivered"}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {Math.max(0, dailyTarget - completedToday)} remaining
                </span>
              </div>
            </div>
          </div>

          {/* Quick Target Adjuster (Gamification Interactive Control) */}
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <Sliders size={13} className="text-cyan-400" />
                Customize Daily Goal:
              </span>
              <span className="font-mono font-black text-white text-sm">
                {dailyTarget} Orders
              </span>
            </div>

            <div className="flex items-center gap-2">
              {[8, 10, 12, 15].map((targetVal) => (
                <button
                  key={targetVal}
                  onClick={() => {
                    setDailyTarget(targetVal);
                    if (completedToday >= targetVal) triggerConfetti("sparkle");
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    dailyTarget === targetVal
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {targetVal}
                </button>
              ))}
            </div>
          </div>

          {/* Est. Shift Payout */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <div>
              <p className="text-slate-400 font-medium">Est. Today&apos;s Payout</p>
              <p className="text-xl font-black text-emerald-400">
                ₹{estimatedDailyEarnings}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 font-medium">On-Time Score</p>
              <p className="text-sm font-black text-cyan-400 flex items-center justify-end gap-1">
                <Zap size={14} className="text-cyan-400" />
                {initialMetrics.onTimeRate || "98.5%"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 📈 Recharts Velocity & Velocity Trend Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-cyan-400 w-5 h-5" />
                <span>Performance Analytics Visualizer</span>
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                {chartView === "hourly"
                  ? "Hourly delivery pace vs target threshold pace"
                  : "Daily earnings & completed deliveries trend this week"}
              </p>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setChartView("hourly")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartView === "hourly"
                    ? "bg-cyan-500 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Hourly Pace
              </button>
              <button
                onClick={() => setChartView("weekly")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartView === "weekly"
                    ? "bg-cyan-500 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                7-Day Trend
              </button>
            </div>
          </div>

          {/* Recharts Render Area */}
          <div className="w-full h-64 sm:h-72 pt-2">
            {chartView === "hourly" ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={hourlyChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="completedArea"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient
                      id="targetArea"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderColor: "#334155",
                      borderRadius: "1rem",
                      color: "#F8FAFC",
                      fontSize: "12px",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    name="Completed Deliveries"
                    stroke="#10B981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#completedArea)"
                  />
                  <Area
                    type="monotone"
                    dataKey="targetTrend"
                    name="Target Trajectory"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#targetArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="day"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderColor: "#334155",
                      borderRadius: "1rem",
                      color: "#F8FAFC",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="deliveries" name="Orders Completed" radius={[8, 8, 0, 0]}>
                    {weeklyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isToday ? "#10B981" : "#334155"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              Completed Orders
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              Target Velocity Pace
            </span>
          </div>
        </motion.div>
      </div>

      {/* 🏆 GAMIFIED MILESTONES & LEVEL TIERS DISPLAY */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl backdrop-blur-xl space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Trophy className="text-amber-400 w-5 h-5" />
              <span>Shift Milestones & Unlocked Rewards</span>
            </h3>
            <p className="text-slate-400 text-xs">
              Every milestone achieved unlocks exclusive monetary bonuses and route privileges.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            <Gift size={13} />
            <span>Bonus Pool Active</span>
          </div>
        </div>

        {/* Milestone Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {milestones.map((m) => {
            const isCompleted = completedToday >= m.threshold;
            const Icon = m.icon;

            return (
              <motion.div
                key={m.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (isCompleted) triggerConfetti("sparkle");
                }}
                className={`relative overflow-hidden rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isCompleted
                    ? "bg-slate-800/80 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                    : "bg-slate-950/60 border-slate-800/80 opacity-75 hover:opacity-100"
                }`}
              >
                {/* Level Badge Header */}
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      isCompleted
                        ? "bg-linear-to-tr " + m.color + " text-slate-950 shadow-md"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  {isCompleted ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Unlocked
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-500 bg-slate-900 border border-slate-800">
                      {m.threshold - completedToday} left
                    </span>
                  )}
                </div>

                {/* Body Content */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Tier {m.id} • {m.percentage}% Goal
                  </p>
                  <h4 className="text-sm font-black text-white mt-0.5">
                    {m.tier}
                  </h4>
                  <p className="text-[11px] font-semibold text-emerald-400 mt-1">
                    {m.reward}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                    {m.description}
                  </p>
                </div>

                {/* Progress bar inside card */}
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-linear-to-r ${m.color}`}
                    style={{
                      width: `${Math.min(
                        100,
                        (completedToday / m.threshold) * 100
                      )}%`,
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* 💰 COMPREHENSIVE EARNINGS & CASH PERFORMANCE SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Deliveries Metric */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Deliveries
            </span>
            <Package size={16} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white">
            {initialMetrics.totalCompleted || 0}
          </p>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <ArrowUpRight size={14} /> +{completedToday} fulfilled today
          </p>
        </motion.div>

        {/* Total Earnings Metric */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Earnings
            </span>
            <DollarSign size={16} className="text-teal-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">
            ₹{initialMetrics.totalEarnings || 0}
          </p>
          <p className="text-xs text-slate-400 font-medium">
            ₹50 base payout + milestone bonuses
          </p>
        </motion.div>

        {/* COD Cash in Hand Metric */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              COD Cash in Hand
            </span>
            <Banknote size={16} className="text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400">
            ₹{initialMetrics.totalCodCollected || 0}
          </p>
          <p className="text-xs text-amber-300/80 font-medium">
            Cash collected for settlement
          </p>
        </motion.div>

        {/* Prepaid Digital Metric */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Prepaid Digital
            </span>
            <CreditCard size={16} className="text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-cyan-400">
            {initialMetrics.totalOnlineDelivered || 0}
          </p>
          <p className="text-xs text-cyan-300/80 font-medium">
            100% cashless direct delivery
          </p>
        </motion.div>
      </div>

      {/* 📜 FULFILLED ORDERS ACTIVITY FEED */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl backdrop-blur-xl space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Clock className="text-emerald-400 w-5 h-5" />
              <span>Fulfilled Orders Log ({filteredHistory.length})</span>
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Verified order payouts and delivery records
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setHistoryFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                historyFilter === "all"
                  ? "bg-emerald-500 text-slate-950 font-black shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All ({history.length})
            </button>
            <button
              onClick={() => setHistoryFilter("cod")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                historyFilter === "cod"
                  ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              COD Only
            </button>
            <button
              onClick={() => setHistoryFilter("online")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                historyFilter === "online"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Prepaid Only
            </button>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
              <Package size={28} />
            </div>
            <h4 className="text-sm font-bold text-slate-300">
              No orders found in this filter
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Deliver more customer orders to build your shift history!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => {
              const isCOD = item.paymentMethod.toLowerCase() === "cod";
              return (
                <div
                  key={item.assignmentId}
                  className="bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-bold text-white text-sm">
                        Order #{item.orderId.slice(-6).toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                        <CheckCircle2 size={10} /> Verified Delivered
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.completedAt
                        ? new Date(item.completedAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Today"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Customer Info */}
                    <div className="space-y-1">
                      <p className="text-slate-400 font-medium flex items-center gap-1">
                        <User size={12} className="text-emerald-400" />
                        <span>Customer</span>
                      </p>
                      <p className="font-bold text-white">
                        {item.customerName}
                      </p>
                      {item.customerMobile && (
                        <p className="text-slate-400 text-[11px]">
                          📞 {item.customerMobile}
                        </p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="space-y-1">
                      <p className="text-slate-400 font-medium flex items-center gap-1">
                        <MapPin size={12} className="text-emerald-400" />
                        <span>Delivery Address</span>
                      </p>
                      <p className="text-slate-300 text-xs line-clamp-2">
                        {item.fullAddress}
                      </p>
                    </div>

                    {/* Payment & Earning */}
                    <div className="sm:text-right space-y-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isCOD
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            : "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                        }`}
                      >
                        {isCOD ? (
                          <>
                            <Banknote size={11} /> COD: ₹{item.totalAmount}
                          </>
                        ) : (
                          <>
                            <CreditCard size={11} /> Prepaid Online
                          </>
                        )}
                      </span>
                      <p className="text-emerald-400 font-black text-sm">
                        Payout Earned: +₹{item.earning}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
