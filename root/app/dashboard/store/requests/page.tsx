"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";
import RequestTable from "./RequestTable"; // ✅ BURASI EKSİKTİ

export default function StoreRequestsPage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    api.get("/store-products/my").then(res => {
      setProducts(
        res.data.filter(
          (p: any) => p.quantity === 0 || p.quantity < 5
        )
      );
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Depodan Ürün Talebi</h1>

      <p className="text-sm text-gray-600">
        Stok durumu düşük veya olmayan ürünler listelenir.
      </p>

      <RequestTable products={products} />
    </div>
  );
}
