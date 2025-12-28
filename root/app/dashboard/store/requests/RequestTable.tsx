"use client";

import { useState } from "react";
import RequestModal from "./RequestModel";

export default function RequestTable({ products }: { products: any[] }) {
  const [selected, setSelected] = useState<any | null>(null);

  return (
    <>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Kod</th>
              <th className="p-3 text-left">Ürün</th>
              <th className="p-3 text-right">Mevcut</th>
              <th className="p-3 text-center">Durum</th>
              <th className="p-3 text-center">Talep</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.code}</td>
                <td className="p-3">{p.name}</td>
                <td className="p-3 text-right">{p.quantity}</td>
                <td className="p-3 text-center">
                  {p.quantity === 0 ? (
                    <span className="text-red-600">Stok Yok</span>
                  ) : (
                    <span className="text-yellow-600">Düşük</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => setSelected(p)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  >
                    Talep Et
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <RequestModal
          product={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
