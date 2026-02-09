"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@school-admin/ui";
import { Button, Select, Label } from "@school-admin/ui";
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
import { Input } from "@school-admin/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTimetableSlotSchema, type CreateTimetableSlotInput } from "@school-admin/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@school-admin/ui";

const DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<any>(null);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateTimetableSlotInput>({
    resolver: zodResolver(createTimetableSlotSchema),
  });

  const selectedClassId = watch("classId");

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedAcademicYearId) {
      fetchTimetable();
      fetchClasses();
      fetchSubjects();
      fetchTeachers();
      fetchRooms();
    }
  }, [selectedAcademicYearId]);

  const fetchAcademicYears = async () => {
    const response = await apiGet<{ academicYears: any[] }>("/academic-years");
    if (response.success && response.data) {
      setAcademicYears(response.data.academicYears);
      const activeYear = response.data.academicYears.find((y) => y.isActive);
      if (activeYear) {
        setSelectedAcademicYearId(activeYear.id);
      }
    }
  };

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await apiGet<{ timetable: any }>(
        `/timetables/active?academicYearId=${selectedAcademicYearId}`
      );
      if (response.success && response.data?.timetable) {
        setTimetable(response.data.timetable);
      } else {
        // Create timetable if doesn't exist
        const createResponse = await apiPost("/timetables", {
          academicYearId: selectedAcademicYearId,
          name: `EDT ${selectedAcademicYearId}`,
          isActive: true,
        });
        if (createResponse.success && createResponse.data) {
          setTimetable(createResponse.data.timetable);
        }
      }
    } catch (error) {
      console.error("Error fetching timetable:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    const response = await apiGet<{ classes: any[] }>(
      `/classes?academicYearId=${selectedAcademicYearId}`
    );
    if (response.success && response.data) {
      setClasses(response.data.classes);
    }
  };

  const fetchSubjects = async () => {
    const response = await apiGet<{ subjects: any[] }>("/subjects");
    if (response.success && response.data) {
      setSubjects(response.data.subjects);
    }
  };

  const fetchTeachers = async () => {
    const response = await apiGet<{ teachers: any[]; pagination: any }>("/teachers");
    if (response.success && response.data) {
      setTeachers(response.data.teachers);
    }
  };

  const fetchRooms = async () => {
    const response = await apiGet<{ rooms: any[]; pagination: any }>("/rooms");
    if (response.success && response.data) {
      setRooms(response.data.rooms);
    }
  };

  const onSubmit = async (data: CreateTimetableSlotInput) => {
    if (!timetable) {
      alert("Veuillez sélectionner une année scolaire");
      return;
    }

    try {
      const response = await apiPost(`/timetables/${timetable.id}/slots`, {
        ...data,
        timetableId: timetable.id,
      });
      if (response.success) {
        setDialogOpen(false);
        reset();
        fetchTimetable();
      } else {
        alert(`Erreur: ${response.error}`);
      }
    } catch (error) {
      console.error("Error creating slot:", error);
      alert("Erreur lors de la création du créneau");
    }
  };

  // Group slots by day
  const slotsByDay: Record<number, any[]> = {};
  if (timetable?.slots) {
    timetable.slots.forEach((slot: any) => {
      if (!slotsByDay[slot.dayOfWeek]) {
        slotsByDay[slot.dayOfWeek] = [];
      }
      slotsByDay[slot.dayOfWeek].push(slot);
    });
    // Sort by time
    Object.keys(slotsByDay).forEach((day) => {
      slotsByDay[parseInt(day)].sort((a, b) => {
        const aTime = a.startTime.split(":").map(Number);
        const bTime = b.startTime.split(":").map(Number);
        return aTime[0] * 60 + aTime[1] - (bTime[0] * 60 + bTime[1]);
      });
    });
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Emploi du Temps</h1>
          <p className="text-muted-foreground">
            Gérez l'emploi du temps de votre établissement
          </p>
        </div>
        <div className="flex gap-4">
          <div>
            <Label htmlFor="academicYear">Année scolaire</Label>
            <Select
              id="academicYear"
              value={selectedAcademicYearId}
              onChange={(e) => setSelectedAcademicYearId(e.target.value)}
            >
              <option value="">Sélectionner...</option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </Select>
          </div>
          {timetable && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>Nouveau créneau</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Créer un créneau</DialogTitle>
                  <DialogDescription>
                    Ajoutez un nouveau créneau à l'emploi du temps
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="classId">Classe *</Label>
                    <Select id="classId" {...register("classId")}>
                      <option value="">Sélectionner...</option>
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

                  <div className="space-y-2">
                    <Label htmlFor="subjectId">Matière *</Label>
                    <Select id="subjectId" {...register("subjectId")}>
                      <option value="">Sélectionner...</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </option>
                      ))}
                    </Select>
                    {errors.subjectId && (
                      <p className="text-sm text-red-600">{errors.subjectId.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teacherId">Professeur *</Label>
                    <Select id="teacherId" {...register("teacherId")}>
                      <option value="">Sélectionner...</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.user.firstName} {teacher.user.lastName}
                        </option>
                      ))}
                    </Select>
                    {errors.teacherId && (
                      <p className="text-sm text-red-600">{errors.teacherId.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roomId">Salle</Label>
                    <Select id="roomId" {...register("roomId")}>
                      <option value="">Aucune</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dayOfWeek">Jour *</Label>
                      <Select id="dayOfWeek" {...register("dayOfWeek", { valueAsNumber: true })}>
                        {DAYS.map((day, index) => (
                          <option key={index} value={index}>
                            {day}
                          </option>
                        ))}
                      </Select>
                      {errors.dayOfWeek && (
                        <p className="text-sm text-red-600">{errors.dayOfWeek.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startTime">Heure début *</Label>
                      <Input id="startTime" type="time" {...register("startTime")} />
                      {errors.startTime && (
                        <p className="text-sm text-red-600">{errors.startTime.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime">Heure fin *</Label>
                      <Input id="endTime" type="time" {...register("endTime")} />
                      {errors.endTime && (
                        <p className="text-sm text-red-600">{errors.endTime.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weekPattern">Pattern semaine</Label>
                    <Select id="weekPattern" {...register("weekPattern")}>
                      <option value="ALL">Toutes les semaines</option>
                      <option value="A">Semaine A</option>
                      <option value="B">Semaine B</option>
                    </Select>
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
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      ) : timetable ? (
        <Card>
          <CardHeader>
            <CardTitle>Emploi du Temps - {timetable.academicYear?.name}</CardTitle>
            <CardDescription>
              {timetable.slots?.length || 0} créneau(x) configuré(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Heure</TableHead>
                    {DAYS.slice(0, 5).map((day, index) => (
                      <TableHead key={index}>{day}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Generate time slots from 8:00 to 18:00 */}
                  {Array.from({ length: 20 }, (_, i) => {
                    const hour = 8 + Math.floor(i / 2);
                    const minute = (i % 2) * 30;
                    const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
                    
                    return (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{timeStr}</TableCell>
                        {DAYS.slice(0, 5).map((_, dayIndex) => {
                          const slot = slotsByDay[dayIndex]?.find((s) => {
                            const slotStart = s.startTime.split(":").map(Number);
                            const slotEnd = s.endTime.split(":").map(Number);
                            const slotStartMinutes = slotStart[0] * 60 + slotStart[1];
                            const slotEndMinutes = slotEnd[0] * 60 + slotEnd[1];
                            const currentMinutes = hour * 60 + minute;
                            return currentMinutes >= slotStartMinutes && currentMinutes < slotEndMinutes;
                          });
                          
                          return (
                            <TableCell key={dayIndex}>
                              {slot ? (
                                <div className="rounded bg-blue-100 p-2 text-xs">
                                  <div className="font-medium">{slot.subject?.name}</div>
                                  <div className="text-gray-600">{slot.class?.name}</div>
                                  <div className="text-gray-500">
                                    {slot.teacher?.user?.firstName} {slot.teacher?.user?.lastName}
                                  </div>
                                  {slot.room && (
                                    <div className="text-gray-500">{slot.room.name}</div>
                                  )}
                                </div>
                              ) : null}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Sélectionnez une année scolaire pour voir l'emploi du temps
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
