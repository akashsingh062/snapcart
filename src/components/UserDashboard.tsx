import React from "react";
import HeroSection from "./HeroSection";
import CategorySilder from "./CategorySilder";
import GroceryItemCard, { IGrocery } from "./GroceryItemCard";
import connectdb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import Link from "next/link";
import { SearchX, Sparkles, X } from "lucide-react";

interface UserDashboardProps {
  search?: string;
  category?: string;
}

const UserDashboard = async ({ search, category }: UserDashboardProps) => {
  await connectdb();

  const query: Record<string, unknown> = {};
  if (category && category !== "all") {
    query.category = category;
  }
  if (search && search.trim()) {
    query.name = { $regex: search.trim(), $options: "i" };
  }

  const groceries = await Grocery.find(query).sort({ createdAt: -1 });
  const plainGroceries = JSON.parse(JSON.stringify(groceries));

  const isFiltered = Boolean(search?.trim() || (category && category !== "all"));

  return (
    <>
      {!isFiltered && <HeroSection />}
      <CategorySilder selectedCategory={category} />
      <div id="products" className="w-[95%] sm:w-[90%] md:w-[85%] max-w-6xl mx-auto px-4 mb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {search && category
                  ? `"${search}" in ${category}`
                  : search
                  ? `Search results for "${search}"`
                  : category && category !== "all"
                  ? `${category}`
                  : "Fresh Groceries"}
              </h2>
              {isFiltered && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                  {plainGroceries.length} {plainGroceries.length === 1 ? "item" : "items"}
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm mt-1 sm:text-base">
              {isFiltered
                ? "Showing products matching your search criteria."
                : "Quality items picked fresh just for your daily needs."}
            </p>
          </div>

          {isFiltered && (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 self-start sm:self-auto text-sm font-semibold text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-300 px-4 py-2 rounded-full transition-all duration-200 shadow-xs hover:shadow-sm"
            >
              <X size={15} />
              <span>Clear Filter</span>
            </Link>
          )}
        </div>

        {plainGroceries.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-lg mx-auto shadow-xs my-8">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchX size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              No products found
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              We couldn&apos;t find any groceries matching{" "}
              <span className="font-semibold text-slate-700">
                &ldquo;{search || category}&rdquo;
              </span>
              . Try searching with different keywords or browse all categories.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Sparkles size={16} />
              <span>Explore All Products</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {plainGroceries.map((item: IGrocery, idx: number) => (
              <GroceryItemCard item={item} key={idx} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default UserDashboard;
