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
export declare function ok<T>(data: T, meta?: ApiMeta): ApiResponse<T>;
export declare function fail(code: string, message: string, details?: Record<string, unknown>): ApiResponse<never>;
export declare function paginate<T>(items: T[], total: number, page: number, limit: number): ApiResponse<PaginatedResponse<T>>;
export declare const ErrorCode: {
    readonly INVALID_CREDENTIALS: "INVALID_CREDENTIALS";
    readonly EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED";
    readonly TOKEN_EXPIRED: "TOKEN_EXPIRED";
    readonly TOKEN_INVALID: "TOKEN_INVALID";
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly ALREADY_EXISTS: "ALREADY_EXISTS";
    readonly CONFLICT: "CONFLICT";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly INVALID_INPUT: "INVALID_INPUT";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
    readonly SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE";
    readonly INSUFFICIENT_BUDGET: "INSUFFICIENT_BUDGET";
    readonly PAYROLL_ALREADY_PROCESSED: "PAYROLL_ALREADY_PROCESSED";
    readonly LEAVE_OVERLAP: "LEAVE_OVERLAP";
    readonly CANNOT_DELETE_ACTIVE: "CANNOT_DELETE_ACTIVE";
};
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
