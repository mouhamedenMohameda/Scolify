"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@school-admin/ui";
import { Button, Input } from "@school-admin/ui";
import { DataTable } from "@/components/data-table";
import { apiGet, apiPut } from "@/lib/api-client";
import { formatDate } from "@school-admin/shared/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@school-admin/ui";
import { Label, Select } from "@school-admin/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateJustificationSchema, type UpdateJustificationInput } from "@school-admin/shared";

export default function JustificationsPage() {
  const [justifications, setJustifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJustification, setSelectedJustification] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<UpdateJustificationInput>({
    resolver: zodResolver(updateJustificationSchema),
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = `/justifications${statusFilter ? `?status=${statusFilter}` : ""}`;
      const res = await apiGet<{ data: any[]; pagination: any }>(url);

      if (res.success && res.data) {
        setJustifications(res.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleReview = (justification: any) => {
    setSelectedJustification(justification);
    setValue("id", justification.id);
    setValue("status", justification.status as "PENDING" | "APPROVED" | "REJECTED");
    setDialogOpen(true);
  };

  const onSubmit = async (data: UpdateJustificationInput) => {
    try {
      const response = await apiPut(`/justifications/${data.id}`, {
        status: data.status,
        notes: data.notes,
      });

      if (response.success) {
        setDialogOpen(false);
        reset();
        fetchData();
      }
    } catch (error) {
      console.error("Error updating justification:", error);
    }
  };

  const columns = [
    {
      key: "student",
      label: "Élève",
      render: (record: any) =>
        `${record.student?.firstName || ""} ${record.student?.lastName || ""}`,
    },
    {
      key: "date",
      label: "Date",
      render: (record: any) => formatDate(record.date),
    },
    {
      key: "reason",
      label: "Raison",
      render: (record: any) => (
        <span className="max-w-xs truncate block">{record.reason}</span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (record: any) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          PENDING: { label: "En attente", color: "text-yellow-600" },
          APPROVED: { label: "Approuvé", color: "text-green-600" },
          REJECTED: { label: "Rejeté", color: "text-red-600" },
        };
        const status = statusMap[record.status] || {
          label: record.status,
          color: "text-gray-600",
        };
        return <span className={status.color}>{status.label}</span>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (record: any) => (
        <Button
          size="sm"
          onClick={() => handleReview(record)}
          disabled={record.status !== "PENDING"}
        >
          {record.status === "PENDING" ? "Examiner" : "Voir"}
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Justificatifs</h1>
          <p className="text-muted-foreground">
            Gestion des justificatifs d'absence
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <option value="">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="APPROVED">Approuvés</option>
            <option value="REJECTED">Rejetés</option>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des justificatifs</CardTitle>
          <CardDescription>
            Examinez et validez les justificatifs d'absence
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <DataTable columns={columns} data={justifications} />
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Examiner le justificatif - {selectedJustification?.student?.firstName}{" "}
              {selectedJustification?.student?.lastName}
            </DialogTitle>
            <DialogDescription>
              Date: {selectedJustification && formatDate(selectedJustification.date)}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <Label>Raison</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedJustification?.reason}
                </p>
              </div>

              {selectedJustification?.documentUrl && (
                <div>
                  <Label>Document</Label>
                  <a
                    href={selectedJustification.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Voir le document
                  </a>
                </div>
              )}

              <div>
                <Label htmlFor="status">Décision</Label>
                <Select {...register("status")}>
                  <option value="APPROVED">Approuver</option>
                  <option value="REJECTED">Rejeter</option>
                </Select>
                {errors.status && (
                  <p className="text-red-500 text-sm">{errors.status.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Input
                  {...register("notes")}
                  placeholder="Ajouter des notes..."
                />
                {errors.notes && (
                  <p className="text-red-500 text-sm">{errors.notes.message}</p>
                )}
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
