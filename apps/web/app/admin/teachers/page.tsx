"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@school-admin/ui";
import { Button, Input } from "@school-admin/ui";
import { DataTable } from "@/components/data-table";
import { apiGet, apiPost } from "@/lib/api-client";
import { formatFullName } from "@school-admin/shared/utils";
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
import { createTeacherSchema, type CreateTeacherInput } from "@school-admin/shared";

export default function TeachersPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTeacherInput>({
    resolver: zodResolver(createTeacherSchema),
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiGet<{ teachers: any[]; pagination: any }>(
        `/teachers?search=${search}`
      );
      if (response.success && response.data) {
        setTeachers(response.data.teachers);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const onSubmit = async (data: CreateTeacherInput) => {
    try {
      const response = await apiPost("/teachers", data);
      if (response.success) {
        setDialogOpen(false);
        reset();
        fetchData();
      }
    } catch (error) {
      console.error("Error creating teacher:", error);
    }
  };

  const columns = [
    {
      key: "user",
      header: "Nom",
      render: (_: any, row: any) =>
        formatFullName(row.user.firstName, row.user.lastName),
    },
    {
      key: "user",
      header: "Email",
      render: (_: any, row: any) => row.user.email,
    },
    {
      key: "employeeNumber",
      header: "Numéro employé",
    },
    {
      key: "_count",
      header: "Affectations",
      render: (_: any, row: any) => row._count?.assignments || 0,
    },
    {
      key: "actions",
      header: "Actions",
      render: (_: any, row: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/teachers/${row.id}`)}
        >
          Voir
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Professeurs</h1>
          <p className="text-muted-foreground">
            Gérez les professeurs de votre établissement
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nouveau professeur</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un professeur</DialogTitle>
              <DialogDescription>
                Associez un utilisateur existant comme professeur
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">Utilisateur *</Label>
                <Select id="userId" {...register("userId")}>
                  <option value="">Sélectionner un utilisateur...</option>
                  {/* TODO: Fetch users list */}
                </Select>
                {errors.userId && (
                  <p className="text-sm text-red-600">{errors.userId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeNumber">Numéro employé</Label>
                <Input id="employeeNumber" {...register("employeeNumber")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractType">Type de contrat</Label>
                <Select id="contractType" {...register("contractType")}>
                  <option value="">Sélectionner...</option>
                  <option value="FULL_TIME">Temps plein</option>
                  <option value="PART_TIME">Temps partiel</option>
                  <option value="CONTRACTOR">Contractuel</option>
                </Select>
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

      <div className="mb-4">
        <Input
          placeholder="Rechercher un professeur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des professeurs</CardTitle>
          <CardDescription>
            {teachers.length} professeur(s) enregistré(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={teachers} columns={columns} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
