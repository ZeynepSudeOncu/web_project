"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";

type AdminReqItem = {
  id: string;
  storeName: string;
  depotName: string;
  productName: string;
  productCode: string;
  requestedQuantity: number;
  status: string;
  createdAt: string;
};

export default function AdminRequestsPage() {
  const [items, setItems] = useState<AdminReqItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/requests");
      setItems(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        Tüm Store Talepleri
      </h1>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Mağaza</th>
              <th className="p-3 text-left">Depo</th>
              <th className="p-3 text-left">Ürün</th>
              <th className="p-3 text-left">Kod</th>
              <th className="p-3 text-right">Miktar</th>
              <th className="p-3 text-left">Durum</th>
              <th className="p-3 text-left">Tarih</th>
            </tr>
          </thead>

          <tbody>
            {items.map((x) => (
              <tr key={x.id} className="border-t">
                <td className="p-3">{x.storeName}</td>
                <td className="p-3">{x.depotName}</td>
                <td className="p-3">{x.productName}</td>
                <td className="p-3">{x.productCode}</td>
                <td className="p-3 text-right">{x.requestedQuantity}</td>
                <td className="p-3">
                  <span
                    className={
                      x.status === "Pending"
                        ? "text-yellow-600"
                        : x.status === "OnTheWay" || x.status === "InTransit"
                        ? "text-blue-600"
                        : x.status === "Delivered"
                        ? "text-green-600"
                        : x.status === "Rejected"
                        ? "text-red-600"
                        : ""
                    }
                  >
                    {{
                      Pending: "Beklemede",
                      Approved: "Onaylandı",
                      OnTheWay: "Yolda",
                      InTransit: "Yolda",
                      Delivered: "Teslim Edildi",
                      Rejected: "Reddedildi",
                    }[x.status] ?? x.status}
                  </span>
                </td>
                <td className="p-3">
                  {new Date(x.createdAt).toLocaleString("tr-TR")}
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-gray-500">
                  Kayıt yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
