import { prisma } from "@school-admin/db";
import {
  CreateTeacherAssignmentInput,
  UpdateTeacherAssignmentInput,
  NotFoundError,
  ConflictError,
} from "@school-admin/shared";

/**
 * Teacher Assignment service
 */
export class TeacherAssignmentService {
  /**
   * Create teacher assignment
   */
  async create(input: CreateTeacherAssignmentInput, schoolId: string) {
    // Verify teacher, class, subject, and academic year belong to school
    const [teacher, classEntity, subject, academicYear] = await Promise.all([
      prisma.teacher.findUnique({
        where: { id: input.teacherId },
      }),
      prisma.class.findUnique({
        where: { id: input.classId },
      }),
      prisma.subject.findUnique({
        where: { id: input.subjectId },
      }),
      prisma.academicYear.findUnique({
        where: { id: input.academicYearId },
      }),
    ]);

    if (!teacher || teacher.schoolId !== schoolId) {
      throw new NotFoundError("Teacher", input.teacherId);
    }

    if (!classEntity || classEntity.schoolId !== schoolId) {
      throw new NotFoundError("Class", input.classId);
    }

    if (!subject || subject.schoolId !== schoolId) {
      throw new NotFoundError("Subject", input.subjectId);
    }

    if (!academicYear || academicYear.schoolId !== schoolId) {
      throw new NotFoundError("AcademicYear", input.academicYearId);
    }

    // Check if assignment already exists
    const existing = await prisma.teacherAssignment.findUnique({
      where: {
        teacherId_classId_subjectId_academicYearId: {
          teacherId: input.teacherId,
          classId: input.classId,
          subjectId: input.subjectId,
          academicYearId: input.academicYearId,
        },
      },
    });

    if (existing) {
      throw new ConflictError("Teacher assignment already exists");
    }

    const assignment = await prisma.teacherAssignment.create({
      data: input,
      include: {
        teacher: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        class: {
          include: {
            level: true,
          },
        },
        subject: true,
        academicYear: true,
      },
    });

    return assignment;
  }

  /**
   * Get assignment by ID
   */
  async getById(assignmentId: string, schoolId: string) {
    const assignment = await prisma.teacherAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
        class: {
          include: {
            level: true,
          },
        },
        subject: true,
        academicYear: true,
      },
    });

    if (!assignment || assignment.teacher.schoolId !== schoolId) {
      throw new NotFoundError("TeacherAssignment", assignmentId);
    }

    return assignment;
  }

  /**
   * List assignments
   */
  async list(
    schoolId: string,
    params: {
      teacherId?: string;
      classId?: string;
      subjectId?: string;
      academicYearId?: string;
    }
  ) {
    const where: any = {
      teacher: {
        schoolId,
      },
    };

    if (params.teacherId) {
      where.teacherId = params.teacherId;
    }

    if (params.classId) {
      where.classId = params.classId;
    }

    if (params.subjectId) {
      where.subjectId = params.subjectId;
    }

    if (params.academicYearId) {
      where.academicYearId = params.academicYearId;
    }

    const assignments = await prisma.teacherAssignment.findMany({
      where,
      include: {
        teacher: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        class: {
          include: {
            level: true,
          },
        },
        subject: true,
        academicYear: true,
      },
      orderBy: [
        { academicYear: { startDate: "desc" } },
        { class: { name: "asc" } },
        { subject: { name: "asc" } },
      ],
    });

    return assignments;
  }

  /**
   * Update assignment
   */
  async update(
    assignmentId: string,
    schoolId: string,
    input: UpdateTeacherAssignmentInput
  ) {
    await this.getById(assignmentId, schoolId);

    const updated = await prisma.teacherAssignment.update({
      where: { id: assignmentId },
      data: input,
      include: {
        teacher: true,
        class: true,
        subject: true,
        academicYear: true,
      },
    });

    return updated;
  }

  /**
   * Delete assignment
   */
  async delete(assignmentId: string, schoolId: string) {
    await this.getById(assignmentId, schoolId);

    await prisma.teacherAssignment.delete({
      where: { id: assignmentId },
    });

    return { success: true };
  }
}
