"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@school-admin/ui";
import { Button, Input } from "@school-admin/ui";
import { DataTable } from "@/components/data-table";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";
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
import { createAnnouncementSchema, type CreateAnnouncementInput } from "@school-admin/shared";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateAnnouncementInput>({
    resolver: zodResolver(createAnnouncementSchema),
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [announcementsRes, classesRes] = await Promise.all([
        apiGet<{ data: any[]; pagination: any }>("/announcements"),
        apiGet<{ classes: any[] }>("/classes"),
      ]);

      if (announcementsRes.success && announcementsRes.data) {
        setAnnouncements(announcementsRes.data);
      }
      if (classesRes.success && classesRes.data) {
        setClasses(classesRes.data.classes || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: CreateAnnouncementInput) => {
    try {
      const response = await apiPost("/announcements", data);
      if (response.success) {
        setDialogOpen(false);
        reset();
        fetchData();
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      alert("Erreur lors de la création de l'annonce");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
      return;
    }

    try {
      const response = await apiDelete(`/announcements/${id}`);
      if (response.success) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const columns = [
    {
      key: "title",
      label: "Titre",
      render: (record: any) => record.title,
    },
    {
      key: "type",
      label: "Type",
      render: (record: any) => {
        const typeMap: Record<string, { label: string; color: string }> = {
          URGENT: { label: "Urgent", color: "text-red-600" },
          INFO: { label: "Info", color: "text-blue-600" },
          GENERAL: { label: "Général", color: "text-gray-600" },
        };
        const type = typeMap[record.type] || { label: record.type, color: "text-gray-600" };
        return <span className={type.color}>{type.label}</span>;
      },
    },
    {
      key: "targetAudience",
      label: "Audience",
      render: (record: any) => {
        if (record.targetAudience.includes("ALL")) {
          return "Tous";
        }
        return record.targetAudience.join(", ");
      },
    },
    {
      key: "publishDate",
      label: "Date publication",
      render: (record: any) => formatDate(record.publishDate),
    },
    {
      key: "expiryDate",
      label: "Date expiration",
      render: (record: any) => record.expiryDate ? formatDate(record.expiryDate) : "-",
    },
    {
      key: "actions",
      label: "Actions",
      render: (record: any) => (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleDelete(record.id)}
        >
          Supprimer
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Annonces</h1>
          <p className="text-muted-foreground">
            Créez et gérez les annonces pour l'école
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nouvelle annonce</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une annonce</DialogTitle>
              <DialogDescription>
                Rédigez une annonce pour les utilisateurs
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre</Label>
                  <Input {...register("title")} placeholder="Titre de l'annonce" />
                  {errors.title && (
                    <p className="text-red-500 text-sm">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="content">Contenu</Label>
                  <textarea
                    {...register("content")}
                    className="w-full min-h-[200px] p-2 border rounded"
                    placeholder="Contenu de l'annonce..."
                  />
                  {errors.content && (
                    <p className="text-red-500 text-sm">{errors.content.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select {...register("type")}>
                      <option value="GENERAL">Général</option>
                      <option value="URGENT">Urgent</option>
                      <option value="INFO">Info</option>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="targetAudience">Audience</Label>
                    <Select
                      multiple
                      {...register("targetAudience")}
                    >
                      <option value="ALL">Tous</option>
                      <option value="TEACHERS">Professeurs</option>
                      <option value="PARENTS">Parents</option>
                      <option value="STUDENTS">Élèves</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                    {errors.targetAudience && (
                      <p className="text-red-500 text-sm">{errors.targetAudience.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="publishDate">Date publication</Label>
                    <Input type="datetime-local" {...register("publishDate")} />
                  </div>

                  <div>
                    <Label htmlFor="expiryDate">Date expiration (optionnel)</Label>
                    <Input type="datetime-local" {...register("expiryDate")} />
                  </div>
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
          <CardTitle>Liste des annonces</CardTitle>
          <CardDescription>
            Annonces publiées et à venir
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <DataTable columns={columns} data={announcements} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
