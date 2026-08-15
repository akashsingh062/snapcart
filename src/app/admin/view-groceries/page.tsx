"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Edit2,
  Image as ImageIcon,
  Loader2,
  PlusCircle,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";

interface IGroceryItem {
  _id: string;
  name: string;
  category: string;
  price: string;
  unit: string;
  image: string;
  createdAt?: string;
}

const CATEGORIES = [
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
];

const UNITS = [
  "1 kg", "500 g", "250 g", "1 L", "500 ml", "250 ml",
  "1 pc", "6 pcs", "12 pcs", "1 pack", "1 box",
];

export default function ViewGroceriesPage() {
  const [groceries, setGroceries] = useState<IGroceryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Edit Modal State
  const [editItem, setEditItem] = useState<IGroceryItem | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editCategory, setEditCategory] = useState<string>("");
  const [editUnit, setEditUnit] = useState<string>("");
  const [editPrice, setEditPrice] = useState<string>("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  // Delete Modal State
  const [deleteItem, setDeleteItem] = useState<IGroceryItem | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchGroceries = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await axios.get("/api/auth/admin/groceries");
      if (res.data?.success) {
        setGroceries(res.data.groceries || []);
      }
    } catch {
      // Failed to fetch groceries
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const res = await axios.get("/api/auth/admin/groceries");
        if (isMounted && res.data?.success) {
          setGroceries(res.data.groceries || []);
        }
      } catch {
        // Failed to load groceries
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const openEditModal = (item: IGroceryItem) => {
    setEditItem(item);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditUnit(item.unit);
    setEditPrice(item.price);
    setEditImagePreview(item.image);
    setEditImageFile(null);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", editName);
      formData.append("category", editCategory);
      formData.append("unit", editUnit);
      formData.append("price", editPrice);
      if (editImageFile) {
        formData.append("image", editImageFile);
      }

      const res = await axios.put(`/api/auth/admin/grocery/${editItem._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && res.data?.grocery) {
        setGroceries((prev) =>
          prev.map((g) => (g._id === editItem._id ? res.data.grocery : g))
        );
        setEditItem(null);
      }
    } catch {
      alert("Failed to save changes. Please check your network and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    setDeleting(true);
    try {
      const res = await axios.delete(`/api/auth/admin/grocery/${deleteItem._id}`);
      if (res.data?.success) {
        setGroceries((prev) => prev.filter((g) => g._id !== deleteItem._id));
        setDeleteItem(null);
      }
    } catch {
      alert("Failed to delete item. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredGroceries = groceries.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-2">
        <Loader2 size={24} className="animate-spin text-slate-400" />
        <p className="text-slate-400 text-sm">Loading catalog...</p>
      </div>
    );
  }

  return (
    <div className="w-[95%] max-w-6xl mx-auto pt-20 pb-16 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Grocery Catalog</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {groceries.length} items · View, edit or remove products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/add-grocery">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
              <PlusCircle size={14} />
              Add Item
            </button>
          </Link>
          <button
            onClick={() => fetchGroceries(true)}
            disabled={refreshing}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Search + Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or category..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-300 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              selectedCategory === "all"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            All ({groceries.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = groceries.filter(
              (g) => g.category.toLowerCase() === cat.toLowerCase()
            ).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Items Grid */}
      {filteredGroceries.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <ShoppingBag size={28} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-900">
            {searchQuery ? `No items match "${searchQuery}"` : "No items in catalog"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? "Try a different search term" : "Add your first grocery item"}
          </p>
          {!searchQuery && (
            <Link href="/admin/add-grocery">
              <button className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                Add Item
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredGroceries.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden group hover:border-slate-300 transition-colors"
            >
              {/* Image */}
              <div className="relative w-full aspect-square bg-slate-50 border-b border-slate-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain p-3"
                />
                <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-white/90 rounded-md text-[10px] font-medium text-slate-600 border border-slate-200">
                  {item.unit}
                </span>
              </div>

              {/* Info */}
              <div className="p-3 space-y-1">
                <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider truncate">
                  {item.category}
                </p>
                <h4 className="font-semibold text-slate-900 text-sm leading-tight line-clamp-1">
                  {item.name}
                </h4>
                <p className="text-sm font-bold text-slate-900">
                  ₹{item.price}
                </p>
              </div>

              {/* Actions */}
              <div className="px-3 pb-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="flex-1 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteItem(item)}
                  className="py-1.5 px-2.5 bg-white hover:bg-rose-50 text-rose-500 text-xs rounded-lg border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editItem && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <Edit2 size={15} className="text-slate-400" />
                  Edit Item
                </h3>
                <button
                  onClick={() => setEditItem(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Image */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-slate-50 border border-slate-200 relative overflow-hidden shrink-0 flex items-center justify-center">
                    {editImagePreview ? (
                      <Image src={editImagePreview} alt="preview" fill className="object-contain p-1" />
                    ) : (
                      <ImageIcon className="text-slate-400 w-6 h-6" />
                    )}
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-lg border border-slate-200 transition-colors cursor-pointer">
                    <Upload size={13} />
                    <span>Change Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500">Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:border-slate-300"
                  />
                </div>

                {/* Category + Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:border-slate-300"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Unit</label>
                    <select
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:border-slate-300"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:border-slate-300"
                  />
                </div>

                {/* Buttons */}
                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditItem(null)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {saving ? (
                      <><Loader2 size={14} className="animate-spin" /> Saving...</>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteItem && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-6 shadow-xl border border-slate-200 w-full max-w-sm text-center space-y-4"
            >
              <Trash2 size={24} className="text-rose-500 mx-auto" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Delete this item?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  &quot;{deleteItem.name}&quot; will be permanently removed from the catalog.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDeleteItem(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  {deleting ? (
                    <><Loader2 size={14} className="animate-spin" /> Deleting...</>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
