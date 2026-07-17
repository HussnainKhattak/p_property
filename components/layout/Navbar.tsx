"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/components/providers";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
  Plus,
  Building2,
  ChevronDown,
  Home as HomeIcon,
  Info,
  PhoneCall,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Properties", href: "/properties", icon: Building2 },
    { name: "Add Property", href: "/properties/add", icon: Plus, requiresAuth: true },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: PhoneCall },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
        ? "bg-background/80 backdrop-blur-md border-b border-border shadow-md"
        : "bg-transparent border-b border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-primary text-primary-foreground transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/25">
                <Building2 className="h-6 w-6" />
              </div>
              <span className="font-bold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                Peshawar <span className="text-primary font-extrabold">Property</span> Hub
              </span> <span className="ml-2 text-xs sm:text-sm font-normal text-emerald-400 opacity-75">Husnain Khattak</span>
            </Link>
          </motion.div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              if (link.requiresAuth && status !== "authenticated") return null;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors relative py-2 ${isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavUnderline"
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border hover:bg-accent text-foreground"
              aria-label="Toggle Theme"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === "dark" ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="h-5 w-5 text-amber-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="h-5 w-5 text-slate-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Auth Section */}
            {status === "loading" ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : status === "authenticated" && session?.user ? (
              <div className="relative">
                <motion.button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-border hover:bg-accent transition-all duration-300 text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold overflow-hidden">
                    {session.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={session.user.image} alt={session.user.name || "User"} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      session.user.name?.[0]?.toUpperCase() || "U"
                    )}
                  </div>
                  <span className="max-w-[100px] truncate text-foreground">{session.user.name}</span>
                  <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </motion.button>

                {/* Dropdown */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-xl"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                    >
                      <div className="px-3 py-2 border-b border-border mb-1">
                        <p className="text-xs text-muted-foreground">Signed in as</p>
                        <p className="text-sm font-semibold truncate text-foreground">{session.user.email}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary">
                          {session.user.role || "USER"}
                        </span>
                      </div>

                      {session.user.role === "ADMIN" && (
                        <Link href="/admin" className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-accent text-red-500 font-bold transition-colors">
                          <User className="h-4 w-4 text-red-500" /> Admin Panel
                        </Link>
                      )}
                      <Link href="/dashboard" className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors">
                        <User className="h-4 w-4" /> My Dashboard
                      </Link>
                      <Link href="/properties/add" className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors">
                        <Plus className="h-4 w-4" /> List a Property
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-colors mt-1"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Login
                </Link>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link href="/register" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 rounded-xl transition-all duration-300">
                    Register
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile Toggles */}
          <div className="flex items-center space-x-3 md:hidden">
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border hover:bg-accent text-foreground"
              aria-label="Toggle Theme"
              whileTap={{ scale: 0.9 }}
            >
              {theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
            </motion.button>
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl border border-border hover:bg-accent text-foreground"
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden border-b border-border bg-background px-4 pt-2 pb-6 space-y-3 shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <motion.div
              className="space-y-1"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
                hidden: {},
              }}
            >
              {navLinks.map((link) => {
                if (link.requiresAuth && status !== "authenticated") return null;
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.href}
                    variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium transition-colors ${isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>

            <div className="border-t border-border pt-4">
              {status === "authenticated" && session?.user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold overflow-hidden">
                      {session.user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={session.user.image} alt={session.user.name || "User"} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        session.user.name?.[0]?.toUpperCase() || "U"
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{session.user.email}</p>
                    </div>
                  </div>

                  {session.user.role === "ADMIN" && (
                    <Link href="/admin" className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-base font-bold text-red-500 hover:bg-red-500/10 transition-colors">
                      <User className="h-5 w-5 text-red-500" /> Admin Panel
                    </Link>
                  )}
                  <Link href="/dashboard" className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                    <User className="h-5 w-5" /> Dashboard
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-base font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-5 w-5" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-3">
                  <Link href="/login" className="w-full py-3 text-center rounded-xl font-medium border border-border text-foreground hover:bg-accent transition-colors">
                    Login
                  </Link>
                  <Link href="/register" className="w-full py-3 text-center rounded-xl font-medium bg-primary text-primary-foreground hover:bg-primary/95 transition-colors">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
