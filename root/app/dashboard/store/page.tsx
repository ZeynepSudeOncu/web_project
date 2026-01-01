"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/http";

/* =======================
   TYPES
======================= */

interface DashboardData {
  cards: {
    total: number;
    pending: number;
    approved: number;
    delivered: number;
    rejected: number;
    last7DaysOut: number;
  };
  recent: {
    id: string;
    productName: string;
    productCode: string;
    requestedQuantity: number;
    status: string;
    createdAt: string;
    deliveredAt?: string | null;
  }[];
}

/* =======================
   COMPONENT
======================= */

export default function StoreDashboardPage() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    api
      .get("/store-dashboard")
      .then(res => setData(res.data))
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
        } else {
          setError("Dashboard verisi alınamadı");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <p>Yükleniyor...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p>Dashboard verisi yok</p>;

  const { cards, recent } = data;

  function getStatusLabel(status: string) {
    switch (status) {
      case "Delivered":
        return "Teslim Edildi";
      case "Approved":
        return "Onaylandı";
      case "Rejected":
        return "Reddedildi";
      case "Pending":
        return "Beklemede";
      default:
        return status;
    }
  }
  

  function getStatusBadge(status: string) {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Approved":
        return "bg-blue-100 text-blue-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }
  
  

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-6 gap-4">
        <StatCard label="Toplam Talep" value={cards.total} />
        <StatCard label="Beklemede" value={cards.pending} />
        <StatCard label="Onaylandı" value={cards.approved} />
        <StatCard label="Teslim Edildi" value={cards.delivered} />
        <StatCard label="Reddedildi" value={cards.rejected} />
        <StatCard label="Son 7 Gün Giriş" value={cards.last7DaysOut} />
      </div>

      {/* RECENT REQUESTS */}
      <div className="bg-white border rounded-lg">
        <h2 className="px-4 py-3 font-semibold border-b">
          Son Talepler
        </h2>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Ürün</th>
              <th className="px-4 py-2 text-left">Kod</th>
              <th className="px-4 py-2 text-right">Miktar</th>
              <th className="px-4 py-2 text-left">Durum</th>
              <th className="px-4 py-2 text-left">Tarih</th>
            </tr>
          </thead>

          <tbody>
            {recent.map(r => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2">{r.productName}</td>
                <td className="px-4 py-2">{r.productCode}</td>
                <td className="px-4 py-2 text-right">
                  {r.requestedQuantity}
                </td>
                <td className="px-4 py-2">
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${getStatusBadge(r.status)}`}
                >
                  {getStatusLabel(r.status)}
                </span>
              </td>

                <td className="px-4 py-2">
                  {new Date(r.deliveredAt ?? r.createdAt).toLocaleString("tr-TR")}
                </td>
              </tr>
            ))}

            {recent.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-400"
                >
                  Henüz talep yok
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =======================
   SUB COMPONENT
======================= */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
