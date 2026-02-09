import { prisma } from "@school-admin/db";
import {
  ExportStudentsInput,
  ExportGradesInput,
  ExportAttendanceInput,
  NotFoundError,
} from "@school-admin/shared";

/**
 * Export service
 */
export class ExportService {
  /**
   * Export students to CSV/Excel
   */
  async exportStudents(input: ExportStudentsInput, schoolId: string) {
    const where: any = { schoolId };

    if (input.filters?.classId) {
      const classEntity = await prisma.class.findUnique({
        where: { id: input.filters.classId },
      });

      if (!classEntity || classEntity.schoolId !== schoolId) {
        throw new NotFoundError("Class", input.filters.classId);
      }

      // Get student IDs in this class
      const enrollments = await prisma.enrollment.findMany({
        where: {
          classId: input.filters.classId,
          status: "ACTIVE",
        },
        select: { studentId: true },
      });

      where.id = { in: enrollments.map((e) => e.studentId) };
    }

    if (input.filters?.levelId) {
      const level = await prisma.level.findUnique({
        where: { id: input.filters.levelId },
      });

      if (!level || level.schoolId !== schoolId) {
        throw new NotFoundError("Level", input.filters.levelId);
      }

      // Get classes of this level
      const classes = await prisma.class.findMany({
        where: {
          levelId: input.filters.levelId,
          schoolId,
        },
        select: { id: true },
      });

      const enrollments = await prisma.enrollment.findMany({
        where: {
          classId: { in: classes.map((c) => c.id) },
          status: "ACTIVE",
        },
        select: { studentId: true },
      });

      where.id = {
        ...(where.id ? { in: [where.id].flat().filter((id) => enrollments.some((e) => e.studentId === id)) } : {}),
        in: enrollments.map((e) => e.studentId),
      };
    }

    if (input.filters?.status) {
      where.status = input.filters.status;
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        enrollments: {
          where: { status: "ACTIVE" },
          include: {
            class: {
              include: {
                level: true,
              },
            },
          },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    // Format data for export
    const data = students.map((student) => ({
      Matricule: student.matricule,
      Prénom: student.firstName,
      Nom: student.lastName,
      "Date de naissance": student.dateOfBirth.toLocaleDateString("fr-FR"),
      Classe: student.enrollments[0]?.class?.name || "",
      Niveau: student.enrollments[0]?.class?.level?.name || "",
      Statut: student.status,
      Email: student.email || "",
      Téléphone: student.phone || "",
      Adresse: student.address || "",
      Ville: student.city || "",
    }));

    return {
      data,
      format: input.format,
      filename: `eleves_${new Date().toISOString().split("T")[0]}.${input.format.toLowerCase()}`,
    };
  }

  /**
   * Export grades to CSV/Excel
   */
  async exportGrades(input: ExportGradesInput, schoolId: string) {
    const where: any = {};

    // Filter by student
    if (input.filters?.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: input.filters.studentId },
      });

      if (!student || student.schoolId !== schoolId) {
        throw new NotFoundError("Student", input.filters.studentId);
      }

      where.studentId = input.filters.studentId;
    }

    // Filter by class (via assessment)
    if (input.filters?.classId) {
      const classEntity = await prisma.class.findUnique({
        where: { id: input.filters.classId },
      });

      if (!classEntity || classEntity.schoolId !== schoolId) {
        throw new NotFoundError("Class", input.filters.classId);
      }

      where.assessment = {
        classId: input.filters.classId,
      };
    }

    // Filter by subject (via assessment)
    if (input.filters?.subjectId) {
      const subject = await prisma.subject.findUnique({
        where: { id: input.filters.subjectId },
      });

      if (!subject || subject.schoolId !== schoolId) {
        throw new NotFoundError("Subject", input.filters.subjectId);
      }

      where.assessment = {
        ...where.assessment,
        subjectId: input.filters.subjectId,
      };
    }

    // Filter by period (via assessment)
    if (input.filters?.periodId) {
      where.assessment = {
        ...where.assessment,
        periodId: input.filters.periodId,
      };
    }

