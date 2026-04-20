// =============================================================================
// SHARED API RESPONSE TYPES
// Consistent envelope for all API responses
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// Base response envelope
// ─────────────────────────────────────────────────────────────────────────────
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: ApiMeta;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constructor helpers (used in services/controllers)
// ─────────────────────────────────────────────────────────────────────────────
export function ok<T>(data: T, meta?: ApiMeta): ApiResponse<T> {
  return { success: true, data, ...(meta ? { meta } : {}) };
}

export function fail(code: string, message: string, details?: Record<string, unknown>): ApiResponse<never> {
  return { success: false, error: { code, message, ...(details ? { details } : {}) } };
}

export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): ApiResponse<PaginatedResponse<T>> {
  const totalPages = Math.ceil(total / limit);
  const meta: ApiMeta = {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
  return { success: true, data: { items, meta }, meta };
}

// ─────────────────────────────────────────────────────────────────────────────
// Error codes (centralised, no magic strings anywhere)
// ─────────────────────────────────────────────────────────────────────────────
export const ErrorCode = {
  // Auth
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  // Business
  INSUFFICIENT_BUDGET: 'INSUFFICIENT_BUDGET',
  PAYROLL_ALREADY_PROCESSED: 'PAYROLL_ALREADY_PROCESSED',
  LEAVE_OVERLAP: 'LEAVE_OVERLAP',
  CANNOT_DELETE_ACTIVE: 'CANNOT_DELETE_ACTIVE',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
