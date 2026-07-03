import React from "react";
import HeroSection from "./HeroSection";
import CategorySilder from "./CategorySilder";
import GroceryItemCard, { IGrocery } from "./GroceryItemCard";
import connectdb from "@/lib/db";
import Grocery from "@/models/grocery.model";

const UserDashboard = async() => {
  await connectdb()
  const groceries = await Grocery.find({})
  const plainGroceries = JSON.parse(JSON.stringify(groceries))

  return (
    <>
      <HeroSection />
      <CategorySilder />
      <div className="w-[95%] max-w-7xl mx-auto px-4 mb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Fresh Groceries
            </h2>
            <p className="text-slate-500 text-sm mt-1 sm:text-base">
              Quality items picked fresh just for your daily needs.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {plainGroceries.map((item: IGrocery, idx: number) => (
            <GroceryItemCard item={item} key={idx} />
          ))}
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
