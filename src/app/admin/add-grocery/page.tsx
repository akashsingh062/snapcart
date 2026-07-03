"use client"
import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { 
  ArrowLeft, 
  Upload, 
  Plus, 
  CheckCircle2, 
  ShoppingBag, 
  DollarSign, 
  Scale, 
  Layers,
  Loader2,
  X,
  FileImage
} from 'lucide-react'
import axios from 'axios'

const AddGroceryPage = () => {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Fruits & Vegitables')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('1 kg')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const units = [
    "1 kg",
    "500 g",
    "250 g",
    "1 L",
    "500 ml",
    "250 ml",
    "1 pc",
    "6 pcs",
    "12 pcs",
    "1 pack",
    "1 box",
  ]
  const categories = [
    "Fruits & Vegitables",
    "Dairy",
    "Rice, Atta & Grains",
    "Snacks & Branded Foods",
    "Beverages",
    "Frozen Foods",
    "Personal Care",
    "Household Needs",
    "Eggs, Meat & Fish",
    "Oils & Masalas",
    "Baby & Kids",
    "Health & Wellness",
    "Stationery & Office Supplies",
    "Pets & Animals",
    "Home & Kitchen",
  ]

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) {
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
        setError('')
      } else {
        setError('Please upload an image file.')
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type.startsWith('image/')) {
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
        setError('')
      } else {
        setError('Please upload an image file.')
      }
    }
  }

  const removeSelectedImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setImageFile(null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('Please enter the grocery item name.')
    if (!category) return setError('Please select a category.')
    if (!price.trim() || isNaN(Number(price))) return setError('Please enter a valid price.')
    if (!unit.trim()) return setError('Please specify the unit size (e.g. 1 kg, 500 ml).')
    if (!imageFile) return setError('Please upload an image for the grocery item.')

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('category', category)
      formData.append('price', price.trim())
      formData.append('unit', unit.trim())
      formData.append('image', imageFile)

      const res = await axios.post('/api/auth/admin/add-grocery', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (res.data.success) {
        setSuccess(true)
        setName('')
        setCategory('Fruits & Vegitables')
        setPrice('')
        setUnit('1 kg')
        setImageFile(null)
        setImagePreview('')
      } else {
        setError(res.data.error || 'Failed to add grocery item.')
      }
    } catch (err) {
      console.error(err)
      setError('An error occurred during submission. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-28 px-4 flex justify-center items-center bg-radial from-slate-50 via-white to-green-50/15 font-sans">
      <div className="w-full max-w-3xl bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-10 relative overflow-hidden flex flex-col gap-6">
        
        {/* Decorative Background Blobs */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-green-200/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-200/10 rounded-full blur-3xl -z-10" />

        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-4 gap-4">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-green-600 font-semibold text-sm transition group w-fit">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100 shadow-inner">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Add Grocery Item</h1>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Catalog Management</p>
            </div>
          </div>
        </div>

        {/* Dynamic Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3.5 rounded-2xl text-sm font-semibold flex items-center gap-2.5"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3.5 rounded-2xl text-sm font-semibold flex items-center gap-2.5"
            >
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>Grocery item has been successfully listed in the database!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Grocery Name */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="name" className="text-slate-700 text-sm font-bold flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-slate-400" />
                Item Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fresh Organic Strawberries"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-sm font-medium border-solid"
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex flex-col gap-2">
              <label htmlFor="category" className="text-slate-700 text-sm font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-400" />
                Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-sm font-semibold appearance-none cursor-pointer border-solid"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-slate-200 pl-3">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Unit Dropdown */}
            <div className="flex flex-col gap-2">
              <label htmlFor="unit" className="text-slate-700 text-sm font-bold flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-slate-400" />
                Unit / Quantity
              </label>
              <div className="relative">
                <select
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-sm font-semibold appearance-none cursor-pointer border-solid"
                >
                  {units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-slate-200 pl-3">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Price Input */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="price" className="text-slate-700 text-sm font-bold flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-slate-400" />
                Price (₹)
              </label>
              <input
                type="text"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 199"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-sm font-medium border-solid"
              />
            </div>

            {/* File Drag & Drop Box */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-slate-700 text-sm font-bold flex items-center gap-1.5">
                <FileImage className="w-4 h-4 text-slate-400" />
                Product Image
              </label>
              
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative min-h-[200px] overflow-hidden ${
                  dragActive 
                    ? "border-green-600 bg-green-50/20" 
                    : "border-slate-200 bg-slate-50/50 hover:border-green-500 hover:bg-green-50/5"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="absolute inset-0 w-full h-full group/image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={removeSelectedImage}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2.5 shadow-lg active:scale-95 transition cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shadow-inner border border-green-100 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-slate-700 text-sm font-bold">Drag and drop your image here</p>
                      <p className="text-slate-400 text-xs font-semibold mt-1">or click to browse from device</p>
                    </div>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold mt-2">
                      Supports: JPG, PNG, WEBP (Max 5MB)
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-green-600/20 active:scale-[0.99] transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed text-sm sm:text-base border border-transparent cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading item to catalog...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add Grocery Item
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default AddGroceryPage