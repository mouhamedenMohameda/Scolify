import { prisma } from "@school-admin/db";
import {
  CreateDocumentInput,
  UpdateDocumentInput,
  GetDocumentsInput,
  CreateDocumentTemplateInput,
  UpdateDocumentTemplateInput,
  GenerateDocumentInput,
  GetDocumentTemplatesInput,
  NotFoundError,
} from "@school-admin/shared";

/**
 * Document service
 */
export class DocumentService {
  /**
   * Create document
   */
  async create(input: CreateDocumentInput, schoolId: string) {
    // Verify student if provided
    if (input.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: input.studentId },
      });

      if (!student || student.schoolId !== schoolId) {
        throw new NotFoundError("Student", input.studentId);
      }
    }

    const document = await prisma.document.create({
      data: {
        ...input,
        schoolId,
      },
      include: {
        student: {
          select: {
            id: true,
            matricule: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return document;
  }

  /**
   * Update document
   */
  async update(documentId: string, input: Partial<UpdateDocumentInput>, schoolId: string) {
    const existing = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!existing || existing.schoolId !== schoolId) {
      throw new NotFoundError("Document", documentId);
    }

    const document = await prisma.document.update({
      where: { id: documentId },
      data: input,
      include: {
        student: {
          select: {
            id: true,
            matricule: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return document;
  }

  /**
   * Get document by ID
   */
  async getById(documentId: string, schoolId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        student: {
          select: {
            id: true,
            matricule: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!document || document.schoolId !== schoolId) {
      throw new NotFoundError("Document", documentId);
    }

    return document;
  }

  /**
   * Get documents with filters
   */
  async getMany(input: GetDocumentsInput, schoolId: string) {
    const where: any = { schoolId };

    if (input.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: input.studentId },
      });

      if (!student || student.schoolId !== schoolId) {
        throw new NotFoundError("Student", input.studentId);
      }

      where.studentId = input.studentId;
    }

    if (input.type) {
      where.type = input.type;
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              matricule: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.document.count({ where }),
    ]);

    return {
      documents,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit),
      },
    };
  }

  /**
   * Delete document
   */
  async delete(documentId: string, schoolId: string) {
    const document = await this.getById(documentId, schoolId);

    // TODO: Delete file from S3
    // await this.deleteFileFromS3(document.fileUrl);

    await prisma.document.delete({
      where: { id: documentId },
    });

    return { success: true };
  }

  /**
   * Create document template
   */
  async createTemplate(input: CreateDocumentTemplateInput, schoolId: string) {
    const template = await prisma.documentTemplate.create({
      data: {
        ...input,
        schoolId,
      },
    });

    return template;
  }

  /**
   * Update document template
   */
  async updateTemplate(
    templateId: string,
    input: Partial<UpdateDocumentTemplateInput>,
    schoolId: string
  ) {
    const existing = await prisma.documentTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existing || existing.schoolId !== schoolId) {
      throw new NotFoundError("DocumentTemplate", templateId);
    }

    const template = await prisma.documentTemplate.update({
      where: { id: templateId },
      data: input,
    });

    return template;
  }

  /**
   * Get template by ID
   */
  async getTemplateById(templateId: string, schoolId: string) {
    const template = await prisma.documentTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template || template.schoolId !== schoolId) {
      throw new NotFoundError("DocumentTemplate", templateId);
    }

    return template;
  }

  /**
   * Get templates with filters
   */
  async getTemplates(input: GetDocumentTemplatesInput, schoolId: string) {
    const where: any = { schoolId };

    if (input.type) {
      where.type = input.type;
    }

    const [templates, total] = await Promise.all([
      prisma.documentTemplate.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.documentTemplate.count({ where }),
    ]);

    return {
      templates,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit),
      },
    };
  }

  /**
   * Generate document from template
   */
  async generateDocument(input: GenerateDocumentInput, schoolId: string) {
    const template = await this.getTemplateById(input.templateId, schoolId);

    // Get student data if provided
    let studentData: any = null;
    if (input.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: input.studentId },
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
      });

      if (!student || student.schoolId !== schoolId) {
        throw new NotFoundError("Student", input.studentId);
      }

      studentData = {
        firstName: student.firstName,
        lastName: student.lastName,
        matricule: student.matricule,
        dateOfBirth: student.dateOfBirth,
        class: student.enrollments[0]?.class?.name,
        level: student.enrollments[0]?.class?.level?.name,
      };
    }

    // Replace template variables
    let content = template.content;
    const variables = {
      ...(template.variables as Record<string, any> || {}),
      ...(input.variables || {}),
      ...(studentData || {}),
      date: new Date().toLocaleDateString("fr-FR"),
      schoolName: "École", // TODO: Get from school
    };

    // Simple variable replacement: {{variableName}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      content = content.replace(regex, String(value));
    });

    // TODO: Generate PDF from HTML content using Puppeteer
    // For now, return the processed content
    return {
      content,
      template,
      variables,
    };
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId: string, schoolId: string) {
    const template = await this.getTemplateById(templateId, schoolId);

    await prisma.documentTemplate.delete({
      where: { id: templateId },
    });

    return { success: true };
  }
}
