"use client";

import { useEffect, useState } from "react";
import { getProfile } from "@/lib/auth";

export default function DepotDashboard() {
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    getProfile().then(profile => {
      setEmail(profile.email);
    });
  }, []);

  return (
    <>
      <h1 className="text-2xl font-semibold">Depo Paneli</h1>
      <p className="mt-2">
        Hoş geldin <b>{email}</b>
      </p>

      <div className="mt-6 p-4 bg-white rounded-xl shadow">
        📦 Depodaki ürünleri yönetebilir, stokları görüntüleyebilirsin.
      </div>
    </>
  );
}
