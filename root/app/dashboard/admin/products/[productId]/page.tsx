
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";
import { useParams } from "next/navigation";

export default function AdminProductDetailPage() {
  const { productId } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get(`/admin/products/${productId}/details`)
      .then(res => setData(res.data));
  }, [productId]);

  if (!data) return <div>Yükleniyor...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Ürün Detayı</h1>

      <div>
        <h2 className="font-semibold mb-2">Depolar</h2>
        <ul className="list-disc pl-6">
          {data.depots.map((d: any) => (
            <li key={d.depotId}>
              {d.depotName} → {d.quantity}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Mağazalar</h2>
        <ul className="list-disc pl-6">
          {data.stores.map((s: any) => (
            <li key={s.storeId}>
              {s.storeName} → {s.quantity}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

