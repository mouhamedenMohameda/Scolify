"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@school-admin/ui";
import { Button, Input } from "@school-admin/ui";
import { DataTable } from "@/components/data-table";
import { apiGet, apiPost, apiPut } from "@/lib/api-client";
import { formatDate } from "@school-admin/shared/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@school-admin/ui";
import { Label, Select } from "@school-admin/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateReportCardSchema, type GenerateReportCardInput } from "@school-admin/shared";

export default function ReportCardsPage() {
  const [reportCards, setReportCards] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReportCard, setSelectedReportCard] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GenerateReportCardInput>({
    resolver: zodResolver(generateReportCardSchema),
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cardsRes, studentsRes, periodsRes] = await Promise.all([
        apiGet<{ data: any[]; pagination: any }>("/report-cards"),
        apiGet<{ students: any[] }>("/students"),
        apiGet<{ periods: any[] }>("/periods"),
      ]);

      if (cardsRes.success && cardsRes.data) {
        setReportCards(cardsRes.data);
      }
      if (studentsRes.success && studentsRes.data) {
        setStudents(studentsRes.data.students || []);
      }
      if (periodsRes.success && periodsRes.data) {
        setPeriods(periodsRes.data.periods || []);
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

  const onSubmit = async (data: GenerateReportCardInput) => {
    try {
      const response = await apiPost("/report-cards/generate", data);
      if (response.success) {
        setDialogOpen(false);
        reset();
        fetchData();
      }
    } catch (error) {
      console.error("Error generating report card:", error);
      alert("Erreur lors de la génération du bulletin");
    }
  };

  const handlePublish = async (reportCard: any) => {
    try {
      const response = await apiPut(`/report-cards/${reportCard.id}/publish`, {
        publish: reportCard.status !== "PUBLISHED",
      });

      if (response.success) {
        fetchData();
      }
    } catch (error) {
      console.error("Error publishing report card:", error);
    }
  };

  const handleViewDetails = async (reportCard: any) => {
    const detailsRes = await apiGet(`/report-cards/${reportCard.id}`);
    if (detailsRes.success && detailsRes.data) {
      setSelectedReportCard(detailsRes.data);
    }
  };

  const columns = [
    {
      key: "student",
      label: "Élève",
      render: (record: any) =>
        `${record.student?.firstName || ""} ${record.student?.lastName || ""}`,
    },
    {
      key: "period",
      label: "Période",
      render: (record: any) => record.period?.name || "-",
    },
    {
      key: "overallAverage",
      label: "Moyenne générale",
      render: (record: any) =>
        record.overallAverage ? `${Number(record.overallAverage).toFixed(2)}/20` : "-",
    },
    {
      key: "mention",
      label: "Mention",
      render: (record: any) => {
        const mentionMap: Record<string, string> = {
          PASSABLE: "Passable",
          ASSEZ_BIEN: "Assez bien",
          BIEN: "Bien",
          TRES_BIEN: "Très bien",
        };
        return mentionMap[record.mention] || "-";
      },
    },
    {
      key: "status",
      label: "Statut",
      render: (record: any) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          DRAFT: { label: "Brouillon", color: "text-gray-600" },
          GENERATED: { label: "Généré", color: "text-blue-600" },
          PUBLISHED: { label: "Publié", color: "text-green-600" },
        };
        const status = statusMap[record.status] || {
          label: record.status,
          color: "text-gray-600",
        };
        return <span className={status.color}>{status.label}</span>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (record: any) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleViewDetails(record)}>
            Voir détails
          </Button>
          {record.status === "GENERATED" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePublish(record)}
            >
              {record.status === "PUBLISHED" ? "Dépublier" : "Publier"}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Bulletins</h1>
          <p className="text-muted-foreground">
            Génération et gestion des bulletins scolaires
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Générer un bulletin</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Générer un bulletin</DialogTitle>
              <DialogDescription>
                Générer le bulletin pour un élève et une période
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="studentId">Élève</Label>
                  <Select {...register("studentId")}>
                    <option value="">Sélectionner un élève</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} ({s.matricule})
                      </option>
                    ))}
                  </Select>
                  {errors.studentId && (
                    <p className="text-red-500 text-sm">{errors.studentId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="periodId">Période</Label>
                  <Select {...register("periodId")}>
                    <option value="">Sélectionner une période</option>
                    {periods.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Select>
                  {errors.periodId && (
                    <p className="text-red-500 text-sm">{errors.periodId.message}</p>
                  )}
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
                <Button type="submit">Générer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des bulletins</CardTitle>
          <CardDescription>
            Générez et publiez les bulletins scolaires
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <DataTable columns={columns} data={reportCards} />
          )}
        </CardContent>
      </Card>

      {/* Report Card Details Dialog */}
      {selectedReportCard && (
        <Dialog open={!!selectedReportCard} onOpenChange={() => setSelectedReportCard(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Bulletin - {selectedReportCard.student?.firstName}{" "}
                {selectedReportCard.student?.lastName}
              </DialogTitle>
              <DialogDescription>
                {selectedReportCard.period?.name} -{" "}
                {selectedReportCard.academicYear?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Moyenne générale</Label>
                  <p className="text-2xl font-bold">
                    {selectedReportCard.overallAverage
                      ? `${Number(selectedReportCard.overallAverage).toFixed(2)}/20`
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label>Mention</Label>
                  <p className="text-lg">
                    {selectedReportCard.mention
                      ? {
                          PASSABLE: "Passable",
                          ASSEZ_BIEN: "Assez bien",
                          BIEN: "Bien",
                          TRES_BIEN: "Très bien",
                        }[selectedReportCard.mention] || selectedReportCard.mention
                      : "-"}
                  </p>
                </div>
              </div>

              {selectedReportCard.comments && selectedReportCard.comments.length > 0 && (
                <div>
                  <Label>Commentaires par matière</Label>
                  <div className="space-y-2 mt-2">
                    {selectedReportCard.comments.map((comment: any) => (
                      <div key={comment.id} className="p-3 border rounded">
                        <div className="font-medium">{comment.subject?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {comment.teacher?.user?.firstName}{" "}
                          {comment.teacher?.user?.lastName}
                        </div>
                        <div className="mt-1">{comment.comment}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReportCard.pdfUrl && (
                <div>
                  <Label>PDF</Label>
                  <a
                    href={selectedReportCard.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Télécharger le bulletin PDF
                  </a>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setSelectedReportCard(null)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
