"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";

type ReqItem = {
  id: string;
  storeId: string;
  storeName: string;
  productId: string;
  productName: string;
  productCode: string;
  requestedQuantity: number;
  status: string;
  createdAt: string;
};

export default function DepotRequestsPage() {
  const [items, setItems] = useState<ReqItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/depot-requests/my", { params: { status: "Pending" } });
      setItems(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id: string) => {
    try {
      await api.patch(`/depot-requests/${id}/approve`);
      await load();
      alert("Onaylandı ve stok aktarıldı");
    } catch (e: any) {
      alert(e?.response?.data ?? "Onaylanamadı");
    }
  };

  const reject = async (id: string) => {
    try {
      await api.patch(`/depot-requests/${id}/reject`);
      await load();
      alert("Reddedildi");
    } catch (e: any) {
      alert(e?.response?.data ?? "Reddedilemedi");
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Gelen Talepler</h1>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Mağaza</th>
              <th className="p-3 text-left">Ürün</th>
              <th className="p-3 text-left">Kod</th>
              <th className="p-3 text-right">Miktar</th>
              <th className="p-3 text-left">Tarih</th>
              <th className="p-3 text-center">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.id} className="border-t">
                <td className="p-3">{x.storeName}</td>
                <td className="p-3">{x.productName}</td>
                <td className="p-3">{x.productCode}</td>
                <td className="p-3 text-right">{x.requestedQuantity}</td>
                <td className="p-3">
                  {new Date(x.createdAt).toLocaleString("tr-TR")}
                </td>
                <td className="p-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => approve(x.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                    >
                      Onayla
                    </button>
                    <button
                      onClick={() => reject(x.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                    >
                      Reddet
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td className="p-4 text-gray-500" colSpan={6}>
                  Bekleyen talep yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
