"use client";


import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiUsers,
  FiShoppingBag,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronsLeft,
} from "react-icons/fi";
import { LuGitPullRequestCreateArrow } from "react-icons/lu";

const links = [
  { label: "Dashboard", href: "/client", icon: FiHome },
//   { label: "Clients", href: "/admin/clients", icon: FiUsers },
//   { label: "Create Client", href: "/admin/clients/create", icon: LuGitPullRequestCreateArrow  },
//   { label: "Products", href: "/admin/products", icon: FiShoppingBag },
//   { label: "Reports", href: "/admin/reports", icon: FiBarChart2 },
//   { label: "Settings", href: "/admin/settings", icon: FiSettings },

];

export default function SliderClient() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false); // desktop: icon-only
  const [open, setOpen] = useState(false); // mobile: slide-in drawer

  const isActive = (href) =>pathname === href ;

  return (
    <>
      
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-30 rounded-lg bg-slate-900 p-2 text-white shadow lg:hidden"
        aria-label="Open menu"
      >
        <FiMenu size={22} />
      </button>

    
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col h-screen bg-slate-900 text-slate-300 transition-all duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0
          ${collapsed ? "lg:w-20" : "lg:w-64"} w-64`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          {!collapsed && (
            <span className="text-lg font-semibold text-white">Client</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded p-2 hover:bg-slate-800 lg:block"
            aria-label="Collapse sidebar"
          >
            <FiChevronsLeft
              size={20}
              className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
          <button
            onClick={() => setOpen(false)}
            className="rounded p-2 hover:bg-slate-800 lg:hidden"
            aria-label="Close menu"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {links.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                ${
                  isActive(href)
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-slate-800 hover:text-white"
                }
                ${collapsed ? "lg:justify-center" : ""}`}
            >
              <Icon size={20} className="shrink-0" />
              <span className={collapsed ? "lg:hidden" : ""}>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-800 p-3">
          <button
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-slate-800 hover:text-white
              ${collapsed ? "lg:justify-center" : ""}`}
          >
            <FiLogOut size={20} className="shrink-0" />
            <span className={collapsed ? "lg:hidden" : ""}>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

