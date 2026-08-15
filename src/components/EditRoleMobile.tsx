"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Bike,
  User,
  UserCog,
  Phone,
  ArrowRight,
  Loader2,
  Check,
} from "lucide-react";
import axios from "axios";



const EditRoleMobile = () => {
  const router = useRouter();
  const [roles, setRoles] = useState([
    {
      id: "user",
      label: "Customer",
      desc: "Browse items, place orders, and track deliveries",
      icon: User,
    },
    {
      id: "deliveryBoy",
      label: "Delivery Partner",
      desc: "Deliver orders, manage deliveries, and earn money",
      icon: Bike,
    },
    {
      id: "admin",
      label: "Administrator",
      desc: "Manage system, users, roles, and settings",
      icon: UserCog,
    },
  ]);

  const checkForAdmin = async () => {
    try {
      const res = await axios.get("/api/auth/check-for-admin");
      return res.data.success;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    checkForAdmin().then((isAdmin) => {
      if (isAdmin) {
        setRoles((prev) => prev.filter((r) => r.id !== "admin"));
      }
    });
  }, []);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [mobile, setMobile] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setError("Please select a role.");
      return;
    }
    if (!mobile || mobile.trim().length < 10) {
      setError("Please enter a valid mobile number.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/auth/user/edit-role-mobile", {
        role: selectedRole,
        mobile: mobile.trim(),
      });
      if (!res.data.success) {
        setError(res.data.message || "Failed to update profile details.");
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-radial from-slate-50 via-white to-green-50/20 p-4 md:p-8 font-sans">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-10 space-y-8 relative overflow-hidden">
        {/* Background decorative blob */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-200/20 rounded-full blur-3xl -z-10" />

        <div className="text-center space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight"
          >
            Complete Your <span className="text-green-600">Profile</span>
          </motion.h1>
          <p className="text-slate-500 text-sm md:text-base max-w-md mx-auto">
            We need a few more details to set up your account on Snapcart.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Role Selection */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <label className="text-sm font-semibold text-slate-700 tracking-wide uppercase">
              Select your account type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <motion.div
                    key={role.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedRole(role.id);
                      setError("");
                    }}
                    className={`relative flex flex-col items-center justify-between p-5 border rounded-2xl cursor-pointer text-center transition-all duration-300 min-h-40 ${
                      isSelected
                        ? "border-green-600 bg-green-50/50 text-green-800 shadow-md ring-2 ring-green-600/10"
                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 bg-green-600 text-white rounded-full p-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <div
                      className={`p-3 rounded-xl mb-3 ${
                        isSelected
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-50 text-slate-400 group-hover:text-slate-500"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm tracking-wide mb-1">
                        {role.label}
                      </h3>
                      <p className="text-xs text-slate-400 leading-snug">
                        {role.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Mobile Input */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <label className="text-sm font-semibold text-slate-700 tracking-wide uppercase">
              Enter mobile number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  setError("");
                }}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/10 transition-all text-base font-medium"
                required
              />
            </div>
          </motion.div>

          {/* CTA Button */}
          {(() => {
            const isBtnDisabled = !mobile || !selectedRole || loading;
            return (
              <motion.button
                type="submit"
                whileHover={isBtnDisabled ? {} : { scale: 1.01 }}
                whileTap={isBtnDisabled ? {} : { scale: 0.99 }}
                disabled={isBtnDisabled}
                className={`w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 mt-4 text-center text-base shadow-lg flex items-center justify-center gap-2 border border-transparent ${
                  isBtnDisabled
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-green-600 hover:bg-green-700 text-white cursor-pointer active:shadow-md hover:shadow-green-600/15"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving Details...
                  </>
                ) : (
                  <>
                    Complete Profile
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            );
          })()}
        </form>
      </div>
    </div>
  );
};

export default EditRoleMobile;
