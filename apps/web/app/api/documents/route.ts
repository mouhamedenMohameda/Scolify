import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { DocumentService } from "@/services/document.service";
import {
  createDocumentSchema,
  getDocumentsSchema,
} from "@school-admin/shared";

const documentService = new DocumentService();

/**
 * GET /api/documents - Get documents
 */
export async function GET(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validated = getDocumentsSchema.parse(params);

    const result = await documentService.getMany(
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: result.documents,
      pagination: result.pagination,
    });
  });
}

/**
 * POST /api/documents - Create document
 */
export async function POST(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = createDocumentSchema.parse(body);

    const document = await documentService.create(
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: document,
      message: "Document créé",
    });
  });
}
