"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import type { Route } from "next";

import { Button } from "../../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";

interface Depot {
  id: string;
  name: string;
  address: string;
  capacity: number;
  isActive: boolean;
}

export default function AdminDepoListesi() {
  const [depots, setDepots] = useState<Depot[]>([]);
  const [sortField, setSortField] = useState<keyof Depot | null>(null);
  const [sortDirection, setSortDirection] = useState<"default" | "asc" | "desc">("default");

  const router = useRouter();

  useEffect(() => {
    axios
      .get("http://localhost:5144/api/depots")
      .then((res) => setDepots(res.data))
      .catch((err) => console.error("Depolar alınamadı", err));
  }, []);

  const handleAddDepot = () => {
    router.push("/dashboard/admin/depolar/yeni" as unknown as Route);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu depoyu silmek istediğinizden emin misiniz?")) return;

    try {
      await axios.delete(`http://localhost:5144/api/depots/${id}`);
      alert("Depo başarıyla silindi.");
      setDepots((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Depo silinirken bir hata oluştu.");
    }
  };

  const handleSort = (field: keyof Depot) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection("asc");
    } else {
      setSortDirection((prev) =>
        prev === "asc" ? "desc" : prev === "desc" ? "default" : "asc"
      );
    }
  };

  const sortedDepots = [...depots].sort((a, b) => {
    if (!sortField || sortDirection === "default") return 0;

    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }

    if (typeof aVal === "boolean" && typeof bVal === "boolean") {
      return sortDirection === "asc"
        ? Number(aVal) - Number(bVal)
        : Number(bVal) - Number(aVal);
    }

    return 0;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Tüm Depolar</h1>
        <Button onClick={handleAddDepot}>+ Yeni Depo Ekle</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
          <TableHead>
  <div onClick={() => handleSort("name")} className="cursor-pointer select-none">
    Depo Adı {sortField === "name" && (sortDirection === "asc" ? "▲" : sortDirection === "desc" ? "▼" : "")}
  </div>
</TableHead>

<TableHead>
  <div onClick={() => handleSort("address")} className="cursor-pointer select-none">
    Adres {sortField === "address" && (sortDirection === "asc" ? "▲" : sortDirection === "desc" ? "▼" : "")}
  </div>
</TableHead>
<TableHead>
  <div onClick={() => handleSort("capacity")} className="cursor-pointer select-none">
    Kapasite {sortField === "capacity" && (sortDirection === "asc" ? "▲" : sortDirection === "desc" ? "▼" : "")}
  </div>
</TableHead>
<TableHead>
  <div onClick={() => handleSort("isActive")} className="cursor-pointer select-none">
    Durum {sortField === "isActive" && (sortDirection === "asc" ? "▲" : sortDirection === "desc" ? "▼" : "")}
  </div>
</TableHead>

            <TableHead>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDepots.map((depo) => (
            <TableRow key={depo.id}>
              <TableCell>{depo.name}</TableCell>
              <TableCell>{depo.address}</TableCell>
              <TableCell>{depo.capacity}</TableCell>
              <TableCell>
                {depo.isActive ? (
                  <span className="text-green-600 font-medium">Aktif</span>
                ) : (
                  <span className="text-red-600 font-medium">Pasif</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {/* <Button
                    variant="outline"
                    onClick={() =>
                      router.push(`/dashboard/admin/depolar/${depo.id}` as unknown as Route)
                    }
                  >
                    Detay
                  </Button> */}
                  <Button
                    variant="secondary"
                    onClick={() =>
                      router.push(`/dashboard/admin/depolar/duzenle/${depo.id}` as unknown as Route)
                    }
                  >
                    Düzenle
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(depo.id)}
                  >
                    Sil
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
