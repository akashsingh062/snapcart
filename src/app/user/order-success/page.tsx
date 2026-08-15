"use client";

import React, { useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle,
  Home,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { useDispatch } from "react-redux";
import { emptyCart } from "@/redux/cartSlice";
import axios from "axios";

const OrderSuccess = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(emptyCart());

    const sessionId = searchParams.get("session_id");
    const orderId = searchParams.get("orderId");

    if (sessionId && orderId) {
      axios.post("/api/auth/user/payment/verify", { sessionId, orderId }).catch(() => {});
    }

    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#10b981", "#059669", "#34d399", "#6ee7b7"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#10b981", "#059669", "#34d399", "#6ee7b7"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="min-h-[85vh] flex items-center justify-center pt-28 pb-12 px-4 relative overflow-hidden">
      {/* Background Decorative Circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-lg w-full bg-white rounded-3xl shadow-xl shadow-green-900/5 p-8 border border-emerald-100 text-center relative z-10"
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
          className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto mb-6 relative shadow-inner"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          >
            <CheckCircle size={56} className="text-emerald-700" />
          </motion.div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-3xl font-extrabold text-emerald-700 tracking-tight"
        >
          Order Placed Successfully!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-slate-600 text-sm mt-3 leading-relaxed"
        >
          Thank you for your purchase with <span className="font-semibold text-emerald-700">Snapcart</span>. Your order has been confirmed and is being prepared for fast delivery.
        </motion.p>

        {/* Delivery Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="my-6 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100/90 text-left space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
              <Truck size={18} className="text-emerald-700" />
              <span>Estimated Delivery</span>
            </div>
            <span className="bg-emerald-700 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
              25 - 30 Mins
            </span>
          </div>
          <p className="text-xs text-slate-500 border-t border-emerald-100/80 pt-2 flex items-center gap-1.5">
            <PackageCheck size={14} className="text-emerald-700" />
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
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-200 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag size={18} />
              <span>Continue Shopping</span>
              <ArrowRight size={18} />
            </motion.button>
          </Link>

          <button
            onClick={() => router.push("/user/my-orders")}
            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-3 px-6 rounded-2xl border border-slate-200 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <Home size={16} />
            <span>Go to My Orders</span>
          </button>
        </motion.div>

        {/* Footer Guarantee */}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck size={14} className="text-emerald-700" />
          <span>100% Safe & Secure Grocery Delivery</span>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;