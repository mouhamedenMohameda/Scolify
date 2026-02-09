import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { DocumentService } from "@/services/document.service";
import { updateDocumentSchema } from "@school-admin/shared";

const documentService = new DocumentService();

/**
 * GET /api/documents/[id] - Get document by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const document = await documentService.getById(
      params.id,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: document,
    });
  });
}

/**
 * PUT /api/documents/[id] - Update document
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = updateDocumentSchema.parse({
      ...body,
      id: params.id,
    });

    const document = await documentService.update(
      params.id,
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: document,
      message: "Document mis à jour",
    });
  });
}

/**
 * DELETE /api/documents/[id] - Delete document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    await documentService.delete(params.id, session.tenantId);

    return NextResponse.json({
      success: true,
      message: "Document supprimé",
    });
  });
}
