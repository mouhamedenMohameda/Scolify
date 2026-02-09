"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@school-admin/ui";
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

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const [student, setStudent] = useState<any>(null);
  const [guardians, setGuardians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const [studentRes, guardiansRes] = await Promise.all([
          apiGet<{ student: any }>(`/students/${studentId}`),
          apiGet<{ guardians: any[] }>(`/students/${studentId}/guardians`),
        ]);

        if (studentRes.success && studentRes.data) {
          setStudent(studentRes.data.student);
        }
        if (guardiansRes.success && guardiansRes.data) {
          setGuardians(guardiansRes.data.guardians);
        }
      } catch (error) {
        console.error("Error fetching student:", error);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudent();
    }
  }, [studentId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Élève non trouvé</h2>
          <Button onClick={() => router.push("/admin/students")} className="mt-4">
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  const activeEnrollment = student.enrollments?.[0];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/admin/students")}>
          ← Retour
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {formatFullName(student.firstName, student.lastName)}
        </h1>
        <p className="text-muted-foreground">Matricule: {student.matricule}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Date de naissance:</span>{" "}
              {formatDate(student.dateOfBirth)}
            </div>
            {student.gender && (
              <div>
                <span className="font-medium">Genre:</span> {student.gender}
              </div>
            )}
            {student.email && (
              <div>
                <span className="font-medium">Email:</span> {student.email}
              </div>
            )}
            {student.phone && (
              <div>
                <span className="font-medium">Téléphone:</span> {student.phone}
              </div>
            )}
            {student.address && (
              <div>
                <span className="font-medium">Adresse:</span> {student.address}
                {student.city && `, ${student.city}`}
                {student.postalCode && ` ${student.postalCode}`}
              </div>
            )}
            <div>
              <span className="font-medium">Statut:</span>{" "}
              <span
                className={
                  student.status === "ENROLLED"
                    ? "text-green-600"
                    : student.status === "SUSPENDED"
                    ? "text-yellow-600"
                    : "text-red-600"
                }
              >
                {student.status}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scolarité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeEnrollment ? (
              <>
                <div>
                  <span className="font-medium">Classe:</span>{" "}
                  {activeEnrollment.class?.name}
                </div>
                <div>
                  <span className="font-medium">Niveau:</span>{" "}
                  {activeEnrollment.class?.level?.name}
                </div>
                <div>
                  <span className="font-medium">Année scolaire:</span>{" "}
                  {activeEnrollment.academicYear?.name}
                </div>
                <div>
                  <span className="font-medium">Date d'inscription:</span>{" "}
                  {formatDate(activeEnrollment.startDate)}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Aucune inscription active</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Parents / Tuteurs</CardTitle>
          <CardDescription>
            {guardians.length} parent(s) / tuteur(s) lié(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {guardians.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Relation</TableHead>
                  <TableHead>Contact principal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guardians.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      {formatFullName(
                        link.guardian.firstName,
                        link.guardian.lastName
                      )}
                    </TableCell>
                    <TableCell>{link.guardian.email}</TableCell>
                    <TableCell>{link.guardian.phone || "-"}</TableCell>
                    <TableCell>
                      {link.relationship === "FATHER"
                        ? "Père"
                        : link.relationship === "MOTHER"
                        ? "Mère"
                        : link.relationship === "GUARDIAN"
                        ? "Tuteur"
                        : "Autre"}
                    </TableCell>
                    <TableCell>
                      {link.isPrimary ? (
                        <span className="text-green-600">Oui</span>
                      ) : (
                        <span className="text-gray-500">Non</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">Aucun parent/tuteur lié</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
