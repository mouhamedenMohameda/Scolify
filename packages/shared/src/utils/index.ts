/**
 * Shared utility functions
 */

/**
 * Format date to French format
 */
export function formatDate(date: Date | string, locale = "fr-FR"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
}

/**
 * Format date and time
 */
export function formatDateTime(
  date: Date | string,
  locale = "fr-FR"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency = "EUR",
  locale = "fr-FR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Generate matricule (school-specific student ID)
 */
export function generateMatricule(
  schoolCode: string,
  year: number,
  sequence: number
): string {
  return `${schoolCode}-${year}-${sequence.toString().padStart(4, "0")}`;
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize string (remove special characters for slugs, etc.)
 */
export function sanitizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Format full name
 */
export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}
