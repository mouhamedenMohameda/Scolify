import { NextResponse } from "next/server";
import {
  DomainError,
  ValidationError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  ConflictError,
} from "@school-admin/shared";

/**
 * Handle API errors and return appropriate response
 */
export function handleApiError(error: unknown): NextResponse {
  // Zod validation errors
  if (error && typeof error === "object" && "issues" in error) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: error,
      },
      { status: 422 }
    );
  }

  // Domain errors
  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        field: error.field,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ConflictError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // Unknown errors
  console.error("Unknown error:", error);

  return NextResponse.json(
    {
      success: false,
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    },
    { status: 500 }
  );
}
