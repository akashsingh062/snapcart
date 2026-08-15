"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Loader2,
  Package,
  PlusCircle,
  RefreshCw,
  ShoppingBag,
  Truck,
  Banknote,
  CreditCard,
  XCircle,
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
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

interface IDashboardStats {
  totalOrders: number;
  pendingOrders: number;
  outOfDeliveryOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  codRevenue: number;
  onlineRevenue: number;
  totalProducts: number;
  deliveryBoysCount: number;
}

interface IRecentOrder {
  _id: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  paymentMethod: string;
}

interface IDailyTrend {
  date: string;
  orders: number;
  revenue: number;
}

interface IStatusDist {
  name: string;
  value: number;
  color: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<IRecentOrder[]>([]);
  const [dailyTrends, setDailyTrends] = useState<IDailyTrend[]>([]);
  const [statusDist, setStatusDist] = useState<IStatusDist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [chartView, setChartView] = useState<"orders" | "revenue">("revenue");

  const fetchDashboardStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await axios.get("/api/auth/admin/dashboard-stats");
      if (res.data?.success) {
        setStats(res.data.stats);
        setRecentOrders(res.data.recentOrders || []);
        setDailyTrends(res.data.dailyTrends || []);
        setStatusDist(res.data.statusDistribution || []);
      }
    } catch {
      // Failed to fetch admin stats
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const res = await axios.get("/api/auth/admin/dashboard-stats");
        if (isMounted && res.data?.success) {
          setStats(res.data.stats);
          setRecentOrders(res.data.recentOrders || []);
          setDailyTrends(res.data.dailyTrends || []);
          setStatusDist(res.data.statusDistribution || []);
        }
      } catch {
        // Failed to load dashboard data
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return (
          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
            Delivered
          </span>
        );
      case "out of delivery":
      case "out_of_delivery":
        return (
          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
            Out for Delivery
          </span>
        );
      case "cannot be delivered":
      case "cannot_be_delivered":
        return (
          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
            Undeliverable
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            Pending
          </span>
        );
    }
  };

  const deliveryRate = stats && stats.totalOrders > 0
    ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-2">
        <Loader2 size={24} className="animate-spin text-slate-400" />
        <p className="text-slate-400 text-sm">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="w-[95%] max-w-6xl mx-auto pt-20 pb-16 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Store performance overview</p>
        </div>
        <button
          onClick={() => fetchDashboardStats(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1"><Package size={13} /> Orders</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.totalOrders || 0}</p>
          <p className="text-xs text-slate-400 mt-0.5">{stats?.pendingOrders || 0} pending</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1"><span>₹</span> Revenue</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">₹{stats?.totalRevenue ? Math.round(stats.totalRevenue).toLocaleString("en-IN") : "0"}</p>
          <p className="text-xs text-slate-400 mt-0.5">From {stats?.deliveredOrders || 0} delivered</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1"><CheckCircle2 size={13} /> Delivered</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.deliveredOrders || 0}</p>
          <p className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center gap-0.5">
            <ArrowUpRight size={12} /> {deliveryRate}% success rate
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1"><Truck size={13} /> Active</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{stats?.outOfDeliveryOrders || 0}</p>
          <p className="text-xs text-slate-400 mt-0.5">Out for delivery now</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 7-Day Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Last 7 Days</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setChartView("revenue")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  chartView === "revenue"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setChartView("orders")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  chartView === "orders"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Orders
              </button>
            </div>
          </div>

          <div className="w-full h-56">
            {dailyTrends.length > 0 ? (
              chartView === "revenue" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyTrends} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#CBD5E1" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#CBD5E1" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #E2E8F0",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,.07)",
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fill="url(#revenueGrad)" name="Revenue (₹)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyTrends} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" stroke="#CBD5E1" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#CBD5E1" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #E2E8F0",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,.07)",
                      }}
                    />
                    <Bar dataKey="orders" name="Orders" radius={[6, 6, 0, 0]}>
                      {dailyTrends.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === dailyTrends.length - 1 ? "#10B981" : "#E2E8F0"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No trend data</div>
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Order Status</h3>

          {statusDist.length > 0 ? (
            <>
              <div className="w-full h-40 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {statusDist.map((entry, index) => (
                        <Cell key={`pie-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #E2E8F0",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                {statusDist.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-slate-600">{s.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No orders yet</div>
          )}
        </div>
      </div>

      {/* Revenue Breakdown + Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Banknote size={14} />
            <span className="text-xs font-medium">COD Revenue</span>
          </div>
          <p className="text-xl font-bold text-slate-900">₹{stats?.codRevenue ? Math.round(stats.codRevenue).toLocaleString("en-IN") : "0"}</p>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
            <div
              className="bg-amber-500 h-1.5 rounded-full"
              style={{ width: `${stats?.totalRevenue ? Math.round((stats.codRevenue / stats.totalRevenue) * 100) : 0}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats?.totalRevenue ? Math.round((stats.codRevenue / stats.totalRevenue) * 100) : 0}% of total revenue
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <CreditCard size={14} />
            <span className="text-xs font-medium">Online Revenue</span>
          </div>
          <p className="text-xl font-bold text-slate-900">₹{stats?.onlineRevenue ? Math.round(stats.onlineRevenue).toLocaleString("en-IN") : "0"}</p>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full"
              style={{ width: `${stats?.totalRevenue ? Math.round((stats.onlineRevenue / stats.totalRevenue) * 100) : 0}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats?.totalRevenue ? Math.round((stats.onlineRevenue / stats.totalRevenue) * 100) : 0}% of total revenue
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <ShoppingBag size={14} />
            <span className="text-xs font-medium">Store & Team</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <div>
              <p className="text-xl font-bold text-slate-900">{stats?.totalProducts || 0}</p>
              <p className="text-[11px] text-slate-400">Products</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <p className="text-xl font-bold text-slate-900">{stats?.deliveryBoysCount || 0}</p>
              <p className="text-[11px] text-slate-400">Riders</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <p className="text-xl font-bold text-rose-600">{stats?.cancelledOrders || 0}</p>
              <p className="text-[11px] text-slate-400">Failed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Quick Actions</h3>
          <Link href="/admin/manage-orders" className="group block">
            <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package size={16} className="text-emerald-600" />
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Manage Orders</p>
                    <p className="text-xs text-slate-400">{stats?.pendingOrders || 0} need attention</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
              </div>
            </div>
          </Link>
          <Link href="/admin/add-grocery" className="group block">
            <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PlusCircle size={16} className="text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Add Grocery</p>
                    <p className="text-xs text-slate-400">Add items to catalog</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
              </div>
            </div>
          </Link>
          <Link href="/admin/view-groceries" className="group block">
            <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag size={16} className="text-amber-600" />
                  <div>
                    <p className="font-medium text-slate-900 text-sm">View Catalog</p>
                    <p className="text-xs text-slate-400">{stats?.totalProducts || 0} items listed</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm">Recent Orders</h3>
            <Link
              href="/admin/manage-orders"
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No orders yet</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-medium text-slate-900">
                      #{ord._id.slice(-6).toUpperCase()}
                    </span>
                    {getStatusBadge(ord.status)}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      ord.paymentMethod?.toLowerCase() === "cod"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-blue-50 text-blue-700"
                    }`}>
                      {ord.paymentMethod?.toUpperCase() || "COD"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      ₹{ord.totalAmount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
