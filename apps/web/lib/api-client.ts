/**
 * API client utilities
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Fetch API with error handling
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  // If endpoint already starts with /api/, use it as-is to avoid double prefix
  // Otherwise, prepend API_BASE_URL
  const url = endpoint.startsWith("/api/") 
    ? endpoint 
    : endpoint.startsWith("/")
    ? `${API_BASE_URL}${endpoint}`
    : `${API_BASE_URL}/${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include", // Include cookies
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle 401 - redirect to login
      if (response.status === 401) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      throw new Error(data.error || "API request failed");
    }

    // Ensure the response has the expected format
    if (data && typeof data === "object" && "success" in data) {
      return data as ApiResponse<T>;
    }

    // If the response doesn't have success field, wrap it
    return {
      success: true,
      data: data as T,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * GET request
 */
export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, string | number>
): Promise<ApiResponse<T>> {
  // Remove /api/ prefix if present, and ensure endpoint starts with /
  let cleanEndpoint = endpoint.startsWith("/api/") 
    ? endpoint.substring(4) // Remove "/api" prefix, keep the "/"
    : endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  // Extract existing query params if any
  let [path, existingQuery] = cleanEndpoint.split("?");
  
  // Build query string from params
  const searchParams = new URLSearchParams(existingQuery);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
  }
  
  const queryString = searchParams.toString();
  const fullEndpoint = queryString ? `${path}?${queryString}` : path;
  
  return apiFetch<T>(fullEndpoint, {
    method: "GET",
  });
}

/**
 * POST request
 */
export async function apiPost<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * PUT request
 */
export async function apiPut<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request
 */
export async function apiDelete<T>(
  endpoint: string
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: "DELETE",
  });
}
