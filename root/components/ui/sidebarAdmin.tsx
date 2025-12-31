import { Home, Building, Truck, Users, Package } from "lucide-react";
import Link from "next/link";

const menuItems = [
  { label: "Depolar", icon: <Home size={20} />, path: "/dashboard/admin/depolar" },
  { label: "Mağazalar", icon: <Building size={20} />, path: "/dashboard/admin/magazalar" },
  { label: "Kamyonlar", icon: <Truck size={20} />, path: "/dashboard/admin/kamyonlar" },
  { label: "Sürücüler", icon: <Users size={20} />, path: "/dashboard/admin/suruculer" },
  { label: "Ürünler", icon: <Package size={20} />, path: "/dashboard/admin/products" },
  { label: "Teslimatlar", icon: <Package size={20} />, path: "/dashboard/admin/requests" },

];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-100 p-6 flex flex-col gap-4">
      {menuItems.map((item, index) => (
        <Link
          key={index}
          href={item.path as any}
          className="flex items-center gap-3 px-4 py-2 text-black hover:bg-white rounded-lg"
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </aside>
  );
}
