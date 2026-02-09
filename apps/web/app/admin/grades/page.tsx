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
  DialogTrigger,
} from "@school-admin/ui";
import { Label, Select } from "@school-admin/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAssessmentSchema, bulkCreateGradesSchema, type CreateAssessmentInput } from "@school-admin/shared";

export default function GradesPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<Record<string, { score: number; comment?: string }>>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateAssessmentInput>({
    resolver: zodResolver(createAssessmentSchema),
  });

  const selectedClassId = watch("classId");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assessmentsRes, classesRes, subjectsRes, periodsRes] = await Promise.all([
        apiGet<{ data: any[]; pagination: any }>("/assessments"),
        apiGet<{ classes: any[] }>("/classes"),
        apiGet<{ subjects: any[] }>("/subjects"),
        apiGet<{ periods: any[] }>("/periods"),
      ]);

      if (assessmentsRes.success && assessmentsRes.data) {
        setAssessments(assessmentsRes.data);
      }
      if (classesRes.success && classesRes.data) {
        setClasses(classesRes.data.classes || []);
      }
      if (subjectsRes.success && subjectsRes.data) {
        setSubjects(subjectsRes.data.subjects || []);
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

  // Fetch students when class is selected for grade entry
  useEffect(() => {
    if (selectedAssessment?.classId) {
      apiGet<{ enrollments: any[] }>(
        `/enrollments?classId=${selectedAssessment.classId}&status=ACTIVE`
      ).then((res) => {
        if (res.success && res.data) {
          Promise.all(
            res.data.enrollments.map((e: any) =>
              apiGet(`/students/${e.studentId}`).then((r) => r.data?.student)
            )
          ).then((studentsData) => {
            setStudents(studentsData.filter(Boolean));
          });
        }
      });
    }
  }, [selectedAssessment]);

  const onSubmit = async (data: CreateAssessmentInput) => {
    try {
      const response = await apiPost("/assessments", data);
      if (response.success) {
        setDialogOpen(false);
        reset();
        fetchData();
      }
    } catch (error) {
      console.error("Error creating assessment:", error);
      alert("Erreur lors de la création de l'évaluation");
    }
  };

  const handleOpenGradeDialog = async (assessment: any) => {
    setSelectedAssessment(assessment);
    
    // Fetch existing grades
    const gradesRes = await apiGet<{ data: any[] }>(`/grades?assessmentId=${assessment.id}`);
    if (gradesRes.success && gradesRes.data) {
      const gradesMap: Record<string, { score: number; comment?: string }> = {};
      gradesRes.data.forEach((grade: any) => {
        gradesMap[grade.studentId] = {
          score: Number(grade.score),
          comment: grade.comment || "",
        };
      });
      setGrades(gradesMap);
    }

    setGradeDialogOpen(true);
  };

  const handleSaveGrades = async () => {
    if (!selectedAssessment || students.length === 0) {
      return;
    }

    try {
      const gradesArray = students.map((student) => {
        const gradeData = grades[student.id] || { score: 0 };
        return {
          studentId: student.id,
          score: gradeData.score,
          comment: gradeData.comment || "",
        };
      }).filter((g) => g.score > 0); // Only include grades with scores

      if (gradesArray.length === 0) {
        alert("Veuillez saisir au moins une note");
        return;
      }

      const response = await apiPost("/grades", {
        assessmentId: selectedAssessment.id,
        grades: gradesArray,
      });

      if (response.success) {
        setGradeDialogOpen(false);
        setSelectedAssessment(null);
        setGrades({});
        fetchData();
      }
    } catch (error) {
      console.error("Error saving grades:", error);
      alert("Erreur lors de l'enregistrement des notes");
    }
  };

  const handlePublish = async (assessment: any) => {
    try {
      const response = await apiPut(`/assessments/${assessment.id}/publish`, {
        publish: !assessment.isPublished,
      });

      if (response.success) {
        fetchData();
      }
    } catch (error) {
      console.error("Error publishing assessment:", error);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Nom",
      render: (record: any) => record.name,
    },
    {
      key: "class",
      label: "Classe",
      render: (record: any) => record.class?.name || "-",
    },
    {
      key: "subject",
      label: "Matière",
      render: (record: any) => record.subject?.name || "-",
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
        return typeMap[record.type] || record.type;
      },
    },
    {
      key: "date",
      label: "Date",
      render: (record: any) => formatDate(record.date),
    },
    {
      key: "maxScore",
      label: "Note max",
      render: (record: any) => `${record.maxScore}/20`,
    },
    {
      key: "grades",
      label: "Notes saisies",
      render: (record: any) => `${record._count?.grades || 0}`,
    },
    {
      key: "status",
      label: "Statut",
      render: (record: any) => (
        <span className={record.isPublished ? "text-green-600" : "text-gray-600"}>
          {record.isPublished ? "Publié" : "Brouillon"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (record: any) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleOpenGradeDialog(record)}>
            Saisir notes
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePublish(record)}
          >
            {record.isPublished ? "Dépublier" : "Publier"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notes & Évaluations</h1>
          <p className="text-muted-foreground">
            Gestion des évaluations et saisie des notes
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nouvelle évaluation</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une évaluation</DialogTitle>
              <DialogDescription>
                Créez une nouvelle évaluation pour une classe
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom de l'évaluation</Label>
                  <Input {...register("name")} placeholder="Ex: Contrôle Math Chapitre 3" />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="classId">Classe</Label>
                    <Select {...register("classId")}>
                      <option value="">Sélectionner une classe</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                    {errors.classId && (
                      <p className="text-red-500 text-sm">{errors.classId.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="subjectId">Matière</Label>
                    <Select {...register("subjectId")}>
                      <option value="">Sélectionner une matière</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </Select>
                    {errors.subjectId && (
                      <p className="text-red-500 text-sm">{errors.subjectId.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select {...register("type")}>
                      <option value="TEST">Contrôle</option>
                      <option value="HOMEWORK">Devoir</option>
                      <option value="PROJECT">Projet</option>
                      <option value="ORAL">Oral</option>
                    </Select>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxScore">Note maximale</Label>
                    <Input
                      type="number"
                      {...register("maxScore", { valueAsNumber: true })}
                      defaultValue={20}
                      step="0.5"
                    />
                    {errors.maxScore && (
                      <p className="text-red-500 text-sm">{errors.maxScore.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="coefficient">Coefficient</Label>
                    <Input
                      type="number"
                      {...register("coefficient", { valueAsNumber: true })}
                      defaultValue={1}
                      step="0.5"
                    />
                    {errors.coefficient && (
                      <p className="text-red-500 text-sm">{errors.coefficient.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input type="date" {...register("date")} />
                  {errors.date && (
                    <p className="text-red-500 text-sm">{errors.date.message}</p>
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
                <Button type="submit">Créer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des évaluations</CardTitle>
          <CardDescription>
            Créez des évaluations et saisissez les notes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <DataTable columns={columns} data={assessments} />
          )}
        </CardContent>
      </Card>

      {/* Grade Entry Dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Saisir les notes - {selectedAssessment?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedAssessment?.subject?.name} - {selectedAssessment?.class?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {students.length > 0 ? (
              <div className="space-y-2">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-4 p-3 border rounded"
                  >
                    <div className="flex-1">
                      <span className="font-medium">
                        {student.firstName} {student.lastName}
                      </span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        placeholder="Note"
                        value={grades[student.id]?.score || ""}
                        onChange={(e) => {
                          setGrades({
                            ...grades,
                            [student.id]: {
                              ...grades[student.id],
                              score: parseFloat(e.target.value) || 0,
                            },
                          });
                        }}
                        min={0}
                        max={selectedAssessment?.maxScore || 20}
                        step="0.5"
                        className="w-24"
                      />
                      <span>/ {selectedAssessment?.maxScore || 20}</span>
                      <Input
                        type="text"
                        placeholder="Commentaire (optionnel)"
                        value={grades[student.id]?.comment || ""}
                        onChange={(e) => {
                          setGrades({
                            ...grades,
                            [student.id]: {
                              ...grades[student.id],
                              comment: e.target.value,
                            },
                          });
                        }}
                        className="w-48"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>Chargement des élèves...</div>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setGradeDialogOpen(false);
                setSelectedAssessment(null);
                setGrades({});
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleSaveGrades}>Enregistrer les notes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
