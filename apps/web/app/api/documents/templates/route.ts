import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { DocumentService } from "@/services/document.service";
import {
  createDocumentTemplateSchema,
  getDocumentTemplatesSchema,
} from "@school-admin/shared";

const documentService = new DocumentService();

/**
 * GET /api/documents/templates - Get document templates
 */
export async function GET(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validated = getDocumentTemplatesSchema.parse(params);

    const result = await documentService.getTemplates(
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: result.templates,
      pagination: result.pagination,
    });
  });
}

/**
 * POST /api/documents/templates - Create document template
 */
export async function POST(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = createDocumentTemplateSchema.parse(body);

    const template = await documentService.createTemplate(
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: template,
      message: "Template créé",
    });
  });
}
