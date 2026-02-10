"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@school-admin/ui";
import { Button } from "@school-admin/ui";
import { apiGet } from "@/lib/api-client";
import { formatDate, formatFullName } from "@school-admin/shared/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@school-admin/ui";

export default function TeacherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id as string;

  const [teacher, setTeacher] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        setLoading(true);
        const res = await apiGet<{ teacher: any }>(`/teachers/${teacherId}`);
        if (res.success && res.data) {
          setTeacher(res.data.teacher);
          setClasses(res.data.teacher.assignments || []);
        }
      } catch (error) {
        console.error("Error fetching teacher:", error);
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) {
      fetchTeacher();
    }
  }, [teacherId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Professeur non trouvé</h2>
          <Button onClick={() => router.push("/admin/teachers")} className="mt-4">
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/admin/teachers")}>
          ← Retour
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {formatFullName(teacher.user.firstName, teacher.user.lastName)}
        </h1>
        <p className="text-muted-foreground">{teacher.user.email}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {teacher.employeeNumber && (
              <div>
                <span className="font-medium">Numéro employé:</span>{" "}
                {teacher.employeeNumber}
              </div>
            )}
            {teacher.contractType && (
              <div>
                <span className="font-medium">Type de contrat:</span>{" "}
                {teacher.contractType}
              </div>
            )}
            {teacher.hireDate && (
              <div>
                <span className="font-medium">Date d&apos;embauche:</span>{" "}
                {formatDate(teacher.hireDate)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Affectations</CardTitle>
            <CardDescription>
              Classes et matières enseignées
            </CardDescription>
          </CardHeader>
          <CardContent>
            {classes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Classe</TableHead>
                    <TableHead>Matière</TableHead>
                    <TableHead>Année scolaire</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{assignment.class?.name}</TableCell>
                      <TableCell>{assignment.subject?.name}</TableCell>
                      <TableCell>
                        {assignment.academicYear?.name || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">
                Aucune affectation enregistrée pour ce professeur.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

