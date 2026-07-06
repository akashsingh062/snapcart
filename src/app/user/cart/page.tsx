"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { motion } from "motion/react";

const cartPage = () => {
  return (
    <div className="w-[95%] sm:w-[90%] md:w-[80%] mx-auto mt-8 mb-24 relative ">
      <Link
        href="/"
        className="absolute -top-2 left-0 flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-all"
      >
        <ArrowLeft size={20} />
        <span className="hidden sm:inline">Back to home</span>
      </Link>
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-2xl sm:text-3xl font-bold text-green-700 mb-10 text-center"
      >
        Your Shopping Cart
      </motion.h2>
    </div>
  );
};

export default cartPage;
