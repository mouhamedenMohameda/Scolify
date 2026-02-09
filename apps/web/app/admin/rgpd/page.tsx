"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@school-admin/ui";
import { Button, Input } from "@school-admin/ui";
import { DataTable } from "@/components/data-table";
import { apiGet, apiPost, apiPut } from "@/lib/api-client";
import { formatDate } from "@school-admin/shared/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@school-admin/ui";
import { Label, Select } from "@school-admin/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createConsentSchema, type CreateConsentInput } from "@school-admin/shared";

export default function RGPDPage() {
  const [consents, setConsents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateConsentInput>({
    resolver: zodResolver(createConsentSchema),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [consentsRes, usersRes] = await Promise.all([
        apiGet<{ data: any[]; pagination: any }>("/consents"),
        apiGet<{ users: any[] }>("/students"), // In real app, fetch all users
      ]);

      if (consentsRes.success && consentsRes.data) {
        setConsents(consentsRes.data);
      }
      if (usersRes.success && usersRes.data) {
        // In real app, get all users (teachers, parents, etc.)
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CreateConsentInput) => {
    try {
      const response = await apiPost("/consents", data);
      if (response.success) {
        setDialogOpen(false);
        reset();
        fetchData();
      }
    } catch (error) {
      console.error("Error creating consent:", error);
      alert("Erreur lors de la création du consentement");
    }
  };

  const handleToggleConsent = async (consent: any) => {
    try {
      const response = await apiPut(`/consents/${consent.id}`, {
        given: !consent.given,
      });

      if (response.success) {
        fetchData();
      }
    } catch (error) {
      console.error("Error updating consent:", error);
    }
  };

  const handleExportData = async (userId: string) => {
    try {
      const response = await apiPost("/rgpd/export", { userId });
      if (response.success) {
        // Download JSON file
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `user_data_${userId}_${new Date().toISOString().split("T")[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Erreur lors de l'export des données");
    }
  };

  const columns = [
    {
      key: "user",
      label: "Utilisateur",
      render: (record: any) =>
        `${record.user?.firstName || ""} ${record.user?.lastName || ""}`,
    },
    {
      key: "type",
      label: "Type",
      render: (record: any) => {
        const typeMap: Record<string, string> = {
          PHOTO: "Photo",
          COMMUNICATION: "Communication",
          HEALTH_DATA: "Données santé",
          DATA_PROCESSING: "Traitement données",
          MARKETING: "Marketing",
          OTHER: "Autre",
        };
        return typeMap[record.type] || record.type;
      },
    },
    {
      key: "given",
      label: "Statut",
      render: (record: any) => (
        <span className={record.given ? "text-green-600" : "text-red-600"}>
          {record.given ? "Donné" : "Refusé"}
        </span>
      ),
    },
    {
      key: "givenAt",
      label: "Date consentement",
      render: (record: any) =>
        record.givenAt ? formatDate(record.givenAt) : "-",
    },
    {
      key: "version",
      label: "Version",
      render: (record: any) => record.version,
    },
    {
      key: "actions",
      label: "Actions",
      render: (record: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggleConsent(record)}
          >
            {record.given ? "Révoquer" : "Donner"}
          </Button>
          <Button
            size="sm"
            onClick={() => handleExportData(record.userId)}
          >
            Exporter données
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">RGPD & Consentements</h1>
          <p className="text-muted-foreground">
            Gestion des consentements et conformité RGPD
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nouveau consentement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un consentement</DialogTitle>
              <DialogDescription>
                Enregistrer un consentement utilisateur
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userId">Utilisateur</Label>
                  <Select {...register("userId")}>
                    <option value="">Sélectionner un utilisateur</option>
                    {/* In real app, list all users */}
                  </Select>
                  {errors.userId && (
                    <p className="text-red-500 text-sm">{errors.userId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select {...register("type")}>
                    <option value="PHOTO">Photo</option>
                    <option value="COMMUNICATION">Communication</option>
                    <option value="HEALTH_DATA">Données santé</option>
                    <option value="DATA_PROCESSING">Traitement données</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="OTHER">Autre</option>
                  </Select>
                  {errors.type && (
                    <p className="text-red-500 text-sm">{errors.type.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="given">Consentement donné</Label>
                  <Select {...register("given", { valueAsNumber: false })}>
                    <option value="false">Non</option>
                    <option value="true">Oui</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="version">Version</Label>
                  <Input {...register("version")} placeholder="v1.0" />
                  {errors.version && (
                    <p className="text-red-500 text-sm">{errors.version.message}</p>
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
                <Button type="submit">Créer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des consentements</CardTitle>
          <CardDescription>
            Gestion des consentements RGPD
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <DataTable columns={columns} data={consents} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
