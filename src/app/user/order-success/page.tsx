"use client";

import React from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle,
  CheckCircle2,
  Home,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const OrderSuccess = () => {
  const router = useRouter();

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background Decorative Circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-100/60 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-lg w-full bg-white rounded-3xl shadow-xl shadow-green-900/5 p-8 border border-green-100 text-center relative z-10"
      >
        {/* Animated Checkmark Icon Container */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1,
          }}
          className="w-24 h-24 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center mx-auto mb-6 relative shadow-inner"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          >
            <CheckCircle size={56} className="text-green-700" />
          </motion.div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-3xl font-extrabold text-green-700 tracking-tight"
        >
          Order Placed Successfully!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-gray-600 text-sm mt-3 leading-relaxed"
        >
          Thank you for your purchase with <span className="font-semibold text-green-700">Snapcart</span>. Your order has been confirmed and is being prepared for fast delivery.
        </motion.p>

        {/* Delivery Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="my-6 p-4 rounded-2xl bg-green-50/70 border border-green-100/90 text-left space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-800 font-semibold text-sm">
              <Truck size={18} className="text-green-700" />
              <span>Estimated Delivery</span>
            </div>
            <span className="bg-green-700 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
              25 - 30 Mins
            </span>
          </div>
          <p className="text-xs text-gray-500 border-t border-green-100/80 pt-2 flex items-center gap-1.5">
            <PackageCheck size={14} className="text-green-700" />
            Live tracking details have been sent to your registered mobile.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="space-y-3 pt-2"
        >
          <Link href="/" className="block">
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-green-200 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag size={18} />
              <span>Continue Shopping</span>
              <ArrowRight size={18} />
            </motion.button>
          </Link>

          <button
            onClick={() => router.push("/myorders")}
            className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-2xl border border-gray-200 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <Home size={16} />
            <span>Go to My Orders</span>
          </button>
        </motion.div>

        {/* Footer Guarantee */}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <ShieldCheck size={14} className="text-green-700" />
          <span>100% Safe & Secure Grocery Delivery</span>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;