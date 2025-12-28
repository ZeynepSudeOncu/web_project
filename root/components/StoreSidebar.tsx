"use client";

import Link from "next/link";
import { Package, Home, ClipboardList } from "lucide-react";

const menu = [
  {
    label: "Dashboard",
    path: "/dashboard/store",
    icon: <Home size={18} />,
  },
  {
    label: "Ürünlerim",
    path: "/dashboard/store/products",
    icon: <Package size={18} />,
  },
  {
    label: "Depo Talepleri",
    path: "/dashboard/store/requests",
    icon: <ClipboardList size={18} />,
  },
];

export default function StoreSidebar() {
  return (
    <aside className="w-64 bg-white border-r p-4 min-h-screen">
      <h2 className="text-xl font-semibold mb-6">Store Panel</h2>

      <nav className="space-y-2">
        {menu.map((m) => (
          <Link
            key={m.path}
            href={{ pathname: m.path }}   // ✅ typed-routes uyumlu
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 text-gray-700"
          >
            {m.icon}
            <span>{m.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
