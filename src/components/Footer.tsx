"use client";

import React from "react";
import Link from "next/link";
import { Leaf, Heart } from "lucide-react";

const Footer = () => {
  const categories = [
    { name: "Fruits & Vegetables", href: "/?category=Fruits%20%26%20Vegitables" },
    { name: "Dairy & Breakfast", href: "/?category=Dairy" },
    { name: "Rice & Grains", href: "/?category=Rice%2C%20Atta%20%26%20Grains" },
    { name: "Snacks", href: "/?category=Snacks%20%26%20Branded%20Foods" },
    { name: "Beverages", href: "/?category=Beverages" },
    { name: "Frozen Foods", href: "/?category=Frozen%20Foods" },
  ];

  const quickLinks = [
    { name: "Shop All", href: "/" },
    { name: "My Cart", href: "/user/cart" },
    { name: "My Orders", href: "/user/my-orders" },
  ];

  const legal = [
    { name: "Privacy Policy", href: "/" },
    { name: "Terms of Service", href: "/" },
    { name: "Refund Policy", href: "/" },
  ];

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/60">
      <div className="w-[95%] sm:w-[90%] md:w-[85%] max-w-6xl mx-auto">
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 py-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Snapcart
              </span>
            </Link>
            <p className="text-slate-500 text-xs leading-relaxed mt-3 max-w-55">
              Fresh groceries delivered to your doorstep in 10 minutes. Available in 45+ cities.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Categories
            </h4>
            <ul className="space-y-2">
              {categories.map((cat, i) => (
                <li key={i}>
                  <Link
                    href={cat.href}
                    className="text-slate-500 hover:text-emerald-400 text-sm transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-slate-500 hover:text-emerald-400 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              {legal.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-slate-500 hover:text-emerald-400 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider + Bottom */}
        <div className="border-t border-slate-800/60 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-600">
            © {new Date().getFullYear()} Snapcart Technologies Pvt. Ltd.
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>in India</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
