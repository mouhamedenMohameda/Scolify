"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@school-admin/ui";
import { Button, Input } from "@school-admin/ui";
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
import { Label, Select } from "@school-admin/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createStudentSchema, type CreateStudentInput } from "@school-admin/shared";

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateStudentInput>({
    resolver: zodResolver(createStudentSchema),
  });

  const selectedAcademicYearId = watch("academicYearId");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, academicYearsRes] = await Promise.all([
        apiGet<{ students: any[]; pagination: any }>(`/students?search=${search}`),
        apiGet<{ academicYears: any[] }>("/academic-years"),
      ]);

      if (studentsRes.success && studentsRes.data) {
        setStudents(studentsRes.data.students);
      }
      if (academicYearsRes.success && academicYearsRes.data) {
        setAcademicYears(academicYearsRes.data.academicYears);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  // Fetch classes when academic year changes
  useEffect(() => {
    if (selectedAcademicYearId) {
      apiGet<{ classes: any[] }>(`/classes?academicYearId=${selectedAcademicYearId}`).then(
        (res) => {
          if (res.success && res.data) {
            setClasses(res.data.classes);
          }
        }
      );
    } else {
      setClasses([]);
    }
  }, [selectedAcademicYearId]);

  const onSubmit = async (data: CreateStudentInput) => {
    try {
      const response = await apiPost("/students", data);
      if (response.success) {
        setDialogOpen(false);
        reset();
        fetchData();
      }
    } catch (error) {
      console.error("Error creating student:", error);
    }
  };

  const columns = [
    {
      key: "matricule",
      header: "Matricule",
    },
    {
      key: "firstName",
      header: "Prénom",
    },
    {
      key: "lastName",
      header: "Nom",
    },
    {
      key: "enrollments",
      header: "Classe",
      render: (_: any, row: any) => {
        const activeEnrollment = row.enrollments?.[0];
        return activeEnrollment ? activeEnrollment.class?.name : "-";
      },
    },
    {
      key: "status",
      header: "Statut",
      render: (value: string) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          ENROLLED: { label: "Inscrit", color: "text-green-600" },
          SUSPENDED: { label: "Suspendu", color: "text-yellow-600" },
          TRANSFERRED: { label: "Transféré", color: "text-blue-600" },
          DROPPED_OUT: { label: "Radié", color: "text-red-600" },
        };
        const status = statusMap[value] || { label: value, color: "text-gray-600" };
        return <span className={status.color}>{status.label}</span>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (_: any, row: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/students/${row.id}`)}
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
          <h1 className="text-3xl font-bold">Élèves</h1>
          <p className="text-muted-foreground">
            Gérez les élèves de votre établissement
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nouvel élève</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Inscrire un nouvel élève</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour inscrire un nouvel élève
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input id="firstName" {...register("firstName")} />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input id="lastName" {...register("lastName")} />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date de naissance *</Label>
                  <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Genre</Label>
                  <Select id="gender" {...register("gender")}>
                    <option value="">Sélectionner...</option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                    <option value="OTHER">Autre</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" type="tel" {...register("phone")} />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicYearId">Année scolaire *</Label>
                <Select id="academicYearId" {...register("academicYearId")}>
                  <option value="">Sélectionner...</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
                </Select>
                {errors.academicYearId && (
                  <p className="text-sm text-red-600">{errors.academicYearId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="classId">Classe *</Label>
                <Select id="classId" {...register("classId")} disabled={!selectedAcademicYearId}>
                  <option value="">Sélectionner une année scolaire d'abord</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </Select>
                {errors.classId && (
                  <p className="text-sm text-red-600">{errors.classId.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Inscrire</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Rechercher un élève..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des élèves</CardTitle>
          <CardDescription>
            {students.length} élève(s) inscrit(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={students} columns={columns} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
