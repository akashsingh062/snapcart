"use client";
import {
  Leaf,
  Smartphone,
  Truck,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";

const HeroSection = () => {
  const slides = [
    {
      id: 1,
      icon: (
        <Leaf className="w-20 h-20 sm:w-24 text-green-400 drop-shadow-lg" />
      ),
      title: "Fresh Organic Groceries",
      subtitle:
        "Farm-fresh fruits, vegetables, and daily essentials delivered to you.",
      btnText: "Shop Now",
      bg: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200",
    },
    {
      id: 2,
      icon: (
        <Truck className="w-20 h-20 sm:w-24 text-green-400 drop-shadow-lg" />
      ),
      title: "Fast Delivery",
      subtitle: "Get your groceries delivered to your doorstep in no time.",
      btnText: "Order Now",
      bg: "https://images.unsplash.com/photo-1695653422259-8a74ffe90401?auto=format&fit=crop&q=80&w=1200",
    },
    {
      id: 3,
      icon: (
        <Smartphone className="w-20 h-20 sm:w-24 text-green-400 drop-shadow-lg" />
      ),
      title: "Easy Shopping",
      subtitle: "Shop for groceries with ease from our app.",
      btnText: "Get Started",
      bg: "https://plus.unsplash.com/premium_photo-1682088356987-33bbbb26d650?auto=format&fit=crop&q=80&w=1200",
    },
  ];

  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [current, slides.length]);

  return (
    <div className="w-[95%] max-w-7xl mx-auto mt-28 relative h-112.5 md:h-137.5 overflow-hidden rounded-3xl shadow-2xl group bg-slate-950">
      {/* Slide Container */}
      <AnimatePresence>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${slides[current].bg})` }}
        >
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/55 to-transparent" />

          {/* Content area */}
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 md:px-20 text-left z-10 max-w-3xl space-y-4 md:space-y-6">
            {/* Animated Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="w-20 h-20 sm:w-24 flex items-center justify-start"
            >
              {slides[current].icon}
            </motion.div>

            {/* Animated Title */}
            <motion.h2
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-md tracking-tight"
            >
              {slides[current].title}
            </motion.h2>

            {/* Animated Subtitle */}
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="text-slate-200 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed drop-shadow"
            >
              {slides[current].subtitle}
            </motion.p>

            {/* Animated Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-full shadow-lg hover:shadow-green-600/30 transition-all duration-300 w-fit cursor-pointer flex items-center gap-2 text-sm sm:text-base border border-transparent"
            >
              {slides[current].btnText}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Left arrow controller */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer z-20 active:scale-95 shadow-md"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Right arrow controller */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer z-20 active:scale-95 shadow-md"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              current === index
                ? "w-8 bg-green-500 shadow-md shadow-green-500/50"
                : "w-2.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
