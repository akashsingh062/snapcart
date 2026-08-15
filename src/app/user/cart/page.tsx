"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  ArrowRight,
  ReceiptText,
  ShieldCheck,
  Truck
} from "lucide-react";
import { RootState, AppDispatch } from "@/redux/store";
import { removeFromCart, updateQuantity, ICartItem } from "@/redux/cartSlice";

const CartPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { cartData, subTotal, deliveryFee, platformFee, finalTotal } = useSelector(
    (state: RootState) => state.cart
  );

  const handleQtyUpdate = (id: string, newQty: number) => {
    dispatch(updateQuantity({ _id: id, quantity: newQty }));
  };

  const handleRemove = (id: string) => {
    dispatch(removeFromCart(id));
  };

  return (
    <div className="w-[95%] sm:w-[90%] md:w-[85%] max-w-6xl mx-auto pt-28 pb-24 relative min-h-[80vh]">
      {/* Back Button Link */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-all group bg-white px-4 py-2 rounded-full shadow-xs hover:shadow-sm border border-slate-100/50"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>
      </motion.div>

      {/* Page Title */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center mb-10 text-center"
      >
        <div className="relative mb-2">
          <ShoppingCart size={40} className="text-emerald-600" />
          {cartData.length > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={cartData.length}
              className="absolute -top-2 -right-3 bg-red-500 text-white rounded-full text-xs font-bold w-6 h-6 flex items-center justify-center shadow-md shadow-red-500/20"
            >
              {cartData.length}
            </motion.span>
          )}
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Your Shopping Cart
        </h2>
        <p className="text-slate-500 text-sm mt-2 max-w-md">
          {cartData.length > 0 
            ? "Review your items and checkout to get super-fast 10 minutes delivery."
            : "Your cart is feeling a bit light. Let's add some fresh groceries!"}
        </p>
      </motion.div>

      {cartData.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center py-16 px-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40 max-w-md mx-auto"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100"
          >
            <ShoppingBag size={36} className="text-emerald-600" />
          </motion.div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Your Cart is Empty</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Browse our wide selection of organic vegetables, dairy, fresh fruits and other daily essentials.
          </p>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-emerald-600/20 transition-all duration-200 cursor-pointer"
            >
              Continue Shopping
            </motion.button>
          </Link>
        </motion.div>
      ) : (
        /* Two Column Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cartData.map((item: ICartItem) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ 
                    opacity: 0, 
                    x: -100, 
                    scale: 0.95,
                    height: 0, 
                    marginBottom: 0, 
                    paddingTop: 0, 
                    paddingBottom: 0, 
                    marginTop: 0,
                    borderWidth: 0,
                    transition: { duration: 0.3 } 
                  }}
                  className="bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-contain p-2 transition-transform duration-300 hover:scale-105"
                      />
                    </div>

                    {/* Product Metadata */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider w-fit block mb-1">
                        {item.category}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-800 line-clamp-1 hover:text-emerald-600 transition-colors duration-200">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        {item.unit}
                      </p>
                    </div>
                  </div>

                  {/* Pricing, Quantity Controls, Remove button */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 border-t border-slate-50 pt-4 sm:pt-0 sm:border-none">
                    {/* Item Price */}
                    <div className="flex flex-col text-left sm:text-right min-w-17.5">
                      <span className="text-[10px] text-slate-400 font-medium">Subtotal</span>
                      <span className="text-base font-extrabold text-slate-900">
                        ₹{(Number(item.price) * item.quantity).toFixed(2)}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-slate-400">
                          (₹{item.price} each)
                        </span>
                      )}
                    </div>

                    {/* Quantity Adjustment Controls */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-1">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => item._id && handleQtyUpdate(item._id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-colors cursor-pointer active:scale-95"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </motion.button>
                      <span className="text-sm font-bold text-slate-800 w-6 text-center select-none">
                        {item.quantity}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => item._id && handleQtyUpdate(item._id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-colors cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>

                    {/* Remove Action */}
                    <motion.button
                      whileHover={{ scale: 1.1, color: "#ef4444" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => item._id && handleRemove(item._id)}
                      className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer p-2 hover:bg-red-50 rounded-xl"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Sticky Summary Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:sticky lg:top-28 space-y-4"
          >
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md shadow-slate-100/40">
              <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-emerald-600" />
                <span>Order Summary</span>
              </h3>

              {/* Fee Breakdown */}
              <div className="space-y-3.5 text-sm pb-5 border-b border-slate-100">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-slate-800">₹{subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-slate-400" />
                    <span>Delivery Charge</span>
                  </span>
                  <span className="font-semibold">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold uppercase">
                        Free
                      </span>
                    ) : (
                      `₹${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Packaging & Platform Fee</span>
                  <span className="font-semibold text-slate-800">₹{platformFee.toFixed(2)}</span>
                </div>

                {/* Free shipping progress indicator */}
                {subTotal < 250 && subTotal > 0 && (
                  <div className="bg-emerald-50/50 border border-emerald-100/40 rounded-xl p-3 mt-4 text-xs text-slate-600">
                    <span className="font-medium text-emerald-700 block mb-1">
                      Add <span className="font-bold">₹{(250 - subTotal).toFixed(2)}</span> more for Free Delivery!
                    </span>
                    <div className="w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(subTotal / 250) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Total amount to pay */}
              <div className="flex justify-between items-center pt-5 pb-6">
                <span className="text-base font-bold text-slate-800">Grand Total</span>
                <span className="text-2xl font-extrabold text-slate-900">₹{finalTotal.toFixed(2)}</span>
              </div>

              {/* Checkout CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={()=>router.push("/user/checkout")}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-emerald-600/20 transition duration-200 cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>Checkout Now</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>

            {/* Badges / Safe Checkout */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 px-4">
              <ShieldCheck className="w-4 h-4 text-slate-300 shrink-0" />
              <span>Safe and Secure Payments. 100% Authentic products.</span>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
