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
import { createLevelSchema, type CreateLevelInput } from "@school-admin/shared";

export default function LevelsPage() {
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateLevelInput>({
    resolver: zodResolver(createLevelSchema),
  });

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const response = await apiGet<{ levels: any[] }>("/levels");
      if (response.success && response.data) {
        setLevels(response.data.levels);
      }
    } catch (error) {
      console.error("Error fetching levels:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  const onSubmit = async (data: CreateLevelInput) => {
    try {
      const response = await apiPost("/levels", data);
      if (response.success) {
        setDialogOpen(false);
        reset();
        fetchLevels();
      }
    } catch (error) {
      console.error("Error creating level:", error);
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
      key: "order",
      header: "Ordre",
    },
    {
      key: "stream",
      header: "Filière",
    },
    {
      key: "_count",
      header: "Classes",
      render: (_: any, row: any) => row._count?.classes || 0,
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Niveaux Scolaires</h1>
          <p className="text-muted-foreground">
            Gérez les niveaux scolaires de votre établissement
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nouveau niveau</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un niveau</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer un nouveau niveau
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  placeholder="CP, CE1, 6EME, etc."
                  {...register("code")}
                />
                {errors.code && (
                  <p className="text-sm text-red-600">{errors.code.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  placeholder="Cours Préparatoire"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Ordre</Label>
                <Input
                  id="order"
                  type="number"
                  {...register("order", { valueAsNumber: true })}
                />
                {errors.order && (
                  <p className="text-sm text-red-600">{errors.order.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stream">Filière (optionnel)</Label>
                <Select id="stream" {...register("stream")}>
                  <option value="">Aucune</option>
                  <option value="GENERAL">Générale</option>
                  <option value="PRO">Professionnelle</option>
                  <option value="TECHNICAL">Technique</option>
                </Select>
                {errors.stream && (
                  <p className="text-sm text-red-600">{errors.stream.message}</p>
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
          <CardTitle>Liste des niveaux</CardTitle>
          <CardDescription>
            {levels.length} niveau(x) configuré(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={levels}
            columns={columns}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
