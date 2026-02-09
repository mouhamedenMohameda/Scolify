"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@school-admin/ui";
import { Button } from "@school-admin/ui";
import { DataTable } from "@/components/data-table";
import { apiGet } from "@/lib/api-client";
import { formatDate } from "@school-admin/shared/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@school-admin/ui";
import { Label } from "@school-admin/ui";

export default function GradesPage() {
  const [grades, setGrades] = useState<any[]>([]);
  const [reportCards, setReportCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportCard, setSelectedReportCard] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"grades" | "reportCards">("grades");

  // Get current user's student ID (in real app, this would come from session)
  // For now, we'll fetch all students and let user select, or use first student
  const [studentId, setStudentId] = useState<string>("");

  useEffect(() => {
    // Fetch current user's students (if parent) or student info (if student)
    apiGet<{ students: any[] }>("/students").then((res) => {
      if (res.success && res.data && res.data.students?.length > 0) {
        // For now, use first student (in real app, get from session)
        setStudentId(res.data.students[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!studentId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [gradesRes, cardsRes] = await Promise.all([
          apiGet<{ data: any[]; pagination: any }>(`/grades?studentId=${studentId}`),
          apiGet<{ data: any[]; pagination: any }>(`/report-cards?studentId=${studentId}`),
        ]);

        if (gradesRes.success && gradesRes.data) {
          setGrades(gradesRes.data);
        }
        if (cardsRes.success && cardsRes.data) {
          setReportCards(cardsRes.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const handleViewReportCard = async (reportCard: any) => {
    const detailsRes = await apiGet(`/report-cards/${reportCard.id}`);
    if (detailsRes.success && detailsRes.data) {
      setSelectedReportCard(detailsRes.data);
    }
  };

  const gradeColumns = [
    {
      key: "assessment",
      label: "Évaluation",
      render: (record: any) => record.assessment?.name || "-",
    },
    {
      key: "subject",
      label: "Matière",
      render: (record: any) => record.assessment?.subject?.name || "-",
    },
    {
      key: "type",
      label: "Type",
      render: (record: any) => {
        const typeMap: Record<string, string> = {
          TEST: "Contrôle",
          HOMEWORK: "Devoir",
          PROJECT: "Projet",
          ORAL: "Oral",
        };
        return typeMap[record.assessment?.type] || record.assessment?.type || "-";
      },
    },
    {
      key: "date",
      label: "Date",
      render: (record: any) =>
        record.assessment?.date ? formatDate(record.assessment.date) : "-",
    },
    {
      key: "score",
      label: "Note",
      render: (record: any) => {
        const score = Number(record.score);
        const maxScore = record.assessment?.maxScore
          ? Number(record.assessment.maxScore)
          : 20;
        const percentage = (score / maxScore) * 20;
        const color =
          percentage >= 16
            ? "text-green-600"
            : percentage >= 12
            ? "text-blue-600"
            : percentage >= 10
            ? "text-yellow-600"
            : "text-red-600";
        return (
          <span className={color}>
            {score}/{maxScore} ({percentage.toFixed(1)}/20)
          </span>
        );
      },
    },
    {
      key: "comment",
      label: "Commentaire",
      render: (record: any) => record.comment || "-",
    },
  ];

  const reportCardColumns = [
    {
      key: "period",
      label: "Période",
      render: (record: any) => record.period?.name || "-",
    },
    {
      key: "overallAverage",
      label: "Moyenne générale",
      render: (record: any) =>
        record.overallAverage
          ? `${Number(record.overallAverage).toFixed(2)}/20`
          : "-",
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
        if (record.status === "PUBLISHED") {
          return <span className="text-green-600">Publié</span>;
        }
        return <span className="text-gray-600">En préparation</span>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (record: any) => (
        <Button
          size="sm"
          onClick={() => handleViewReportCard(record)}
          disabled={record.status !== "PUBLISHED"}
        >
          Voir bulletin
        </Button>
      ),
    },
  ];

  if (!studentId) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Chargement des informations...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mes Notes</h1>
        <p className="text-muted-foreground">
          Consultez vos notes et bulletins
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <Button
          variant={activeTab === "grades" ? "default" : "ghost"}
          onClick={() => setActiveTab("grades")}
        >
          Notes
        </Button>
        <Button
          variant={activeTab === "reportCards" ? "default" : "ghost"}
          onClick={() => setActiveTab("reportCards")}
        >
          Bulletins
        </Button>
      </div>

      {/* Grades Tab */}
      {activeTab === "grades" && (
        <Card>
          <CardHeader>
            <CardTitle>Mes Notes</CardTitle>
            <CardDescription>
              Liste de toutes vos notes par matière
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Chargement...</div>
            ) : (
              <DataTable columns={gradeColumns} data={grades} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Report Cards Tab */}
      {activeTab === "reportCards" && (
        <Card>
          <CardHeader>
            <CardTitle>Mes Bulletins</CardTitle>
            <CardDescription>
              Consultez vos bulletins scolaires publiés
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Chargement...</div>
            ) : (
              <DataTable columns={reportCardColumns} data={reportCards} />
            )}
          </CardContent>
        </Card>
      )}

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
