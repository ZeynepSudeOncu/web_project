"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";

interface RawProduct {
  depotName: string;
  productCode: string;
  productName: string;
  quantity: number;
}

interface GroupedProduct {
  productCode: string;
  productName: string;
  totalQuantity: number;
  details: {
    depotName: string;
    quantity: number;
  }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<GroupedProduct[]>([]);
  const [openCode, setOpenCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/depots/products").then(res => {
      const raw: RawProduct[] = res.data;
      const grouped: Record<string, GroupedProduct> = {};

      raw.forEach(item => {
        if (!grouped[item.productCode]) {
          grouped[item.productCode] = {
            productCode: item.productCode,
            productName: item.productName,
            totalQuantity: 0,
            details: []
          };
        }

        grouped[item.productCode].totalQuantity += item.quantity;
        grouped[item.productCode].details.push({
          depotName: item.depotName,
          quantity: item.quantity
        });
      });

      setProducts(Object.values(grouped));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6">Yükleniyor...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Ürünler (Toplam & Depo Detayları)
      </h1>

      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-3 text-left">Ürün Kodu</th>
            <th className="px-4 py-3 text-left">Ürün</th>
            <th className="px-4 py-3 text-left">Toplam Adet</th>
            <th className="px-4 py-3 text-left">Detay</th>
          </tr>
        </thead>

        <tbody>
          {products.map(product => (
            <>
              <tr key={product.productCode} className="border-t">
                <td className="px-4 py-3 font-medium">
                  {product.productCode}
                </td>

                <td className="px-4 py-3">
                  {product.productName}
                </td>

                <td className="px-4 py-3 font-semibold">
                  {product.totalQuantity}
                </td>

                <td className="px-4 py-3">
                  <button
                    onClick={() =>
                      setOpenCode(
                        openCode === product.productCode
                          ? null
                          : product.productCode
                      )
                    }
                    className="text-blue-600 hover:underline"
                  >
                    Detaylar
                  </button>
                </td>
              </tr>

              {openCode === product.productCode && (
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-6 py-4">
                    <ul className="space-y-1 text-sm text-gray-700">
                      {product.details.map((d, i) => (
                        <li key={i}>
                          {d.depotName}: <b>{d.quantity}</b>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
