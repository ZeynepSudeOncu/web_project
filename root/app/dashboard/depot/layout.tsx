"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "@/lib/auth";

export default function DepotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        const profile = await getProfile();
        if (!profile.roles.includes("Depot")) {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    check();
  }, [router]);

  if (loading) return <p>Yükleniyor...</p>;

  return (
    <div className="flex min-h-screen">
      {/* NAVBAR / SIDEBAR */}
      <aside className="w-56 bg-gray-800 text-white p-5 space-y-4">
        <h3 className="text-lg font-semibold">Depo Panel</h3>

        <nav className="space-y-2">
          <button
            className="block w-full text-left hover:text-gray-300"
            onClick={() => router.push("/dashboard/depot/products")}
          >
            📦 Ürünler
          </button>

          <button
            className="block w-full text-left hover:text-gray-300"
            //onClick={() => router.push()}
          >
            🚚 Sevkiyat
          </button>
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
