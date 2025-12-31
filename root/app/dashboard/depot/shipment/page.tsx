"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";

type TruckLoadItem = {
  truckId: string;
  plate: string;
  capacity: number;
  used: number;
  remaining: number;
  percent: number;
};

type TruckItemDetail = {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
};

export default function ShipmentPage() {
  const [items, setItems] = useState<TruckLoadItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [openTruckId, setOpenTruckId] = useState<string | null>(null);
  const [truckItems, setTruckItems] = useState<TruckItemDetail[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/truck-loads");
      setItems(res.data);
    } finally {
      setLoading(false);
    }
  };

  const loadTruckItems = async (truckId: string) => {
    setLoadingItems(true);
    try {
      const res = await api.get(`/truck-loads/${truckId}/items`);
      setTruckItems(res.data);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Sevkiyat Durumu</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((t) => {
          const color =
            t.percent < 70
              ? "bg-green-500"
              : t.percent < 90
              ? "bg-yellow-500"
              : "bg-red-500";

          const isOpen = openTruckId === t.truckId;

          return (
            <div
              key={t.truckId}
              onClick={async () => {
                if (isOpen) {
                  setOpenTruckId(null);
                  return;
                }
                setOpenTruckId(t.truckId);
                await loadTruckItems(t.truckId);
              }}
              className={`bg-white p-5 rounded shadow space-y-3 cursor-pointer
                hover:ring-2 hover:ring-blue-400 transition
                ${isOpen ? "ring-2 ring-blue-500" : ""}`}
            >
              {/* HEADER */}
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{t.plate}</h3>
                <span className="text-sm">%{t.percent}</span>
              </div>

              {/* PROGRESS */}
              <div className="w-full h-3 bg-gray-200 rounded">
                <div
                  className={`h-3 rounded ${color}`}
                  style={{ width: `${t.percent}%` }}
                />
              </div>

              {/* SUMMARY */}
              <div className="text-sm text-gray-700 space-y-1">
                <p>🚚 Kapasite: {t.capacity}</p>
                <p>📦 Yüklü: {t.used}</p>
                <p>📭 Kalan: {t.remaining}</p>
              </div>

              {/* 🔽 DETAIL (AÇILAN KISIM) */}
              {isOpen && (
                <div className="pt-4 mt-4 border-t">
                  {loadingItems ? (
                    <div className="text-sm text-gray-500">Yükleniyor...</div>
                  ) : truckItems.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      Bu kamyonda ürün yok.
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left">Ürün</th>
                          <th className="p-2 text-left">Kod</th>
                          <th className="p-2 text-right">Miktar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {truckItems.map((x) => (
                          <tr key={x.productId} className="border-t">
                            <td className="p-2">{x.productName}</td>
                            <td className="p-2">{x.productCode}</td>
                            <td className="p-2 text-right">{x.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="text-gray-500">Kamyon bulunamadı.</div>
        )}
      </div>
    </div>
  );
}
