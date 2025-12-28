"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";
import ProductTable from "../../../../components/ProductTable";

export default function StoreProductPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/store-products/my").then(res => {
      setProducts(res.data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Ürünlerim</h1>
      <ProductTable products={products} />
    </div>
  );
}
