"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";

type Truck = {
  id: string;
  plate: string;
};

export default function SurucuDuzenlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [license, setLicense] = useState("");
  const [status, setStatus] = useState("Active");

  const [currentTruck, setCurrentTruck] = useState<Truck | null>(null);
  const [availableTrucks, setAvailableTrucks] = useState<Truck[]>([]);
  const [truckAction, setTruckAction] = useState<string>("keep"); 
  // keep | remove | truckId

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔹 SÜRÜCÜ BİLGİLERİ + MEVCUT KAMYON
  useEffect(() => {
    if (!token) return;

    axios
      .get(`http://localhost:5144/api/drivers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const d = res.data;
        setFullName(d.fullName);
        setPhone(d.phone);
        setLicense(d.license);
        setStatus(d.status);

        if (d.truck) {
          setCurrentTruck({
            id: d.truck.id,
            plate: d.truck.plate,
          });
        }
      });
  }, [id, token]);

  // 🔹 BOŞTA KAMYONLAR
  useEffect(() => {
    if (!token) return;

    axios
      .get("http://localhost:5144/api/trucks/available", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAvailableTrucks(res.data))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    if (!token) return;

    setSaving(true);
    try {
      // 1️⃣ SÜRÜCÜ BİLGİLERİ
      await axios.put(
        `http://localhost:5144/api/drivers/${id}`,
        { fullName, phone, license, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2️⃣ KAMYON AKSİYONU
      if (truckAction === "remove") {
        await axios.put(
          `http://localhost:5144/api/drivers/${id}/assign-truck`,
          { truckId: null },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (truckAction !== "keep" && truckAction !== "remove") {
        await axios.put(
          `http://localhost:5144/api/drivers/${id}/assign-truck`,
          { truckId: truckAction },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      router.push("/dashboard/admin/suruculer");
    } catch (e: any) {
      alert(e?.response?.data ?? "Kaydetme başarısız");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Yükleniyor...</div>;

  return (
    <div className="p-6 max-w-xl space-y-4">
      <h1 className="text-xl font-bold">Sürücü Düzenle</h1>

      <input
        className="border p-2 w-full"
        placeholder="Ad Soyad"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <input
        className="border p-2 w-full"
        placeholder="Telefon"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        className="border p-2 w-full"
        placeholder="Ehliyet"
        value={license}
        onChange={(e) => setLicense(e.target.value)}
      />

      <select
        className="border p-2 w-full"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="Active">Müsait</option>
        <option value="OnDelivery">Yolda</option>
        <option value="Passive">Pasif</option>
      </select>

      {/* 🔹 KAMYON DROPDOWN */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Kamyon İşlemi</label>

        <select
          className="border p-2 w-full"
          value={truckAction}
          onChange={(e) => setTruckAction(e.target.value)}
          disabled={status === "OnDelivery"}
        >
          <option value="keep">
            {currentTruck
              ? `Mevcut: ${currentTruck.plate}`
              : "Mevcut: Kamyon Yok"}
          </option>

          <option value="remove">Kamyonu Kaldır</option>

          {availableTrucks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.plate}
            </option>
          ))}
        </select>

        {status === "OnDelivery" && (
          <div className="text-sm text-red-600">
            Teslimattaki sürücünün kamyonu değiştirilemez.
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </Button>

        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={saving}
        >
          İptal
        </Button>
      </div>
    </div>
  );
}
