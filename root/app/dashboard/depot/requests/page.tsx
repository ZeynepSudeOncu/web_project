"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";

type ReqItem = {
  id: string;
  storeName: string;
  productName: string;
  productCode: string;
  requestedQuantity: number;
  status: string;
  createdAt: string;
};

type TruckItem = {
  id: string;
  plate: string;
};

export default function DepotRequestsPage() {
  const [items, setItems] = useState<ReqItem[]>([]);
  const [allStoreRequests, setAllStoreRequests] = useState<ReqItem[]>([]);
  const [trucks, setTrucks] = useState<TruckItem[]>([]);
  const [selectedTruckByReq, setSelectedTruckByReq] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);

  // modal state
  const [approveOpenId, setApproveOpenId] = useState<string | null>(null);
  const [rejectOpenId, setRejectOpenId] = useState<string | null>(null);

  const [estimatedDate, setEstimatedDate] = useState("");
  const [depotNote, setDepotNote] = useState("");

  const [rejectReason, setRejectReason] = useState("");
  const [rejectNote, setRejectNote] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [reqRes, truckRes] = await Promise.all([
        api.get("/depot-requests/my", { params: { status: "Pending" } }),
        api.get("/trucks"),
      ]);

      setItems(reqRes.data);
      setTrucks(truckRes.data);

      setSelectedTruckByReq((prev) => {
        const next = { ...prev };
        for (const r of reqRes.data) {
          if (!next[r.id] && truckRes.data.length > 0) {
            next[r.id] = truckRes.data[0].id;
          }
        }
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAllStoreRequests = async () => {
    setLoadingAll(true);
    try {
      const res = await api.get("/depot-requests/store-requests");
      setAllStoreRequests(res.data);
    } finally {
      setLoadingAll(false);
    }
  };

  useEffect(() => {
    load();
    loadAllStoreRequests();
  }, []);

  const approve = async () => {
    if (!approveOpenId) return;

    const truckId = selectedTruckByReq[approveOpenId];
    if (!truckId || !estimatedDate) {
      alert("Kamyon ve teslim tarihi zorunlu");
      return;
    }

    await api.patch(`/depot-requests/${approveOpenId}/approve`, {
      truckId,
      estimatedDeliveryDate: estimatedDate,
      note: depotNote,
    });

    setApproveOpenId(null);
    setEstimatedDate("");
    setDepotNote("");
    load();
    loadAllStoreRequests();
  };

  const reject = async () => {
    if (!rejectOpenId || !rejectReason) {
      alert("Reddetme nedeni seçmelisin");
      return;
    }

    await api.patch(`/depot-requests/${rejectOpenId}/reject`, {
      reason: rejectReason,
      description: rejectNote,
    });

    setRejectOpenId(null);
    setRejectReason("");
    setRejectNote("");
    load();
    loadAllStoreRequests();
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Gelen Talepler</h1>

      {/* ===== GELEN TALEPLER ===== */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Mağaza</th>
              <th className="p-3 text-left">Ürün</th>
              <th className="p-3 text-left">Kod</th>
              <th className="p-3 text-right">Miktar</th>
              <th className="p-3 text-left">Tarih</th>
              <th className="p-3 text-left">Kamyon</th>
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
                <td className="p-3">{new Date(x.createdAt).toLocaleString("tr-TR")}</td>
                <td className="p-3">
                  <select
                    className="border rounded px-2 py-1"
                    value={selectedTruckByReq[x.id]}
                    onChange={(e) =>
                      setSelectedTruckByReq((p) => ({ ...p, [x.id]: e.target.value }))
                    }
                  >
                    {trucks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.plate}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setApproveOpenId(x.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Onayla
                    </button>
                    <button
                      onClick={() => setRejectOpenId(x.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Reddet
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-gray-500">
                  Bekleyen talep yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== TÜM STORE TALEPLERİ ===== */}
      <h2 className="text-xl font-semibold">Store Talepleri (Tüm Durumlar)</h2>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Mağaza</th>
              <th className="p-3 text-left">Ürün</th>
              <th className="p-3 text-right">Miktar</th>
              <th className="p-3 text-left">Durum</th>
              <th className="p-3 text-left">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {allStoreRequests.map((x) => (
              <tr key={x.id} className="border-t">
                <td className="p-3">{x.storeName}</td>
                <td className="p-3">{x.productName}</td>
                <td className="p-3 text-right">{x.requestedQuantity}</td>
                <td className="p-3">
                  {{
                    Pending: "Beklemede",
                    Approved: "Onaylandı",
                    OnTheWay: "Yolda",
                    InTransit: "Yolda",
                    Delivered: "Teslim Edildi",
                    Rejected: "Reddedildi",
                  }[x.status]}
                </td>
                <td className="p-3">{new Date(x.createdAt).toLocaleString("tr-TR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== ONAY MODAL ===== */}
      {approveOpenId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-96 p-6 rounded space-y-4">
            <h3 className="font-semibold text-lg">Talebi Onayla</h3>

            <input
              type="datetime-local"
              className="w-full border rounded px-2 py-1"
              value={estimatedDate}
              onChange={(e) => setEstimatedDate(e.target.value)}
            />

            <textarea
              placeholder="Depo notu"
              className="w-full border rounded px-2 py-1"
              value={depotNote}
              onChange={(e) => setDepotNote(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setApproveOpenId(null)} className="border px-3 py-1 rounded">
                İptal
              </button>
              <button onClick={approve} className="bg-green-600 text-white px-3 py-1 rounded">
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== REDDET MODAL ===== */}
      {rejectOpenId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-96 p-6 rounded space-y-4">
            <h3 className="font-semibold text-lg">Talebi Reddet</h3>

            <select
              className="w-full border rounded px-2 py-1"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            >
              <option value="">Neden seç</option>
              <option value="STOK_YOK">Stok Yok</option>
              <option value="SEVKIYAT_YOGUN">Sevkiyat Yoğun</option>
              <option value="URUN_PASIF">Ürün Pasif</option>
              <option value="DIGER">Diğer</option>
            </select>

            <textarea
              placeholder="Açıklama"
              className="w-full border rounded px-2 py-1"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setRejectOpenId(null)} className="border px-3 py-1 rounded">
                İptal
              </button>
              <button onClick={reject} className="bg-red-600 text-white px-3 py-1 rounded">
                Reddet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
