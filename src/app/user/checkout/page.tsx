"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Banknote,
  Building,
  CheckCircle2,
  CreditCard,
  Home,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  PinIcon,
  ShieldCheck,
  ShoppingCart,
  User,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { emptyCart, ICartItem } from "@/redux/cartSlice";
import dynamic from "next/dynamic";
import axios from "axios";

const CheckoutMap = dynamic(() => import("./CheckoutMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">
      Loading map...
    </div>
  ),
});

const Checkout = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userData } = useSelector((state: RootState) => state.user);
  const { cartData, subTotal, deliveryFee, platformFee, finalTotal } = useSelector(
    (state: RootState) => state.cart
  );
  const cartItems = cartData;
  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    fullAddress: "",
  });
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">(
    "cod"
  );

  useEffect(() => {
    const fetchIpFallback = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.latitude && data.longitude) {
          setPosition([data.latitude, data.longitude]);
          setAddress((prev) => ({
            ...prev,
            city: prev.city || data.city || "",
            state: prev.state || data.region || "",
            pincode: prev.pincode || data.postal || "",
          }));
        } else {
          setPosition([28.6139, 77.209]);
        }
      } catch {
        setPosition([28.6139, 77.209]);
      }
    };
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          fetchIpFallback();
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      fetchIpFallback();
    }
  }, []);

  useEffect(() => {
    if (userData) {
      const timer = setTimeout(() => {
        setAddress((prev) => {
          if (
            prev.fullName === (userData.name || "") &&
            prev.mobile === (userData.mobile || "")
          ) {
            return prev;
          }
          return {
            ...prev,
            fullName: prev.fullName || userData.name || "",
            mobile: prev.mobile || userData.mobile || "",
          };
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [userData]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handelSearchQuery = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const { OpenStreetMapProvider } = await import("leaflet-geosearch");
      const provider = new OpenStreetMapProvider();
      const results = await provider.search({
        query: searchQuery,
      });
      if (results && results.length > 0) {
        setPosition([results[0].y, results[0].x]);
      }
    } catch {
      // Search failed
    } finally {
      setIsSearching(false);
    }
  };

  const handleFetchCurrentLocation = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("success") === "true") {
        dispatch(emptyCart());
        router.push("/user/order-success");
      }
    }
  }, [dispatch, router]);

  const handlePlaceOrder = async () => {
    if (
      !address.fullName.trim() ||
      !address.mobile.trim() ||
      !address.fullAddress.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.pincode.trim()
    ) {
      alert("Please fill in all delivery details (Name, Mobile, Address, City, State, Pincode).");
      return;
    }
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderPayload = {
        items: cartItems.map((item: ICartItem) => ({
          grocery: item._id,
          name: item.name,
          price: String(item.price),
          unit: item.unit || "unit",
          image: item.image,
          quantity: item.quantity,
        })),
        totalAmount: String(finalTotal),
        paymentMethod: paymentMethod === "cod" ? "cod" : "online",
        address: {
          fullName: address.fullName,
          mobile: address.mobile,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          fullAddress: address.fullAddress,
          latitude: position ? position[0] : 0,
          longitude: position ? position[1] : 0,
        },
      };

      if (paymentMethod === "card") {
        const res = await axios.post("/api/auth/user/payment", orderPayload);
        if (res.data?.sessionUrl) {
          window.location.href = res.data.sessionUrl;
        } else {
          alert(res.data?.error || "Failed to initiate online payment.");
          setIsPlacingOrder(false);
        }
      } else {
        const res = await axios.post("/api/auth/user/order", orderPayload);
        if (res.status === 200 || res.data?.order) {
          dispatch(emptyCart());
          router.push("/user/order-success");
        } else {
          alert(res.data?.error || "Failed to place order.");
          setIsPlacingOrder(false);
        }
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to place order. Please try again.";
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      alert(errorMessage);
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="w-[95%] sm:w-[90%] md:w-[85%] max-w-6xl mx-auto pt-28 pb-20 relative">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-all group bg-white px-4 py-2 rounded-full shadow-xs hover:shadow-sm border border-slate-100/50 cursor-pointer"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          <span>Back to Cart</span>
        </button>
      </motion.div>

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Checkout
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Complete your delivery details and place your order.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Delivery Address
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Where should we deliver your order?
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-3 text-emerald-600"
              />
              <input
                type="text"
                value={address.fullName}
                onChange={(e) =>
                  setAddress((prev) => ({ ...prev, fullName: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="relative">
              <Phone
                size={18}
                className="absolute left-3 top-3 text-emerald-600"
              />
              <input
                type="text"
                value={address.mobile}
                onChange={(e) =>
                  setAddress((prev) => ({ ...prev, mobile: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="relative">
              <Home
                size={18}
                className="absolute left-3 top-3 text-emerald-600"
              />
              <input
                type="text"
                placeholder="Full Address"
                value={address.fullAddress}
                onChange={(e) =>
                  setAddress((prev) => ({
                    ...prev,
                    fullAddress: e.target.value,
                  }))
                }
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="relative">
                <Building
                  size={18}
                  className="absolute left-3 top-3 text-emerald-600"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={address.city}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, city: e.target.value }))
                  }
                />
              </div>
              <div className="relative">
                <Navigation
                  size={18}
                  className="absolute left-3 top-3 text-emerald-600"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={address.state}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, state: e.target.value }))
                  }
                />
              </div>
              <div className="relative">
                <PinIcon
                  size={18}
                  className="absolute left-3 top-3 text-emerald-600"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={address.pincode}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, pincode: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <input
                type="text"
                placeholder="Search city or area..."
                className="w-full pl-10 pr-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handelSearchQuery();
                  }
                }}
              />
              <button
                onClick={handelSearchQuery}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-300 min-w-22.5"
              >
                {isSearching ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Search"
                )}
              </button>
            </div>

            <div className="relative mt-6 h-80 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
              {position && (
                <>
                  <CheckoutMap
                    position={position}
                    setPosition={setPosition}
                    address={address}
                    setAddress={setAddress}
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFetchCurrentLocation}
                    disabled={isLocating}
                    title="Fetch Current Location"
                    className="absolute z-400 bottom-4 left-1/2 -translate-x-1/2 bg-white text-emerald-700 p-2.5 rounded-full shadow-lg hover:bg-emerald-700 hover:text-white transition-all duration-300 flex items-center gap-2 border border-slate-200"
                  >
                    {isLocating ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <LocateFixed size={20} />
                    )}
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>
        {/* Right Column: Order Summary & Payment Section */}
        <div className="w-full space-y-6">
          {/* Order Summary Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100 relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-6 relative">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
                <ShoppingCart size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Order Summary
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
                </p>
              </div>
            </div>

            <div className="space-y-4 relative">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <ShoppingCart className="mx-auto text-slate-300 mb-2" size={32} />
                  <p className="text-slate-500 text-sm font-medium">No items in cart</p>
                </div>
              ) : (
                <>
                  <div className="max-h-72 overflow-y-auto space-y-3 pr-1.5 scrollbar-thin">
                    {cartItems.map((item: ICartItem) => (
                      <div
                        key={item._id}
                        className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 hover:bg-green-50/50 border border-slate-100 transition-all duration-200"
                      >
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-white">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900 truncate">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-xs text-slate-500">
                              ₹{item.price} each
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-sm text-slate-900 shrink-0">
                          ₹{Number(item.price) * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="border-t border-slate-100 pt-4 space-y-2.5 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-900">₹{subTotal}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Delivery Fee</span>
                      <span>
                        {deliveryFee === 0 ? (
                          <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                            FREE
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-900">₹{deliveryFee}</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Packaging & Platform Fee</span>
                      <span className="font-semibold text-slate-900">₹{platformFee}</span>
                    </div>

                    {/* Total Highlight Banner */}
                    <div className="p-4 rounded-2xl bg-emerald-700 text-white shadow-md mt-3 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-emerald-100 uppercase font-bold tracking-wider">
                          Total Payable Amount
                        </p>
                        <p className="text-2xl font-extrabold tracking-tight mt-0.5">
                          ₹{finalTotal}
                        </p>
                      </div>
                      <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">
                        Tax Included
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Payment Method Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100 space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
                <CreditCard size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Payment Method
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Select your preferred payment option
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Credit / Debit Card Option */}
              <div
                onClick={() => setPaymentMethod("card")}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center gap-4 ${
                  paymentMethod === "card"
                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-500/20 shadow-sm"
                    : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    paymentMethod === "card"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <CreditCard size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">
                      Credit / Debit Card
                    </h3>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        paymentMethod === "card"
                          ? "bg-blue-600 text-white"
                          : "border-2 border-slate-300"
                      }`}
                    >
                      {paymentMethod === "card" && <CheckCircle2 size={14} />}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Visa, Mastercard, RuPay, Amex
                  </p>
                </div>
              </div>

              {/* Cash on Delivery (COD) Option */}
              <div
                onClick={() => setPaymentMethod("cod")}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center gap-4 ${
                  paymentMethod === "cod"
                    ? "border-emerald-700 bg-green-50 ring-2 ring-emerald-500/20 shadow-sm"
                    : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    paymentMethod === "cod"
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Banknote size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">
                      Cash on Delivery (COD)
                    </h3>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        paymentMethod === "cod"
                          ? "bg-emerald-700 text-white"
                          : "border-2 border-slate-300"
                      }`}
                    >
                      {paymentMethod === "cod" && <CheckCircle2 size={14} />}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pay with cash or card at delivery
                  </p>
                </div>
              </div>
            </div>

            {/* Place Order CTA Button */}
            {cartItems.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className={`w-full mt-6 py-4 px-6 rounded-2xl font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                  paymentMethod === "card"
                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                    : "bg-emerald-700 hover:bg-emerald-800 shadow-emerald-200"
                }`}
              >
                {isPlacingOrder ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <ShieldCheck size={20} />
                )}
                <span className="tracking-wide">
                  {isPlacingOrder
                    ? "Processing Order..."
                    : paymentMethod === "card"
                    ? `Pay ₹${finalTotal} with Card`
                    : `Place Order • ₹${finalTotal} (COD)`}
                </span>
              </motion.button>
            )}

            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs pt-1">
              <ShieldCheck size={14} className="text-emerald-700" />
              <span>Guaranteed 256-bit SSL Encrypted Checkout</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
