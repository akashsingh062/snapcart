"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ShieldCheck,
  Package,
  PlusCircle,
  LayoutGrid,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";

interface AdminNavProps {
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
}

export default function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const profileDropDown = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropDown.current &&
        !profileDropDown.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: ShieldCheck },
    { name: "Orders", href: "/admin/manage-orders", icon: Package },
    { name: "Groceries", href: "/admin/view-groceries", icon: LayoutGrid },
    { name: "Add Item", href: "/admin/add-grocery", icon: PlusCircle },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="w-[95%] max-w-6xl mx-auto h-14 flex items-center justify-between">
          {/* Brand */}
          <Link
            href="/admin"
            className="text-slate-900 font-bold text-lg tracking-tight flex items-center gap-2"
          >
            Snapcart
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              Admin
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
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
              {user?.image ? (
                <Image
                  className="rounded-full border border-slate-200 hover:border-slate-300 transition cursor-pointer object-cover"
                  src={user.image}
                  alt="profile"
                  width={32}
                  height={32}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-semibold cursor-pointer hover:bg-slate-200 transition">
                  {user?.name ? user.name[0].toUpperCase() : "A"}
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
                        {user?.image ? (
                          <Image
                            src={user.image}
                            alt="user"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <UserIcon className="text-slate-500 w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 font-medium text-sm truncate">
                          {user?.name || "Admin"}
                        </p>
                        <p className="text-slate-400 text-xs truncate">
                          Administrator
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

      {/* Mobile Drawer */}
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
                    {user?.name ? user.name[0].toUpperCase() : "A"}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-medium text-sm text-slate-900 truncate">
                      {user?.name || "Admin"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {user?.email || "admin@snapcart.com"}
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
                {navItems.map((item) => {
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
      </AnimatePresence>
    </>
  );
}
