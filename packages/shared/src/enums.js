"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_HIERARCHY = exports.AuditAction = exports.PaymentMethod = exports.BudgetPeriod = exports.FileVisibility = exports.NotificationType = exports.AttendanceStatus = exports.LeaveStatus = exports.LeaveType = exports.ProjectStatus = exports.TaskPriority = exports.TaskStatus = exports.InvoiceStatus = exports.TransactionStatus = exports.TransactionType = exports.Department = exports.UserStatus = exports.UserRole = void 0;
exports.UserRole = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    EMPLOYEE: 'EMPLOYEE',
};
exports.UserStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    PENDING: 'PENDING',
    SUSPENDED: 'SUSPENDED',
};
exports.Department = {
    ENGINEERING: 'ENGINEERING',
    FINANCE: 'FINANCE',
    HR: 'HR',
    MARKETING: 'MARKETING',
    OPERATIONS: 'OPERATIONS',
    SALES: 'SALES',
    LEGAL: 'LEGAL',
    PRODUCT: 'PRODUCT',
};
exports.TransactionType = {
    INCOME: 'INCOME',
    EXPENSE: 'EXPENSE',
    TRANSFER: 'TRANSFER',
    REFUND: 'REFUND',
};
exports.TransactionStatus = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED',
};
exports.InvoiceStatus = {
    DRAFT: 'DRAFT',
    SENT: 'SENT',
    PAID: 'PAID',
    OVERDUE: 'OVERDUE',
    CANCELLED: 'CANCELLED',
};
exports.TaskStatus = {
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    IN_REVIEW: 'IN_REVIEW',
    DONE: 'DONE',
    CANCELLED: 'CANCELLED',
};
exports.TaskPriority = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
};
exports.ProjectStatus = {
    PLANNING: 'PLANNING',
    ACTIVE: 'ACTIVE',
    ON_HOLD: 'ON_HOLD',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};
exports.LeaveType = {
    ANNUAL: 'ANNUAL',
    SICK: 'SICK',
    MATERNITY: 'MATERNITY',
    PATERNITY: 'PATERNITY',
    UNPAID: 'UNPAID',
    EMERGENCY: 'EMERGENCY',
};
exports.LeaveStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED',
};
exports.AttendanceStatus = {
    PRESENT: 'PRESENT',
    ABSENT: 'ABSENT',
    LATE: 'LATE',
    HALF_DAY: 'HALF_DAY',
    REMOTE: 'REMOTE',
};
exports.NotificationType = {
    INFO: 'INFO',
    WARNING: 'WARNING',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
    SYSTEM: 'SYSTEM',
};
exports.FileVisibility = {
    PUBLIC: 'PUBLIC',
    PRIVATE: 'PRIVATE',
    TEAM: 'TEAM',
    DEPARTMENT: 'DEPARTMENT',
};
exports.BudgetPeriod = {
    MONTHLY: 'MONTHLY',
    QUARTERLY: 'QUARTERLY',
    ANNUAL: 'ANNUAL',
};
exports.PaymentMethod = {
    BANK_TRANSFER: 'BANK_TRANSFER',
    CREDIT_CARD: 'CREDIT_CARD',
    CASH: 'CASH',
    CHECK: 'CHECK',
    DIGITAL_WALLET: 'DIGITAL_WALLET',
};
exports.AuditAction = {
    CREATE: 'CREATE',
    READ: 'READ',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    EXPORT: 'EXPORT',
    UPLOAD: 'UPLOAD',
};
exports.ROLE_HIERARCHY = {
    SUPER_ADMIN: 4,
    ADMIN: 3,
    MANAGER: 2,
    EMPLOYEE: 1,
};
//# sourceMappingURL=enums.js.map