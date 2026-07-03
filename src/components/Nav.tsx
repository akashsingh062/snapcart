"use client";
import Link from "next/link";
import {
  LogOut,
  Package,
  Search,
  ShoppingCart,
  User,
  X,
  PlusCircle,
  LayoutGrid,
  ClipboardList,
  Menu,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { createPortal } from "react-dom";

interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "user" | "deliveryBoy" | "admin";
  image?: string;
}
const Nav = ({ user }: { user: IUser }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchBarOpen, setSearchBarOpen] = useState(false);
  const profileDropDown = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropDown.current &&
        !profileDropDown.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchBarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropDown, searchContainerRef]);

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/auth/login");
            router.refresh();
          },
        },
      });
    } catch (error) {
      console.error("Signout failed:", error);
    }
  };

  const sidebar = mounted && typeof window !== "undefined"
    ? createPortal(
        <AnimatePresence>
          {menuOpen && (
            <>
              {/* Dark backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs z-60"
              />

              {/* Sidebar container */}
              <motion.div
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className="fixed top-0 right-0 h-full w-80 bg-slate-950 text-white z-70 shadow-2xl p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Header */}
                  <div className="flex justify-between items-center pb-6 border-b border-slate-800">
                    <h1 className="text-xl font-extrabold tracking-tight text-green-400">
                      {user.role === "admin" ? "Admin Panel" : "Menu"}
                    </h1>
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="w-10 h-10 rounded-full bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition duration-200 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Profile info section */}
                  <div className="py-8 flex flex-col items-center text-center border-b border-slate-800">
                    <div className="w-20 h-20 relative rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-green-500 shadow-lg shadow-green-500/20 mb-4">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt="profile"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <User className="text-green-500 w-10 h-10" />
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-white leading-snug">{user.name}</h2>
                    <p className="text-xs font-semibold uppercase tracking-wider text-green-400 mt-1">
                      {user.role}
                    </p>
                  </div>

                  {/* Nav Links */}
                  <div className="py-6 flex flex-col gap-2">
                    {user.role === "user" && (
                      <Link
                        href="/myorders"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition-all duration-200 text-sm font-semibold group"
                      >
                        <Package className="w-5 h-5 text-slate-500 group-hover:text-green-500 transition-colors" />
                        <span>My Orders</span>
                      </Link>
                    )}

                    {user.role === "admin" && (
                      <>
                        <Link
                          href="/admin/add-grocery"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition-all duration-200 text-sm font-semibold group"
                        >
                          <PlusCircle className="w-5 h-5 text-slate-500 group-hover:text-green-500 transition-colors" />
                          <span>Add Grocery</span>
                        </Link>
                        <Link
                          href="/admin/view-groceries"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition-all duration-200 text-sm font-semibold group"
                        >
                          <LayoutGrid className="w-5 h-5 text-slate-500 group-hover:text-green-500 transition-colors" />
                          <span>View Groceries</span>
                        </Link>
                        <Link
                          href="/admin/orders"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition-all duration-200 text-sm font-semibold group"
                        >
                          <ClipboardList className="w-5 h-5 text-slate-500 group-hover:text-green-500 transition-colors" />
                          <span>Manage Orders</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {/* Logout Button */}
                <div className="pt-6 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all duration-200 text-sm font-bold cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )
    : null;
  return (
    <div className="w-[95%] fixed top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-green-500 to-green-700 rounded-2xl shadow-lg shadow-black/30 flex justify-between items-center h-20 px-4 md:px-8 z-50">
      <Link
        href="/"
        className="text-white font-extrabold text-2xl sm:text-3xl tracking-wide hover:scale-105 transition-transform duration-300"
      >
        Snapcart
      </Link>

      {user.role === "user" && (
        <form className="hidden md:flex items-center bg-white rounded-full px-4 py-2 w-1/2 max-w-lg shadow-sm focus-within:shadow-md transition-shadow duration-300">
          <Search className="text-gray-500 w-5 h-5 mr-2 " />
          <input
            type="text"
            placeholder="search groceries..."
            className="outline-none w-full text-gray-700 placeholder:text-gray-500"
          />
        </form>
      )}

      <div className="flex items-center gap-3 md:gap-6 relative">
        {/* Mobile Search Icon & Dropdown */}
        {user.role === "user" && (
          <>
            <div ref={searchContainerRef} className="relative md:hidden">
              <motion.div
                onClick={() => setSearchBarOpen(!searchBarOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-md cursor-pointer transition duration-300"
              >
                <Search className="text-green-600 w-6 h-6" />
              </motion.div>

              <AnimatePresence>
                {searchBarOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 mt-4 w-72 bg-white/95 backdrop-blur-md border border-slate-100 shadow-2xl rounded-2xl p-3 z-50 flex items-center"
                  >
                    <form className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-600 transition-all">
                      <Search className="text-slate-400 w-4 h-4 mr-2" />
                      <input
                        type="text"
                        name="search"
                        id="search"
                        placeholder="Search groceries..."
                        className="outline-none w-full text-slate-800 placeholder:text-slate-400 text-sm bg-transparent"
                        autoFocus
                      />
                    </form>
                    <button onClick={() => setSearchBarOpen(false)}>
                      <X className="text-slate-400 w-4 h-4 ml-2" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href={"/"}
              className="relative bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:scale-105 transition"
            >
              <ShoppingCart className="text-green-600 w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold shadow">
                8
              </span>
            </Link>
          </>
        )}

        {user.role === "admin" && (
          <div className="hidden sm:flex items-center gap-1 md:gap-3 mr-2 md:mr-4">
            <Link
              href={"/admin/add-grocery"}
              className="flex items-center gap-1.5 text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-xl text-xs md:text-sm font-bold tracking-wide transition-all duration-200 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Grocery</span>
            </Link>
            <Link
              href={"/admin/view-groceries"}
              className="flex items-center gap-1.5 text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-xl text-xs md:text-sm font-bold tracking-wide transition-all duration-200 active:scale-95"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>View Groceries</span>
            </Link>
            <Link
              href={"/admin/orders"}
              className="flex items-center gap-1.5 text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-xl text-xs md:text-sm font-bold tracking-wide transition-all duration-200 active:scale-95"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Manage Orders</span>
            </Link>
          </div>
        )}

        <div>
          <Menu
            className="w-6 h-6 md:hidden text-white cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            onClick={() => setMenuOpen(true)}
          />
        </div>

        <div
          ref={profileDropDown}
          onClick={() => setOpen(!open)}
          className="relative hidden md:block"
        >
          {user.image ? (
            <Image
              className="rounded-full border-2 border-white shadow-md hover:scale-105 transition duration-300 cursor-pointer object-cover"
              src={user.image}
              alt="profile"
              width={44}
              height={44}
            />
          ) : (
            <div className="w-11 h-11 rounded-full border-2 border-white bg-white text-green-700 flex items-center justify-center font-bold shadow-md hover:scale-105 transition duration-300 cursor-pointer">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
          )}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 mt-4 w-64 bg-white/95 backdrop-blur-md border border-slate-100 shadow-2xl rounded-2xl p-4 z-50 flex flex-col gap-1"
              >
                {/* User Info Header */}
                <div className="flex items-center gap-3 pb-3 mb-2 border-b border-slate-100">
                  <div className="w-10 h-10 relative rounded-full bg-green-100 flex items-center justify-center overflow-hidden border border-slate-200">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt="user"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="text-green-700 w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-800 font-bold text-sm truncate">
                      {user.name}
                    </div>
                    <div className="text-slate-400 text-xs font-semibold capitalize tracking-wide">
                      {user.role}
                    </div>
                  </div>
                </div>

                {/* Dropdown Menu Items */}
                {user.role === "user" && (
                  <Link
                    href="/myorders"
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50/50 text-slate-700 hover:text-green-700 transition-all duration-200 text-sm font-medium"
                  >
                    <Package className="w-5 h-5 text-slate-400 group-hover:text-green-600 transition-colors" />
                    <span>My Orders</span>
                  </Link>
                )}

                <div className="border-t border-slate-100 my-1" />

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-slate-700 hover:text-red-600 transition-all duration-200 text-sm font-medium text-left cursor-pointer"
                >
                  <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
                  <span>Log Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {sidebar}
    </div>
  );
};

export default Nav;
