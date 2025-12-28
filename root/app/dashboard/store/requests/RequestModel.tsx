"use client";

import { useState } from "react";
import { api } from "@/lib/http";

export default function RequestModal({
  product,
  onClose,
}: {
  product: any;
  onClose: () => void;
}) {
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const submitRequest = async () => {
    setLoading(true);
    try {
      await api.post("/store-requests", {
        productId: product.productId,
        requestedQuantity: quantity,
      });

      alert("Talep başarıyla oluşturuldu");
      onClose();
    } catch (err) {
      alert("Talep oluşturulamadı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[380px] space-y-4">
        <h2 className="text-lg font-semibold">Depodan Ürün Talebi</h2>

        <div className="text-sm text-gray-600">
          <div>
            <b>Ürün:</b> {product.name}
          </div>
          <div>
            <b>Mevcut Stok:</b> {product.quantity}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Talep Miktarı</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border"
          >
            İptal
          </button>
          <button
            onClick={submitRequest}
            disabled={loading}
            className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-60"
          >
            {loading ? "Gönderiliyor..." : "Talep Gönder"}
          </button>
        </div>
      </div>
    </div>
  );
}
