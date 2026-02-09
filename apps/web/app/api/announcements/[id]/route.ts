import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { AnnouncementService } from "@/services/announcement.service";
import { updateAnnouncementSchema } from "@school-admin/shared";

const announcementService = new AnnouncementService();

/**
 * GET /api/announcements/[id] - Get announcement by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const announcement = await announcementService.getById(
      params.id,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: announcement,
    });
  });
}

/**
 * PUT /api/announcements/[id] - Update announcement
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = updateAnnouncementSchema.parse({
      ...body,
      id: params.id,
    });

    const announcement = await announcementService.update(
      params.id,
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: announcement,
      message: "Annonce mise à jour",
    });
  });
}

/**
 * DELETE /api/announcements/[id] - Delete announcement
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async (session) => {
    await announcementService.delete(params.id, session.tenantId);

    return NextResponse.json({
      success: true,
      message: "Annonce supprimée",
    });
  });
}
