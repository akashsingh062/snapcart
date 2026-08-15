"use client";

import React from "react";
import {
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  Phone,
  User as UserIcon,
  Truck,
  PackageX,
} from "lucide-react";
import Image from "next/image";

export interface IOrderItem {
  _id?: string;
  grocery: string;
  name: string;
  price: string;
  unit: string;
  image: string;
  quantity: number;
}

export interface IUserRef {
  _id: string;
  name?: string;
  email?: string;
  mobile?: string;
}

export interface IOrder {
  _id: string;
  user?: IUserRef | null;
  assignedDeliveryBoy?: IUserRef | string | null;
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

interface AdminOrderCardProps {
  order: IOrder;
  updatingId: string | null;
  handleTogglePayment: (orderId: string, currentIsPaid: boolean) => void;
  handleUpdateStatus: (orderId: string, newStatus: string) => void;
}

export default function AdminOrderCard({
  order,
  updatingId,
  handleTogglePayment,
  handleUpdateStatus,
}: AdminOrderCardProps) {
  const statusColor = () => {
    const s = order.status.toLowerCase();
    if (s === "delivered") return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (s === "out of delivery" || s === "out_of_delivery") return "text-amber-700 bg-amber-50 border-amber-200";
    if (s.includes("cannot")) return "text-rose-700 bg-rose-50 border-rose-200";
    return "text-blue-700 bg-blue-50 border-blue-200";
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold text-slate-900">
            #{order._id.slice(-6).toUpperCase()}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar size={12} />
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Payment toggle */}
          <button
            onClick={() => handleTogglePayment(order._id, !!order.isPaid)}
            disabled={updatingId === order._id}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer border ${
              order.isPaid
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {updatingId === order._id ? (
              <Loader2 size={12} className="animate-spin" />
            ) : order.isPaid ? (
              <CheckCircle2 size={12} />
            ) : (
              <Clock size={12} />
            )}
            {order.isPaid ? "Paid" : "Unpaid"}
          </button>

          {/* Status selector */}
          <select
            value={order.status.toLowerCase()}
            disabled={updatingId === order._id}
            onChange={(e) =>
              handleUpdateStatus(order._id.toString(), e.target.value)
            }
            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer border focus:outline-none capitalize transition-colors ${statusColor()}`}
          >
            <option value="pending" className="bg-white text-slate-900">Pending</option>
            <option value="out of delivery" className="bg-white text-slate-900">Out of Delivery</option>
            <option value="delivered" className="bg-white text-slate-900">Delivered</option>
            <option value="cannot be delivered" className="bg-white text-slate-900">Cannot be Delivered</option>
          </select>
        </div>
      </div>

      {/* Customer & Address */}
      <div className={`grid grid-cols-1 ${order.assignedDeliveryBoy ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4 px-4 py-3 text-xs border-b border-slate-100`}>
        <div className="space-y-1">
          <p className="text-slate-400 font-medium flex items-center gap-1">
            <UserIcon size={12} /> Customer
          </p>
          <p className="text-slate-900 font-medium">
            {order.address?.fullName || order.user?.name || "N/A"}
          </p>
          <p className="text-slate-500 flex items-center gap-1">
            <Phone size={11} />
            {order.address?.mobile || order.user?.mobile || "N/A"}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-slate-400 font-medium flex items-center gap-1">
            <MapPin size={12} /> Address
          </p>
          <p className="text-slate-600 leading-relaxed">
            {order.address?.fullAddress}, {order.address?.city}, {order.address?.state} - {order.address?.pincode}
          </p>
        </div>

        {order.assignedDeliveryBoy && (
          <div className="space-y-1">
            <p className="text-emerald-600 font-medium flex items-center gap-1">
              <Truck size={12} /> Delivery Partner
            </p>
            <p className="text-slate-900 font-medium">
              {typeof order.assignedDeliveryBoy === "object"
                ? order.assignedDeliveryBoy.name
                : "Assigned"}
            </p>
            {typeof order.assignedDeliveryBoy === "object" &&
              order.assignedDeliveryBoy.mobile && (
                <a
                  href={`tel:${order.assignedDeliveryBoy.mobile}`}
                  className="text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <Phone size={11} />
                  {order.assignedDeliveryBoy.mobile}
                </a>
              )}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-xs text-slate-400 font-medium mb-2">
          Items ({order.items.length})
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100"
            >
              <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-white">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-900 truncate">
                  {item.name}
                </p>
                <p className="text-[11px] text-slate-400">
                  {item.quantity} × ₹{item.price}
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-900 shrink-0">
                ₹{Number(item.price) * item.quantity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
            {order.paymentMethod?.toLowerCase() === "cod" ? (
              <><Banknote size={13} /> COD</>
            ) : (
              <><CreditCard size={13} /> Online</>
            )}
          </span>

          {order.isPaid ||
          order.paymentMethod?.toLowerCase() === "online" ||
          order.status?.toLowerCase() === "delivered" ? (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 flex items-center gap-1">
              <CheckCircle2 size={12} /> Paid
            </span>
          ) : (
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
              Collect ₹{order.totalAmount}
            </span>
          )}
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400">Total</p>
          <p className="text-lg font-bold text-slate-900">₹{order.totalAmount}</p>
        </div>
      </div>
    </div>
  );
}
