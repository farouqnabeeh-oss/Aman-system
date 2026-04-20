export declare const UserRole: {
    readonly SUPER_ADMIN: "SUPER_ADMIN";
    readonly ADMIN: "ADMIN";
    readonly MANAGER: "MANAGER";
    readonly EMPLOYEE: "EMPLOYEE";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export declare const UserStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly INACTIVE: "INACTIVE";
    readonly PENDING: "PENDING";
    readonly SUSPENDED: "SUSPENDED";
};
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
export declare const Department: {
    readonly ENGINEERING: "ENGINEERING";
    readonly FINANCE: "FINANCE";
    readonly HR: "HR";
    readonly MARKETING: "MARKETING";
    readonly OPERATIONS: "OPERATIONS";
    readonly SALES: "SALES";
    readonly LEGAL: "LEGAL";
    readonly PRODUCT: "PRODUCT";
};
export type Department = (typeof Department)[keyof typeof Department];
export declare const TransactionType: {
    readonly INCOME: "INCOME";
    readonly EXPENSE: "EXPENSE";
    readonly TRANSFER: "TRANSFER";
    readonly REFUND: "REFUND";
};
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];
export declare const TransactionStatus: {
    readonly PENDING: "PENDING";
    readonly COMPLETED: "COMPLETED";
    readonly FAILED: "FAILED";
    readonly CANCELLED: "CANCELLED";
};
export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];
export declare const InvoiceStatus: {
    readonly DRAFT: "DRAFT";
    readonly SENT: "SENT";
    readonly PAID: "PAID";
    readonly OVERDUE: "OVERDUE";
    readonly CANCELLED: "CANCELLED";
};
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];
export declare const TaskStatus: {
    readonly TODO: "TODO";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly IN_REVIEW: "IN_REVIEW";
    readonly DONE: "DONE";
    readonly CANCELLED: "CANCELLED";
};
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
export declare const TaskPriority: {
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly HIGH: "HIGH";
    readonly CRITICAL: "CRITICAL";
};
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];
export declare const ProjectStatus: {
    readonly PLANNING: "PLANNING";
    readonly ACTIVE: "ACTIVE";
    readonly ON_HOLD: "ON_HOLD";
    readonly COMPLETED: "COMPLETED";
    readonly CANCELLED: "CANCELLED";
};
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];
export declare const LeaveType: {
    readonly ANNUAL: "ANNUAL";
    readonly SICK: "SICK";
    readonly MATERNITY: "MATERNITY";
    readonly PATERNITY: "PATERNITY";
    readonly UNPAID: "UNPAID";
    readonly EMERGENCY: "EMERGENCY";
};
export type LeaveType = (typeof LeaveType)[keyof typeof LeaveType];
export declare const LeaveStatus: {
    readonly PENDING: "PENDING";
    readonly APPROVED: "APPROVED";
    readonly REJECTED: "REJECTED";
    readonly CANCELLED: "CANCELLED";
};
export type LeaveStatus = (typeof LeaveStatus)[keyof typeof LeaveStatus];
export declare const AttendanceStatus: {
    readonly PRESENT: "PRESENT";
    readonly ABSENT: "ABSENT";
    readonly LATE: "LATE";
    readonly HALF_DAY: "HALF_DAY";
    readonly REMOTE: "REMOTE";
};
export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];
export declare const NotificationType: {
    readonly INFO: "INFO";
    readonly WARNING: "WARNING";
    readonly SUCCESS: "SUCCESS";
    readonly ERROR: "ERROR";
    readonly SYSTEM: "SYSTEM";
};
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
export declare const FileVisibility: {
    readonly PUBLIC: "PUBLIC";
    readonly PRIVATE: "PRIVATE";
    readonly TEAM: "TEAM";
    readonly DEPARTMENT: "DEPARTMENT";
};
export type FileVisibility = (typeof FileVisibility)[keyof typeof FileVisibility];
export declare const BudgetPeriod: {
    readonly MONTHLY: "MONTHLY";
    readonly QUARTERLY: "QUARTERLY";
    readonly ANNUAL: "ANNUAL";
};
export type BudgetPeriod = (typeof BudgetPeriod)[keyof typeof BudgetPeriod];
export declare const PaymentMethod: {
    readonly BANK_TRANSFER: "BANK_TRANSFER";
    readonly CREDIT_CARD: "CREDIT_CARD";
    readonly CASH: "CASH";
    readonly CHECK: "CHECK";
    readonly DIGITAL_WALLET: "DIGITAL_WALLET";
};
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
export declare const AuditAction: {
    readonly CREATE: "CREATE";
    readonly READ: "READ";
    readonly UPDATE: "UPDATE";
    readonly DELETE: "DELETE";
    readonly LOGIN: "LOGIN";
    readonly LOGOUT: "LOGOUT";
    readonly EXPORT: "EXPORT";
    readonly UPLOAD: "UPLOAD";
};
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];
export declare const ROLE_HIERARCHY: Record<UserRole, number>;
