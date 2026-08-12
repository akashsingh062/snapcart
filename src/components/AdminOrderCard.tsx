"use client";

import React from "react";
import { motion } from "motion/react";
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg space-y-4"
    >
      {/* Top Row: Order ID, Date, Status Selector & Payment Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-green-700 text-white flex items-center justify-center shadow-md shrink-0">
            <Package size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">
              Order #{order._id.slice(-6).toUpperCase()}
            </h3>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <Calendar size={12} />
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Status Selector & Payment Status Pill */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Payment Status Toggle */}
          <button
            onClick={() => handleTogglePayment(order._id, !!order.isPaid)}
            disabled={updatingId === order._id}
            title="Click to toggle payment status"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              order.isPaid
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-amber-100 text-amber-800 border-amber-200"
            }`}
          >
            {updatingId === order._id ? (
              <Loader2 size={12} className="animate-spin" />
            ) : order.isPaid ? (
              <CheckCircle2 size={13} />
            ) : (
              <Clock size={13} />
            )}
            <span>{order.isPaid ? "Paid" : "Unpaid (Click to Pay)"}</span>
          </button>

          {/* Order Status Selector */}
          <div className="relative">
            <select
              value={order.status.toLowerCase()}
              disabled={updatingId === order._id}
              onChange={(e) =>
                handleUpdateStatus(order._id.toString(), e.target.value)
              }
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer border focus:outline-none capitalize shadow-xs transition-all ${
                order.status.toLowerCase() === "delivered"
                  ? "bg-green-700 text-white border-green-800"
                  : order.status.toLowerCase() === "out of delivery" ||
                    order.status.toLowerCase() === "out_of_delivery"
                  ? "bg-amber-500 text-white border-amber-600"
                  : "bg-blue-600 text-white border-blue-700"
              }`}
            >
              <option value="pending" className="bg-white text-gray-900">
                Pending
              </option>
              <option value="out of delivery" className="bg-white text-gray-900">
                Out of Delivery
              </option>
              <option value="delivered" className="bg-white text-gray-900">
                Delivered
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer & Address Details Grid */}
      <div
        className={`grid grid-cols-1 ${
          order.assignedDeliveryBoy ? "md:grid-cols-3" : "md:grid-cols-2"
        } gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs`}
      >
        {/* Customer info */}
        <div className="space-y-1.5">
          <p className="font-bold text-gray-900 flex items-center gap-1.5">
            <UserIcon size={14} className="text-green-700" />
            <span>Customer Details:</span>
          </p>
          <p className="text-gray-700 font-semibold pl-5">
            {order.address?.fullName || order.user?.name || "N/A"}
          </p>
          <p className="text-gray-500 flex items-center gap-1.5 pl-5">
            <Phone size={12} className="text-gray-400" />
            {order.address?.mobile || order.user?.mobile || "N/A"}
          </p>
        </div>

        {/* Address info */}
        <div className="space-y-1.5 border-t md:border-t-0 pt-2 md:pt-0 border-gray-200">
          <p className="font-bold text-gray-900 flex items-center gap-1.5">
            <MapPin size={14} className="text-green-700" />
            <span>Delivery Address:</span>
          </p>
          <p className="text-gray-600 pl-5">
            {order.address?.fullAddress}, {order.address?.city},{" "}
            {order.address?.state} - {order.address?.pincode}
          </p>
        </div>

        {/* Delivery Partner info (if accepted/assigned) */}
        {order.assignedDeliveryBoy && (
          <div className="space-y-1.5 border-t md:border-t-0 md:border-l md:pl-4 pt-2 md:pt-0 border-gray-200">
            <p className="font-bold text-emerald-800 flex items-center gap-1.5">
              <Truck size={14} className="text-emerald-600" />
              <span>Assigned Partner:</span>
            </p>
            <p className="text-emerald-700 font-extrabold pl-5">
              {typeof order.assignedDeliveryBoy === "object"
                ? order.assignedDeliveryBoy.name
                : "Delivery Partner"}
            </p>
            {typeof order.assignedDeliveryBoy === "object" &&
              order.assignedDeliveryBoy.mobile && (
                <p className="text-gray-600 flex items-center gap-1.5 pl-5">
                  <Phone size={12} className="text-gray-400" />
                  <a
                    href={`tel:${order.assignedDeliveryBoy.mobile}`}
                    className="hover:underline font-semibold text-emerald-700"
                  >
                    {order.assignedDeliveryBoy.mobile}
                  </a>
                </p>
              )}
          </div>
        )}
      </div>

      {/* Order Items List */}
      <div className="space-y-2.5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Ordered Items ({order.items.length})
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-gray-100 shadow-2xs"
            >
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-200 bg-gray-50">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-gray-900 truncate">
                  {item.name}
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Qty: <span className="font-bold text-green-700">{item.quantity}</span> • ₹{item.price}
                </p>
              </div>
              <span className="font-bold text-xs text-gray-900 shrink-0">
                ₹{Number(item.price) * item.quantity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary & Payment Footer */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-700 font-semibold bg-gray-100 px-3 py-1.5 rounded-xl">
          {order.paymentMethod?.toLowerCase() === "cod" ? (
            <>
              <Banknote size={15} className="text-green-700" /> Cash on Delivery (COD)
            </>
          ) : (
            <>
              <CreditCard size={15} className="text-blue-600" /> Online Payment
            </>
          )}
        </div>

        <div className="text-right">
          <p className="text-[11px] text-gray-400 font-medium uppercase">Total Amount</p>
          <p className="text-xl font-extrabold text-green-700">₹{order.totalAmount}</p>
        </div>
      </div>
    </motion.div>
  );
}
