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

interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

export default function AdminMagazaListesi() {
  const [stores, setStores] = useState<Store[]>([]);
  const router = useRouter();

  useEffect(() => {
    axios
      .get("http://localhost:5144/api/stores")
      .then((res) => setStores(res.data))
      .catch((err) => console.error("Mağazalar alınamadı", err));
  }, []);

  const handleAddStore = () => {
    router.push("/dashboard/admin/magazalar/yeni" as unknown as Route);
  };

  const handleDelete = (id: string) => {
    const confirmed = confirm("Bu mağazayı silmek istediğinize emin misiniz?");
    if (!confirmed) return;

    axios
      .delete(`http://localhost:5144/api/stores/${id}`)
      .then(() => setStores((prev) => prev.filter((m) => m.id !== id)))
      .catch((err) => alert("Silme işlemi başarısız: " + err));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Tüm Mağazalar</h1>
        <Button onClick={handleAddStore}>+ Yeni Mağaza Ekle</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mağaza Adı</TableHead>
            <TableHead>Adres</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stores.map((magaza) => (
            <TableRow key={magaza.id}>
              <TableCell>{magaza.name}</TableCell>
              <TableCell>{magaza.address}</TableCell>
              <TableCell>{magaza.phone}</TableCell>
              <TableCell>
                {magaza.isActive ? (
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
                      router.push(`/dashboard/admin/magazalar/${magaza.id}` as unknown as Route)
                    }
                  >
                    Detay
                  </Button> */}
                  <Button
                    variant="secondary"
                    onClick={() =>
                      router.push(`/dashboard/admin/magazalar/duzenle/${magaza.id}` as unknown as Route)
                    }
                  >
                    Düzenle
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(magaza.id)}
                  >
                    Kapat
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
