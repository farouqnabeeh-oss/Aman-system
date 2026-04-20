"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
exports.ok = ok;
exports.fail = fail;
exports.paginate = paginate;
function ok(data, meta) {
    return { success: true, data, ...(meta ? { meta } : {}) };
}
function fail(code, message, details) {
    return { success: false, error: { code, message, ...(details ? { details } : {}) } };
}
function paginate(items, total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    const meta = {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
    return { success: true, data: { items, meta }, meta };
}
exports.ErrorCode = {
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    CONFLICT: 'CONFLICT',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    INSUFFICIENT_BUDGET: 'INSUFFICIENT_BUDGET',
    PAYROLL_ALREADY_PROCESSED: 'PAYROLL_ALREADY_PROCESSED',
    LEAVE_OVERLAP: 'LEAVE_OVERLAP',
    CANNOT_DELETE_ACTIVE: 'CANNOT_DELETE_ACTIVE',
};
//# sourceMappingURL=api-response.js.map