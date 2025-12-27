"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  code: string;
  quantity: number;
}

export default function DepotProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    api
      .get("/products/my")
      .then(res => {
        setProducts(res.data);
      })
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
        } else {
          setError("Ürünler alınamadı");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  if (loading) return <p>Yükleniyor...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  // ✅ TOPLAM STOK HESABI
  const totalQuantity = products.reduce(
    (sum, p) => sum + p.quantity,
    0
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Depo Ürünleri</h2>

      {/* ÖZET KARTLAR */}
      <div className="flex gap-4">
        <div className="bg-gray-100 rounded-lg p-4 w-64">
          <p className="text-sm text-gray-500">Toplam Stok</p>
          <p className="text-2xl font-bold">{totalQuantity}</p>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 w-64">
          <p className="text-sm text-gray-500">Ürün Çeşidi</p>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
      </div>

      {/* ÜRÜN TABLOSU */}
      <table className="w-full border border-gray-200 bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 text-left">Ürün</th>
            <th className="border px-3 py-2 text-left">Kod</th>
            <th className="border px-3 py-2 text-right">Stok</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="border px-3 py-2">{p.name}</td>
              <td className="border px-3 py-2">{p.code}</td>
              <td className="border px-3 py-2 text-right">
                {p.quantity}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