    // Ensure we only get grades for students in this school
    const students = await prisma.student.findMany({
      where: { schoolId },
      select: { id: true },
    });

    where.studentId = {
      in: students.map((s) => s.id),
    };

    const grades = await prisma.grade.findMany({
      where,
      include: {
        student: {
          select: {
            matricule: true,
            firstName: true,
            lastName: true,
          },
        },
        assessment: {
          include: {
            subject: {
              select: {
                name: true,
                code: true,
              },
            },
            class: {
              select: {
                name: true,
              },
            },
            period: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format data for export
    const data = grades.map((grade) => {
      const score = Number(grade.score);
      const maxScore = Number(grade.assessment.maxScore);
      const normalizedScore = (score / maxScore) * 20;

      return {
        Matricule: grade.student.matricule,
        Élève: `${grade.student.firstName} ${grade.student.lastName}`,
        Classe: grade.assessment.class.name,
        Matière: grade.assessment.subject.name,
        "Code matière": grade.assessment.subject.code,
        Évaluation: grade.assessment.name,
        Type: grade.assessment.type,
        Note: `${score}/${maxScore}`,
        "Note /20": normalizedScore.toFixed(2),
        Coefficient: Number(grade.assessment.coefficient),
        Période: grade.assessment.period.name,
        Date: grade.assessment.date.toLocaleDateString("fr-FR"),
        Commentaire: grade.comment || "",
      };
    });

    return {
      data,
      format: input.format,
      filename: `notes_${new Date().toISOString().split("T")[0]}.${input.format.toLowerCase()}`,
    };
  }

  /**
   * Export attendance to CSV/Excel
   */
  async exportAttendance(input: ExportAttendanceInput, schoolId: string) {
    const where: any = {};

    // Filter by student
    if (input.filters?.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: input.filters.studentId },
      });

      if (!student || student.schoolId !== schoolId) {
        throw new NotFoundError("Student", input.filters.studentId);
      }

      where.studentId = input.filters.studentId;
    }

    // Filter by class
    if (input.filters?.classId) {
      const classEntity = await prisma.class.findUnique({
        where: { id: input.filters.classId },
      });

      if (!classEntity || classEntity.schoolId !== schoolId) {
        throw new NotFoundError("Class", input.filters.classId);
      }

      const enrollments = await prisma.enrollment.findMany({
        where: {
          classId: input.filters.classId,
          status: "ACTIVE",
        },
        select: { studentId: true },
      });

      where.studentId = {
        in: enrollments.map((e) => e.studentId),
      };
    }

    // Filter by date range
    if (input.filters?.dateFrom || input.filters?.dateTo) {
      where.date = {};
      if (input.filters.dateFrom) {
        where.date.gte = input.filters.dateFrom;
      }
      if (input.filters.dateTo) {
        where.date.lte = input.filters.dateTo;
      }
    }

    // Ensure we only get records for students in this school
    const students = await prisma.student.findMany({
      where: { schoolId },
      select: { id: true },
    });

    where.studentId = {
      ...(where.studentId ? { in: [where.studentId].flat() } : {}),
      in: students.map((s) => s.id),
    };

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: {
        student: {
          select: {
            matricule: true,
            firstName: true,
            lastName: true,
          },
        },
        timetableSlot: {
          include: {
            subject: {
              select: {
                name: true,
              },
            },
            class: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { date: "desc" },
    });

    // Format data for export
    const data = records.map((record) => ({
      Matricule: record.student.matricule,
      Élève: `${record.student.firstName} ${record.student.lastName}`,
      Date: record.date.toLocaleDateString("fr-FR"),
      Statut: record.status,
      Classe: record.timetableSlot?.class?.name || "",
      Matière: record.timetableSlot?.subject?.name || "",
      "Retard (min)": record.minutesLate || 0,
      Justifié: record.isJustified ? "Oui" : "Non",
      Raison: record.reason || "",
    }));

    return {
      data,
      format: input.format,
      filename: `presences_${new Date().toISOString().split("T")[0]}.${input.format.toLowerCase()}`,
    };
  }
}
