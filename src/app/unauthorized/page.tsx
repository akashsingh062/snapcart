"use client"
import React from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react'

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-radial from-slate-50 via-white to-red-50/15 p-4 md:p-8 font-sans">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-2xl p-8 md:p-10 text-center relative overflow-hidden">
        {/* Background decorative blob */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-200/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-200/10 rounded-full blur-3xl -z-10" />

        {/* Animated Warning Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [1, 1.1, 1], opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/10 border border-red-100"
        >
          <ShieldAlert className="w-10 h-10 animate-pulse" />
        </motion.div>

        {/* Text Area */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-3"
        >
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Access Denied
          </h1>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            You do not have the required role or permissions to access this directory. If you believe this is a mistake, please try switching accounts.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center pt-8"
        >
          <Link href="/" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded-2xl shadow-lg hover:shadow-green-600/10 active:scale-[0.98] transition-all duration-200 cursor-pointer text-sm border border-transparent">
              <Home className="w-4.5 h-4.5" />
              Back Home
            </button>
          </Link>
          <Link href="/auth/login" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-3 px-5 rounded-2xl active:scale-[0.98] transition-all duration-200 cursor-pointer text-sm">
              <ArrowLeft className="w-4.5 h-4.5" />
              Switch User
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default UnauthorizedPage