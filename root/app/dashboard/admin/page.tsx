"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [critical, setCritical] = useState<any>(null);
  const [productDemand, setProductDemand] = useState<any>(null);

  useEffect(() => {
    api.get("/admin/dashboard").then(res => setData(res.data));
    api.get("/admin/dashboard/critical-stocks?threshold=5")
      .then(res => setCritical(res.data));
    api.get("/admin/dashboard/product-demand?days=7")
      .then(res => setProductDemand(res.data));
    
  }, []);

  if (!data) return <div>Yükleniyor...</div>;

  const { cards, charts } = data;

  const pieData = [
    { name: "Beklemede", value: charts.statusDistribution.pending },
    { name: "Yolda", value: charts.statusDistribution.onTheWay },
    { name: "Teslim", value: charts.statusDistribution.delivered },
  ];

  const COLORS = ["#facc15", "#3b82f6", "#22c55e"];

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      {/* ================= KARTLAR ================= */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card title="Toplam Ürün" value={cards.totalProducts} />
        <Card title="Toplam Stok" value={cards.totalStock} />
        <Card title="Bekleyen" value={cards.pendingRequests} />
        <Card title="Yolda" value={cards.onTheWayRequests} />
        <Card title="Teslim Edildi" value={cards.deliveredRequests} />
        <Card
          title="Kritik Stok"
          value={critical?.count ?? 0}
          danger
        />
      </div>

      {/* ================= KRİTİK STOK LİSTESİ ================= */}
      {critical && critical.count > 0 && (
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-3 text-red-600">
            🚨 Kritik Stoktaki Ürünler
          </h2>

          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Kod</th>
                <th className="p-2 text-left">Ürün</th>
                <th className="p-2 text-right">Toplam Stok</th>
              </tr>
            </thead>
            <tbody>
              {critical.items.map((x: any) => (
                <tr key={x.productId} className="border-t">
                  <td className="p-2">{x.productCode}</td>
                  <td className="p-2">{x.productName}</td>
                  <td className="p-2 text-right font-semibold text-red-600">
                    {x.totalQuantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= GRAFİKLER ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Günlük Talepler */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-4">Son 7 Günlük Talepler</h2>

          <LineChart width={400} height={300} data={charts.dailyRequests}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("tr-TR")
              }
            />

            <YAxis />

            <Tooltip
              labelFormatter={(value) =>
                new Date(value).toLocaleDateString("tr-TR")
              }
            />

            <Line type="monotone" dataKey="count" stroke="#3b82f6" />
          </LineChart>
        </div>

        {/* Durum Dağılımı */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-4">Talep Durum Dağılımı</h2>

          <PieChart width={400} height={300}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
      {/* ================= ÜRÜN TALEP ANALİZİ ================= */}
{productDemand && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

    {/* En Çok Talep Edilenler */}
    <div className="bg-white rounded shadow p-4">
      <h2 className="font-semibold mb-4">
        📊 En Çok Talep Edilen Ürünler (Son 7 Gün)
      </h2>

      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Kod</th>
            <th className="p-2 text-left">Ürün</th>
            <th className="p-2 text-right">Talep Sayısı</th>
          </tr>
        </thead>
        <tbody>
          {productDemand.topProducts.map((x: any) => (
            <tr key={x.productId} className="border-t">
              <td className="p-2">{x.productCode}</td>
              <td className="p-2">{x.productName}</td>
              <td className="p-2 text-right font-semibold">
                {x.requestCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Hiç Talep Almayanlar */}
    <div className="bg-white rounded shadow p-4">
      <h2 className="font-semibold mb-4 text-gray-600">
        📉 Hiç Talep Almayan Ürünler
      </h2>

      {productDemand.neverRequested.length === 0 ? (
        <div className="text-sm text-green-600">
          Tüm ürünler en az bir kez talep edilmiş 👍
        </div>
      ) : (
        <ul className="list-disc pl-5 text-sm">
          {productDemand.neverRequested.map((x: any) => (
            <li key={x.productId}>
              {x.productCode} — {x.productName}
            </li>
          ))}
        </ul>
      )}
    </div>

  </div>
)}

    </div>
  );
}

/* ================= CARD ================= */
function Card({
  title,
  value,
  danger,
}: {
  title: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded shadow p-4 ${
        danger ? "bg-red-50 border border-red-400" : "bg-white"
      }`}
    >
      <div className="text-sm text-gray-600">{title}</div>
      <div
        className={`text-2xl font-semibold ${
          danger ? "text-red-600" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
