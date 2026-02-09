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
import { createRoomSchema, type CreateRoomInput } from "@school-admin/shared";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateRoomInput>({
    resolver: zodResolver(createRoomSchema),
  });

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await apiGet<{ rooms: any[]; pagination: any }>("/rooms");
      if (response.success && response.data) {
        setRooms(response.data.rooms);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const onSubmit = async (data: CreateRoomInput) => {
    try {
      const response = await apiPost("/rooms", data);
      if (response.success) {
        setDialogOpen(false);
        reset();
        fetchRooms();
      }
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Nom",
    },
    {
      key: "code",
      header: "Code",
    },
    {
      key: "type",
      header: "Type",
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
          <h1 className="text-3xl font-bold">Salles</h1>
          <p className="text-muted-foreground">
            Gérez les salles de votre établissement
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nouvelle salle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une salle</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer une nouvelle salle
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  placeholder="Salle 101"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select id="type" {...register("type")}>
                  <option value="CLASSROOM">Salle de classe</option>
                  <option value="LAB">Laboratoire</option>
                  <option value="GYM">Gymnase</option>
                  <option value="LIBRARY">Bibliothèque</option>
                  <option value="AUDITORIUM">Amphithéâtre</option>
                  <option value="OTHER">Autre</option>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacité</Label>
                <Input
                  id="capacity"
                  type="number"
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
          <CardTitle>Liste des salles</CardTitle>
          <CardDescription>
            {rooms.length} salle(s) configurée(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={rooms}
            columns={columns}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
