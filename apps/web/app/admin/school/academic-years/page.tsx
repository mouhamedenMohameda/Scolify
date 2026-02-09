"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@school-admin/ui";
import { Button } from "@school-admin/ui";
import { DataTable } from "@/components/data-table";
import { apiGet, apiPost } from "@/lib/api-client";
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
import { Input, Label } from "@school-admin/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAcademicYearSchema, type CreateAcademicYearInput } from "@school-admin/shared";

export default function AcademicYearsPage() {
  const router = useRouter();
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateAcademicYearInput>({
    resolver: zodResolver(createAcademicYearSchema),
  });

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      const response = await apiGet<{ academicYears: any[] }>("/academic-years");
      if (response.success && response.data) {
        setAcademicYears(response.data.academicYears);
      }
    } catch (error) {
      console.error("Error fetching academic years:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const onSubmit = async (data: CreateAcademicYearInput) => {
    try {
      const response = await apiPost("/academic-years", data);
      if (response.success) {
        setDialogOpen(false);
        reset();
        fetchAcademicYears();
      }
    } catch (error) {
      console.error("Error creating academic year:", error);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Nom",
    },
    {
      key: "startDate",
      header: "Date début",
      render: (value: string) => formatDate(value),
    },
    {
      key: "endDate",
      header: "Date fin",
      render: (value: string) => formatDate(value),
    },
    {
      key: "isActive",
      header: "Statut",
      render: (value: boolean) => (
        <span className={value ? "text-green-600" : "text-gray-500"}>
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Années Scolaires</h1>
          <p className="text-muted-foreground">
            Gérez les années scolaires de votre établissement
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nouvelle année scolaire</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une année scolaire</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer une nouvelle année scolaire
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  placeholder="2024-2025"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-600">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-600">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
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
          <CardTitle>Liste des années scolaires</CardTitle>
          <CardDescription>
            {academicYears.length} année(s) scolaire(s) configurée(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={academicYears}
            columns={columns}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
