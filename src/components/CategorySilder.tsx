"use client"
import React, { useRef } from 'react'
import {
  Apple,
  Milk,
  Wheat,
  Cookie,
  Coffee,
  Snowflake,
  Sparkles,
  Home,
  Egg,
  Droplets,
  Baby,
  HeartPulse,
  Pencil,
  PawPrint,
  Utensils,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { motion } from 'motion/react'
const CategorySilder = () => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const categories = [
    {
      name: "Fruits & Vegitables",
      icon: Apple,
      bgColor: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100/80 hover:text-emerald-700",
    },
    {
      name: "Dairy",
      icon: Milk,
      bgColor: "bg-sky-50 text-sky-600 border-sky-100 hover:bg-sky-100/80 hover:text-sky-700",
    },
    {
      name: "Rice, Atta & Grains",
      icon: Wheat,
      bgColor: "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100/80 hover:text-amber-700",
    },
    {
      name: "Snacks & Branded Foods",
      icon: Cookie,
      bgColor: "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100/80 hover:text-orange-700",
    },
    {
      name: "Beverages",
      icon: Coffee,
      bgColor: "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100/80 hover:text-purple-700",
    },
    {
      name: "Frozen Foods",
      icon: Snowflake,
      bgColor: "bg-cyan-50 text-cyan-600 border-cyan-100 hover:bg-cyan-100/80 hover:text-cyan-700",
    },
    {
      name: "Personal Care",
      icon: Sparkles,
      bgColor: "bg-pink-50 text-pink-600 border-pink-100 hover:bg-pink-100/80 hover:text-pink-700",
    },
    {
      name: "Household Needs",
      icon: Home,
      bgColor: "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100/80 hover:text-indigo-700",
    },
    {
      name: "Eggs, Meat & Fish",
      icon: Egg,
      bgColor: "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100/80 hover:text-rose-700",
    },
    {
      name: "Oils & Masalas",
      icon: Droplets,
      bgColor: "bg-yellow-50 text-yellow-700 border-yellow-100 hover:bg-yellow-100/80 hover:text-yellow-800",
    },
    {
      name: "Baby & Kids",
      icon: Baby,
      bgColor: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100/80 hover:text-blue-700",
    },
    {
      name: "Health & Wellness",
      icon: HeartPulse,
      bgColor: "bg-red-50 text-red-600 border-red-100 hover:bg-red-100/80 hover:text-red-700",
    },
    {
      name: "Stationery & Office Supplies",
      icon: Pencil,
      bgColor: "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100/80 hover:text-slate-700",
    },
    {
      name: "Pets & Animals",
      icon: PawPrint,
      bgColor: "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100/80 hover:text-amber-800",
    },
    {
      name: "Home & Kitchen",
      icon: Utensils,
      bgColor: "bg-teal-50 text-teal-600 border-teal-100 hover:bg-teal-100/80 hover:text-teal-700",
    },
  ]

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current
      const scrollTo = direction === 'left' ? scrollLeft - 300 : scrollLeft + 300
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  return (
    <motion.div
    initial={{opacity:0, y:50}}
    whileInView={{opacity:1, y :0}}
    transition={{duration:0.6}}
    viewport={{once:false, amount:0.5}} 
     className="w-[95%] max-w-7xl mx-auto my-12 relative px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shop by Category
          </h2>
          <p className="text-slate-500 text-sm mt-1 sm:text-base">
            Select a category to explore fresh and high-quality products.
          </p>
        </div>
        {/* Navigation Buttons for larger screens */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2.5 rounded-full bg-white border border-slate-200 shadow-xs text-slate-600 hover:bg-slate-50 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Previous categories"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2.5 rounded-full bg-white border border-slate-200 shadow-xs text-slate-600 hover:bg-slate-50 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Next categories"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Categories Row */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category, index) => {
          const Icon = category.icon
          return (
            <div
              key={index}
              className="flex-none w-32 sm:w-36 snap-start flex flex-col items-center text-center cursor-pointer group"
            >
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center border transition-all duration-300 shadow-xs group-hover:shadow-md group-hover:-translate-y-1.5 ${category.bgColor}`}
              >
                <Icon className="w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <span className="mt-3 text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-slate-900 line-clamp-2 px-1 transition-colors duration-200">
                {category.name}
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default CategorySilder