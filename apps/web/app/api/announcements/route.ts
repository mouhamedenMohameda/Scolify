import { NextRequest, NextResponse } from "next/server";
import { handleApiRoute } from "@/lib/api-helpers";
import { AnnouncementService } from "@/services/announcement.service";
import {
  createAnnouncementSchema,
  getAnnouncementsSchema,
} from "@school-admin/shared";

const announcementService = new AnnouncementService();

/**
 * GET /api/announcements - Get announcements
 */
export async function GET(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validated = getAnnouncementsSchema.parse(params);

    const result = await announcementService.getMany(
      validated,
      session.tenantId,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: result.announcements,
      pagination: result.pagination,
    });
  });
}

/**
 * POST /api/announcements - Create announcement
 */
export async function POST(request: NextRequest) {
  return handleApiRoute(request, async (session) => {
    const body = await request.json();
    const validated = createAnnouncementSchema.parse(body);

    const announcement = await announcementService.create(
      validated,
      session.tenantId
    );

    return NextResponse.json({
      success: true,
      data: announcement,
      message: "Annonce créée",
    });
  });
}
