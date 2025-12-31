"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";
import { useRouter } from "next/navigation";

type ProductSummary = {
  productId: string;
  productName: string;
  productCode: string;
  totalQuantity: number;
};

export default function AdminProductsPage() {
  const [items, setItems] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get("/admin/products/summary")
      .then(res => setItems(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Ürün Stok Özeti</h1>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Kod</th>
              <th className="p-3 text-left">Ürün</th>
              <th className="p-3 text-right">Toplam Adet</th>
            </tr>
          </thead>

          <tbody>
  {items.map(x => (
    <tr key={x.productId} className="border-t hover:bg-gray-50">
      <td className="p-3">{x.productCode}</td>

      <td
        className="p-3 cursor-pointer underline text-blue-600"
        onClick={() =>
          router.push(`/dashboard/admin/products/${x.productId}` as any)
        }
      >
        {x.productName}
      </td>

      <td className="p-3 text-right font-semibold">
        {x.totalQuantity}
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>
    </div>
  );
}