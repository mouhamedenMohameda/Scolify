"use client";

import { useEffect, useState } from "react";
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
import { bulkCreateAttendanceSchema, type BulkCreateAttendanceInput } from "@school-admin/shared";

export default function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [timetableSlots, setTimetableSlots] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<BulkCreateAttendanceInput>({
    resolver: zodResolver(bulkCreateAttendanceSchema),
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsRes, slotsRes] = await Promise.all([
        apiGet<{ data: any[]; pagination: any }>("/attendance"),
        apiGet<{ timetables: any[] }>("/timetables/active"),
      ]);

      if (recordsRes.success && recordsRes.data) {
        setAttendanceRecords(recordsRes.data);
      }

      if (slotsRes.success && slotsRes.data) {
        // Get slots from active timetable
        const activeTimetable = slotsRes.data.timetables?.[0];
        if (activeTimetable) {
          const slotsRes2 = await apiGet<{ slots: any[] }>(
            `/timetables/${activeTimetable.id}/slots`
          );
          if (slotsRes2.success && slotsRes2.data) {
            setTimetableSlots(slotsRes2.data.slots || []);
          }
        }
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

  // Fetch students when slot is selected
  useEffect(() => {
    if (selectedSlot) {
      const slot = timetableSlots.find((s) => s.id === selectedSlot);
      if (slot?.classId) {
        apiGet<{ enrollments: any[] }>(
          `/enrollments?classId=${slot.classId}&status=ACTIVE`
        ).then((res) => {
          if (res.success && res.data) {
            // Get student details
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
    } else {
      setStudents([]);
    }
  }, [selectedSlot, timetableSlots]);

  const onSubmit = async () => {
    if (!selectedSlot || students.length === 0) {
      return;
    }

    try {
      // Get status for each student from form
      const records = students.map((student) => {
        const statusInput = document.querySelector(
          `input[name="status_${student.id}"]`
        ) as HTMLSelectElement;
        return {
          studentId: student.id,
          status: (statusInput?.value || "PRESENT") as "PRESENT" | "ABSENT" | "LATE" | "EXCUSED",
        };
      });

      const response = await apiPost("/attendance", {
        timetableSlotId: selectedSlot,
        date: selectedDate,
        records,
      });

      if (response.success) {
        setDialogOpen(false);
        reset();
        setSelectedSlot("");
        setStudents([]);
        fetchData();
      }
    } catch (error) {
      console.error("Error creating attendance:", error);
      alert("Erreur lors de l'enregistrement des présences");
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
      key: "date",
      label: "Date",
      render: (record: any) => formatDate(record.date),
    },
    {
      key: "status",
      label: "Statut",
      render: (record: any) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          PRESENT: { label: "Présent", color: "text-green-600" },
          ABSENT: { label: "Absent", color: "text-red-600" },
          LATE: { label: "Retard", color: "text-yellow-600" },
          EXCUSED: { label: "Excusé", color: "text-blue-600" },
        };
        const status = statusMap[record.status] || {
          label: record.status,
          color: "text-gray-600",
        };
        return <span className={status.color}>{status.label}</span>;
      },
    },
    {
      key: "subject",
      label: "Matière",
      render: (record: any) => record.timetableSlot?.subject?.name || "-",
    },
    {
      key: "isJustified",
      label: "Justifié",
      render: (record: any) => (record.isJustified ? "Oui" : "Non"),
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Présences</h1>
          <p className="text-muted-foreground">
            Gestion des présences et absences
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Marquer les présences</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Marquer les présences</DialogTitle>
              <DialogDescription>
                Sélectionnez un créneau et marquez les présences pour ce cours
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="timetableSlotId">Créneau</Label>
                  <Select
                    value={selectedSlot}
                    onValueChange={setSelectedSlot}
                  >
                    <option value="">Sélectionner un créneau</option>
                    {timetableSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.subject?.name} - {slot.class?.name} -{" "}
                        {slot.dayOfWeek} {slot.startTime?.substring(0, 5)}-
                        {slot.endTime?.substring(0, 5)}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                  />
                </div>

                {students.length > 0 && (
                  <div>
                    <Label>Élèves</Label>
                    <div className="space-y-2 mt-2 max-h-96 overflow-y-auto">
                      {students.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <span>
                            {student.firstName} {student.lastName}
                          </span>
                          <Select
                            name={`status_${student.id}`}
                            defaultValue="PRESENT"
                          >
                            <option value="PRESENT">Présent</option>
                            <option value="ABSENT">Absent</option>
                            <option value="LATE">Retard</option>
                            <option value="EXCUSED">Excusé</option>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={!selectedSlot || students.length === 0}>
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des présences</CardTitle>
          <CardDescription>
            Liste des enregistrements de présence
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <DataTable columns={columns} data={attendanceRecords} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
