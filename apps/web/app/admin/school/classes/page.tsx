"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@school-admin/ui";
import { Button } from "@school-admin/ui";
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
import { Input, Label, Select } from "@school-admin/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClassSchema, type CreateClassInput } from "@school-admin/shared";

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateClassInput>({
    resolver: zodResolver(createClassSchema),
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesRes, academicYearsRes, levelsRes] = await Promise.all([
        apiGet<{ classes: any[]; pagination: any }>("/classes"),
        apiGet<{ academicYears: any[] }>("/academic-years"),
        apiGet<{ levels: any[] }>("/levels"),
      ]);

      if (classesRes.success && classesRes.data) {
        setClasses(classesRes.data.classes);
      }
      if (academicYearsRes.success && academicYearsRes.data) {
        setAcademicYears(academicYearsRes.data.academicYears);
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

  const onSubmit = async (data: CreateClassInput) => {
    try {
      const response = await apiPost("/classes", data);
      if (response.success) {
        setDialogOpen(false);
        reset();
        fetchData();
      }
    } catch (error) {
      console.error("Error creating class:", error);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Nom",
    },
    {
      key: "level",
      header: "Niveau",
      render: (_: any, row: any) => row.level?.name || "-",
    },
    {
      key: "academicYear",
      header: "Année scolaire",
      render: (_: any, row: any) => row.academicYear?.name || "-",
    },
    {
      key: "_count",
      header: "Élèves",
      render: (_: any, row: any) => row._count?.enrollments || 0,
    },
    {
      key: "capacity",
      header: "Capacité",
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Classes</h1>
          <p className="text-muted-foreground">
            Gérez les classes de votre établissement
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nouvelle classe</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une classe</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer une nouvelle classe
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  placeholder="6ème A"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYearId">Année scolaire</Label>
                <Select id="academicYearId" {...register("academicYearId")}>
                  <option value="">Sélectionner...</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
                </Select>
                {errors.academicYearId && (
                  <p className="text-sm text-red-600">
                    {errors.academicYearId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="levelId">Niveau</Label>
                <Select id="levelId" {...register("levelId")}>
                  <option value="">Sélectionner...</option>
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name} ({level.code})
                    </option>
                  ))}
                </Select>
                {errors.levelId && (
                  <p className="text-sm text-red-600">
                    {errors.levelId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacité</Label>
                <Input
                  id="capacity"
                  type="number"
                  defaultValue={30}
                  {...register("capacity", { valueAsNumber: true })}
                />
                {errors.capacity && (
                  <p className="text-sm text-red-600">
                    {errors.capacity.message}
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
          <CardTitle>Liste des classes</CardTitle>
          <CardDescription>
            {classes.length} classe(s) configurée(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={classes}
            columns={columns}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
