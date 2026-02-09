import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { DocumentService } from "@/services/document.service";
import { generateDocumentSchema } from "@school-admin/shared";

const documentService = new DocumentService();

/**
 * POST /api/documents/templates/generate - Generate document from template
 */
export async function POST(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = generateDocumentSchema.parse(body);

    const result = await documentService.generateDocument(
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: "Document généré",
    });
  });
}
