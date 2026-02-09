"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@school-admin/ui";
import { Button, Input } from "@school-admin/ui";
import { DataTable } from "@/components/data-table";
import { apiGet, apiPost } from "@/lib/api-client";
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
import { createSubjectSchema, type CreateSubjectInput } from "@school-admin/shared";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateSubjectInput>({
    resolver: zodResolver(createSubjectSchema),
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subjectsRes, levelsRes] = await Promise.all([
        apiGet<{ subjects: any[] }>("/subjects"),
        apiGet<{ levels: any[] }>("/levels"),
      ]);

      if (subjectsRes.success && subjectsRes.data) {
        setSubjects(subjectsRes.data.subjects);
      }
      if (levelsRes.success && levelsRes.data) {
        setLevels(levelsRes.data.levels);
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

  const onSubmit = async (data: CreateSubjectInput) => {
    try {
      const response = await apiPost("/subjects", data);
      if (response.success) {
        setDialogOpen(false);
        reset();
        fetchData();
      }
    } catch (error) {
      console.error("Error creating subject:", error);
    }
  };

  const columns = [
    {
      key: "code",
      header: "Code",
    },
    {
      key: "name",
      header: "Nom",
    },
    {
      key: "level",
      header: "Niveau",
      render: (_: any, row: any) => row.level?.name || "Tous",
    },
    {
      key: "_count",
      header: "Affectations",
      render: (_: any, row: any) => row._count?.assignments || 0,
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Matières</h1>
          <p className="text-muted-foreground">
            Gérez les matières enseignées
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nouvelle matière</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une matière</DialogTitle>
              <DialogDescription>
                Ajoutez une nouvelle matière à votre établissement
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input id="code" placeholder="MATH, FR, ENG" {...register("code")} />
                {errors.code && (
                  <p className="text-sm text-red-600">{errors.code.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input id="name" placeholder="Mathématiques" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="levelId">Niveau (optionnel)</Label>
                <Select id="levelId" {...register("levelId")}>
                  <option value="">Tous les niveaux</option>
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name} ({level.code})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Couleur (optionnel)</Label>
                <Input id="color" type="color" {...register("color")} />
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
          <CardTitle>Liste des matières</CardTitle>
          <CardDescription>
            {subjects.length} matière(s) configurée(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={subjects} columns={columns} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
