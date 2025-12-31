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

  useEffect(() => {
    api.get("/admin/dashboard").then(res => setData(res.data));
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

      {/* ====== KARTLAR ====== */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card title="Toplam Ürün" value={cards.totalProducts} />
        <Card title="Toplam Stok" value={cards.totalStock} />
        <Card title="Bekleyen" value={cards.pendingRequests} />
        <Card title="Yolda" value={cards.onTheWayRequests} />
        <Card title="Teslim Edildi" value={cards.deliveredRequests} />
      </div>

      {/* ====== GRAFİKLER ====== */}
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
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
