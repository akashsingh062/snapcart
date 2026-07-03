"use client"
import React from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Plus } from 'lucide-react'

export interface IGrocery {
  _id?: string;
  name: string;
  category: string;
  price: string;
  unit: string;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const GroceryItemCard = ({item}: {item: IGrocery}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      viewport={{ once: false, margin: "-50px" }}
      className="group relative flex flex-col justify-between bg-white border border-slate-100 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:border-slate-200"
    >
      <div>
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
            {item.category}
          </span>
        </div>

        {/* Product Image Container */}
        <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center mb-4">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            priority={false}
          />
        </div>

        {/* Product Info */}
        <h3 className="text-sm sm:text-base font-semibold text-slate-800 line-clamp-2 min-h-10 leading-tight group-hover:text-emerald-600 transition-colors duration-200">
          {item.name}
        </h3>
        
        {/* Quantity/Unit */}
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          {item.unit}
        </p>
      </div>

      {/* Pricing and Button */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 font-medium">Price</span>
          <span className="text-base sm:text-lg font-extrabold text-slate-900">
            ₹{item.price}
          </span>
        </div>
        
        <button
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-600 border border-emerald-100/50 hover:border-emerald-600 text-emerald-600 hover:text-white text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95 shadow-2xs hover:shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>
    </motion.div>
  )
}

export default GroceryItemCard
