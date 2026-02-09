/**
 * Custom error classes for the application
 */

export class DomainError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "DomainError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public field?: string,
    public details?: Record<string, unknown>
  ) {
    super(message, "VALIDATION_ERROR", 422);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id ${id} not found`
      : `${resource} not found`;
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "Permission denied") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "UnauthorizedError";
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
    this.name = "ConflictError";
  }
}
