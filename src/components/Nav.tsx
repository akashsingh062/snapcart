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
  ClipboardList,
  ShieldCheck,
  Menu,
  Truck,
  TrendingUp,
  Leaf,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setUserData } from "@/redux/userSlice";
import GeoUpdater from "@/components/GeoUpdater";

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
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [searchBarOpen, setSearchBarOpen] = useState(false);
  const urlSearch = searchParams?.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);

  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearchQuery(urlSearch);
  }

  const profileDropDown = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const {cartData} = useSelector((state:RootState)=>state.cart)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    router.push("/");
  };

  useEffect(() => {
    if (user) {
      dispatch(setUserData(user));
    }
  }, [user, dispatch]);

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
    } catch {
      // Ignored
    }
  };

  const deliveryNavItems = [
    { name: "Requests", href: "/", icon: Package },
    { name: "Active Task", href: "/delivery/current-order", icon: Truck },
    { name: "Progress", href: "/delivery/progress", icon: TrendingUp },
  ];

  if (user.role === "deliveryBoy") {
    const deliverySidebar = mounted && typeof window !== "undefined"
      ? createPortal(
          <AnimatePresence>
            {menuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 bg-black/40 z-60"
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="fixed top-0 right-0 h-full w-72 bg-white z-70 shadow-xl border-l border-slate-200 flex flex-col"
                >
                  <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm font-semibold">
                        {user.name ? user.name[0].toUpperCase() : "D"}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-medium text-sm text-slate-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 p-3 space-y-1">
                    {deliveryNavItems.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 font-semibold"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="p-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 font-medium text-sm transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
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
      <>
        <GeoUpdater />
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
          <div className="w-[95%] max-w-4xl mx-auto h-14 flex items-center justify-between">
            {/* Brand */}
            <Link
              href="/"
              className="text-slate-900 font-bold text-lg tracking-tight flex items-center gap-2"
            >
              Snapcart
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                Delivery
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {deliveryNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "text-emerald-700 bg-emerald-50 font-semibold"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>

              <div
                ref={profileDropDown}
                onClick={() => setOpen(!open)}
                className="relative hidden md:block"
              >
                {user.image ? (
                  <Image
                    className="rounded-full border border-slate-200 hover:border-slate-300 transition cursor-pointer object-cover"
                    src={user.image}
                    alt="profile"
                    width={32}
                    height={32}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-semibold cursor-pointer hover:bg-slate-200 transition">
                    {user.name ? user.name[0].toUpperCase() : "D"}
                  </div>
                )}

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl p-3 z-50 shadow-lg"
                    >
                      <div className="flex items-center gap-2.5 pb-3 mb-2 border-b border-slate-100">
                        <div className="w-8 h-8 relative rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt="user"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <User className="text-slate-500 w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-900 font-medium text-sm truncate">
                            {user.name}
                          </p>
                          <p className="text-slate-400 text-xs truncate">
                            Delivery Partner
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors text-sm font-medium cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </nav>
        {deliverySidebar}
      </>
    );
  }

  const sidebar = mounted && typeof window !== "undefined"
    ? createPortal(
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 bg-black/40 z-60"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 h-full w-72 bg-white z-70 shadow-xl border-l border-slate-200 flex flex-col"
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm font-semibold">
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-medium text-sm text-slate-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 p-3 space-y-1">
                  {user.role === "user" && (
                    <Link
                      href="/user/my-orders"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm font-medium"
                    >
                      <Package className="w-4 h-4" />
                      <span>My Orders</span>
                    </Link>
                  )}

                  {user.role === "admin" && (
                    <>
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm font-medium"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                      <Link
                        href="/admin/manage-orders"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm font-medium"
                      >
                        <ClipboardList className="w-4 h-4" />
                        <span>Manage Orders</span>
                      </Link>
                      <Link
                        href="/admin/add-grocery"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm font-medium"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Add Grocery</span>
                      </Link>
                    </>
                  )}
                </div>

                <div className="p-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 font-medium text-sm transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
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
    <>
      <GeoUpdater />
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 bg-green-600 rounded-2xl shadow-lg shadow-emerald-900/25 h-16 flex items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-white font-extrabold text-xl tracking-tight hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center shadow-xs">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span>Snapcart</span>
        </Link>

        {user.role === "user" && (
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center bg-white/95 rounded-xl px-3.5 py-2 w-full max-w-md mx-6 focus-within:ring-2 focus-within:ring-white/30 transition-all"
          >
            <button
              type="submit"
              className="text-slate-400 hover:text-emerald-600 transition-colors mr-2 cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groceries..."
              className="outline-none w-full text-slate-700 placeholder:text-slate-400 text-sm bg-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-slate-400 hover:text-slate-600 transition-colors ml-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        )}

        {user.role === "admin" && (
          <div className="hidden sm:flex items-center gap-1 mx-6">
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                pathname === "/admin"
                  ? "bg-white/20 text-white font-semibold"
                  : "text-white/70 hover:text-white hover:bg-white/10 font-medium"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/manage-orders"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                pathname === "/admin/manage-orders"
                  ? "bg-white/20 text-white font-semibold"
                  : "text-white/70 hover:text-white hover:bg-white/10 font-medium"
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Orders</span>
            </Link>
            <Link
              href="/admin/add-grocery"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                pathname === "/admin/add-grocery"
                  ? "bg-white/20 text-white font-semibold"
                  : "text-white/70 hover:text-white hover:bg-white/10 font-medium"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Grocery</span>
            </Link>
          </div>
        )}

        <div className="flex items-center gap-2">
          {user.role === "user" && (
            <>
              <div ref={searchContainerRef} className="relative md:hidden">
                <button
                  type="button"
                  onClick={() => setSearchBarOpen(!searchBarOpen)}
                  className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-colors cursor-pointer"
                  aria-label="Toggle search"
                >
                  <Search className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {searchBarOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-72 bg-white border border-slate-200 shadow-xl rounded-2xl p-3 z-50"
                    >
                      <form
                        onSubmit={(e) => {
                          handleSearchSubmit(e);
                          setSearchBarOpen(false);
                        }}
                        className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full focus-within:border-emerald-500 transition-all"
                      >
                        <button
                          type="submit"
                          className="text-slate-400 hover:text-emerald-600 transition-colors mr-2 cursor-pointer"
                          aria-label="Search"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search groceries..."
                          className="outline-none w-full text-slate-700 placeholder:text-slate-400 text-sm bg-transparent"
                          autoFocus
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="text-slate-400 hover:text-slate-600 ml-1 cursor-pointer"
                            aria-label="Clear"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/user/cart"
                className="relative w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartData.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-white text-emerald-700 rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] font-bold shadow-sm">
                    {cartData.length}
                  </span>
                )}
              </Link>
            </>
          )}

          <button
            className="md:hidden w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-colors cursor-pointer"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </button>

          <div
            ref={profileDropDown}
            onClick={() => setOpen(!open)}
            className="relative hidden md:block"
          >
            {user.image ? (
              <Image
                className="rounded-full border-2 border-white/30 hover:border-white/60 transition cursor-pointer object-cover"
                src={user.image}
                alt="profile"
                width={34}
                height={34}
              />
            ) : (
              <div className="w-8.5 h-8.5 rounded-full bg-white/20 border border-white/30 text-white flex items-center justify-center text-sm font-semibold cursor-pointer hover:bg-white/30 transition">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
            )}

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl p-3 z-50 shadow-lg"
                >
                  <div className="flex items-center gap-2.5 pb-3 mb-2 border-b border-slate-100">
                    <div className="w-8 h-8 relative rounded-full bg-emerald-50 flex items-center justify-center overflow-hidden">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt="user"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <User className="text-emerald-600 w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 font-medium text-sm truncate">
                        {user.name}
                      </p>
                      <p className="text-slate-400 text-xs truncate capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>

                  {user.role === "user" && (
                    <Link
                      href="/user/my-orders"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm font-medium"
                    >
                      <Package className="w-4 h-4" />
                      <span>My Orders</span>
                    </Link>
                  )}

                  <div className="border-t border-slate-100 my-1.5" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors text-sm font-medium cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>
      {sidebar}
    </>
  );
};

export default Nav;
