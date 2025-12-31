"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";

export default function YeniSurucuPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [license, setLicense] = useState("");
  const [status, setStatus] = useState("Müsait");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSaving(true);
    try {
      await axios.post(
        "http://localhost:5144/api/drivers",
        { fullName, phone, license, status, truckId: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      router.push("/dashboard/admin/suruculer");
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data ?? "Ekleme başarısız.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Yeni Sürücü</h1>

      <div className="space-y-2">
        <label className="text-sm">Ad Soyad</label>
        <input className="w-full border p-2" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Telefon</label>
        <input className="w-full border p-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Ehliyet</label>
        <input className="w-full border p-2" value={license} onChange={(e) => setLicense(e.target.value)} />
      </div>

      <select
  className="border p-2 w-full"
  value={status}
  onChange={(e) => setStatus(e.target.value)}
>
<option value="Active">Müsait</option>
  <option value="OnDelivery">Yolda</option>
  <option value="Passive">Pasif</option>
</select>


      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </Button>

        <Button variant="outline" onClick={() => router.back()} disabled={saving}>
          İptal
        </Button>
      </div>
    </div>
  );
}
