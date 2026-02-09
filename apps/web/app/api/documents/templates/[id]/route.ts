import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { DocumentService } from "@/services/document.service";
import { updateDocumentTemplateSchema } from "@school-admin/shared";

const documentService = new DocumentService();

/**
 * GET /api/documents/templates/[id] - Get template by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const template = await documentService.getTemplateById(
      params.id,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: template,
    });
  });
}

/**
 * PUT /api/documents/templates/[id] - Update template
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = updateDocumentTemplateSchema.parse({
      ...body,
      id: params.id,
    });

    const template = await documentService.updateTemplate(
      params.id,
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: template,
      message: "Template mis à jour",
    });
  });
}

/**
 * DELETE /api/documents/templates/[id] - Delete template
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    await documentService.deleteTemplate(params.id, session.tenantId);

    return NextResponse.json({
      success: true,
      message: "Template supprimé",
    });
  });
}
