"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationSchema = exports.UpdateFileSchema = exports.ReviewLeaveSchema = exports.CreateLeaveSchema = exports.CreatePayrollSchema = exports.CreateBudgetSchema = exports.CreateTaskCommentSchema = exports.UpdateTaskSchema = exports.CreateTaskSchema = exports.UpdateProjectSchema = exports.CreateProjectSchema = exports.CreateProjectBaseSchema = exports.TransactionFiltersSchema = exports.CreateTransactionSchema = exports.InvoiceFiltersSchema = exports.UpdateInvoiceSchema = exports.CreateInvoiceSchema = exports.InvoiceLineItemSchema = exports.UpdateClientSchema = exports.CreateClientSchema = exports.UserFiltersSchema = exports.UpdateUserSchema = exports.CreateUserSchema = exports.ChangePasswordSchema = exports.ResetPasswordSchema = exports.ForgotPasswordSchema = exports.LoginSchema = exports.RegisterSchema = exports.PaymentMethodSchema = exports.BudgetPeriodSchema = exports.FileVisibilitySchema = exports.LeaveStatusSchema = exports.LeaveTypeSchema = exports.ProjectStatusSchema = exports.TaskPrioritySchema = exports.TaskStatusSchema = exports.InvoiceStatusSchema = exports.TransactionStatusSchema = exports.TransactionTypeSchema = exports.DepartmentSchema = exports.UserStatusSchema = exports.UserRoleSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("./enums");
const cuid = zod_1.z.string().min(1, 'ID is required');
const isoDate = zod_1.z.string().datetime({ offset: true });
const email = zod_1.z.string().email('Invalid email address').toLowerCase().trim();
const password = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');
const phone = zod_1.z
    .string()
    .regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number')
    .optional();
const positiveDecimal = zod_1.z.number().positive('Must be a positive number');
const nonNegativeDecimal = zod_1.z.number().min(0, 'Cannot be negative');
exports.UserRoleSchema = zod_1.z.nativeEnum(enums_1.UserRole);
exports.UserStatusSchema = zod_1.z.nativeEnum(enums_1.UserStatus);
exports.DepartmentSchema = zod_1.z.nativeEnum(enums_1.Department);
exports.TransactionTypeSchema = zod_1.z.nativeEnum(enums_1.TransactionType);
exports.TransactionStatusSchema = zod_1.z.nativeEnum(enums_1.TransactionStatus);
exports.InvoiceStatusSchema = zod_1.z.nativeEnum(enums_1.InvoiceStatus);
exports.TaskStatusSchema = zod_1.z.nativeEnum(enums_1.TaskStatus);
exports.TaskPrioritySchema = zod_1.z.nativeEnum(enums_1.TaskPriority);
exports.ProjectStatusSchema = zod_1.z.nativeEnum(enums_1.ProjectStatus);
exports.LeaveTypeSchema = zod_1.z.nativeEnum(enums_1.LeaveType);
exports.LeaveStatusSchema = zod_1.z.nativeEnum(enums_1.LeaveStatus);
exports.FileVisibilitySchema = zod_1.z.nativeEnum(enums_1.FileVisibility);
exports.BudgetPeriodSchema = zod_1.z.nativeEnum(enums_1.BudgetPeriod);
exports.PaymentMethodSchema = zod_1.z.nativeEnum(enums_1.PaymentMethod);
exports.RegisterSchema = zod_1.z
    .object({
    email,
    password,
    confirmPassword: zod_1.z.string(),
    firstName: zod_1.z.string().min(1, 'First name is required').max(50).trim(),
    lastName: zod_1.z.string().min(1, 'Last name is required').max(50).trim(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.LoginSchema = zod_1.z.object({
    email,
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.ForgotPasswordSchema = zod_1.z.object({ email });
exports.ResetPasswordSchema = zod_1.z
    .object({
    token: zod_1.z.string().min(1, 'Reset token is required'),
    password,
    confirmPassword: zod_1.z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.ChangePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: password,
    confirmPassword: zod_1.z.string(),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.CreateUserSchema = zod_1.z.object({
    email,
    password,
    firstName: zod_1.z.string().min(1).max(50).trim(),
    lastName: zod_1.z.string().min(1).max(50).trim(),
    role: exports.UserRoleSchema.default('EMPLOYEE'),
    department: exports.DepartmentSchema.optional(),
    position: zod_1.z.string().max(100).trim().optional(),
    phone,
});
exports.UpdateUserSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).max(50).trim().optional(),
    lastName: zod_1.z.string().min(1).max(50).trim().optional(),
    role: exports.UserRoleSchema.optional(),
    status: exports.UserStatusSchema.optional(),
    department: exports.DepartmentSchema.optional(),
    position: zod_1.z.string().max(100).trim().optional(),
    phone,
    avatarUrl: zod_1.z.string().url().optional().nullable(),
});
exports.UserFiltersSchema = zod_1.z.object({
    search: zod_1.z.string().trim().optional(),
    role: exports.UserRoleSchema.optional(),
    status: exports.UserStatusSchema.optional(),
    department: exports.DepartmentSchema.optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['firstName', 'lastName', 'email', 'createdAt', 'role']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.CreateClientSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(200).trim(),
    email: zod_1.z.string().email().optional().nullable(),
    phone,
    company: zod_1.z.string().max(200).trim().optional(),
    address: zod_1.z.string().max(500).trim().optional(),
    taxId: zod_1.z.string().max(50).trim().optional(),
});
exports.UpdateClientSchema = exports.CreateClientSchema.partial();
exports.InvoiceLineItemSchema = zod_1.z.object({
    description: zod_1.z.string().min(1).max(500).trim(),
    quantity: positiveDecimal,
    unitPrice: nonNegativeDecimal,
    sortOrder: zod_1.z.number().int().min(0).default(0),
});
exports.CreateInvoiceSchema = zod_1.z.object({
    clientId: cuid,
    dueDate: isoDate,
    taxRate: zod_1.z.number().min(0).max(100).default(0),
    discount: nonNegativeDecimal.default(0),
    currency: zod_1.z.string().length(3).default('USD'),
    notes: zod_1.z.string().max(2000).trim().optional(),
    lineItems: zod_1.z.array(exports.InvoiceLineItemSchema).min(1, 'At least one line item required'),
});
exports.UpdateInvoiceSchema = exports.CreateInvoiceSchema.partial().extend({
    status: exports.InvoiceStatusSchema.optional(),
});
exports.InvoiceFiltersSchema = zod_1.z.object({
    clientId: cuid.optional(),
    status: exports.InvoiceStatusSchema.optional(),
    dateFrom: isoDate.optional(),
    dateTo: isoDate.optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
exports.CreateTransactionSchema = zod_1.z.object({
    type: exports.TransactionTypeSchema,
    amount: positiveDecimal,
    currency: zod_1.z.string().length(3).default('USD'),
    description: zod_1.z.string().min(1).max(500).trim(),
    category: zod_1.z.string().min(1).max(100).trim(),
    department: exports.DepartmentSchema.optional(),
    reference: zod_1.z.string().max(100).trim().optional(),
    paymentMethod: exports.PaymentMethodSchema.optional(),
    invoiceId: cuid.optional(),
    transactionDate: isoDate.optional(),
});
exports.TransactionFiltersSchema = zod_1.z.object({
    type: exports.TransactionTypeSchema.optional(),
    status: exports.TransactionStatusSchema.optional(),
    department: exports.DepartmentSchema.optional(),
    category: zod_1.z.string().trim().optional(),
    dateFrom: isoDate.optional(),
    dateTo: isoDate.optional(),
    search: zod_1.z.string().trim().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['transactionDate', 'amount', 'createdAt']).default('transactionDate'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.CreateProjectBaseSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200).trim(),
    description: zod_1.z.string().max(2000).trim().optional(),
    managerId: cuid,
    clientId: cuid.optional(),
    department: exports.DepartmentSchema.optional(),
    startDate: isoDate,
    endDate: isoDate.optional(),
    budget: positiveDecimal.optional(),
});
exports.CreateProjectSchema = exports.CreateProjectBaseSchema.refine((data) => !data.endDate || new Date(data.endDate) > new Date(data.startDate), { message: 'End date must be after start date', path: ['endDate'] });
exports.UpdateProjectSchema = exports.CreateProjectBaseSchema.partial()
    .extend({
    status: exports.ProjectStatusSchema.optional(),
    progress: zod_1.z.number().int().min(0).max(100).optional(),
})
    .refine((data) => !data.endDate || !data.startDate || new Date(data.endDate) > new Date(data.startDate), { message: 'End date must be after start date', path: ['endDate'] });
exports.CreateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(500).trim(),
    description: zod_1.z.string().max(5000).trim().optional(),
    priority: exports.TaskPrioritySchema.default('MEDIUM'),
    projectId: cuid,
    assigneeId: cuid.optional(),
    dueDate: isoDate.optional(),
    estimatedHours: positiveDecimal.optional(),
    tags: zod_1.z.array(zod_1.z.string().max(50)).max(10).default([]),
});
exports.UpdateTaskSchema = exports.CreateTaskSchema.partial().extend({
    status: exports.TaskStatusSchema.optional(),
    actualHours: nonNegativeDecimal.optional(),
});
exports.CreateTaskCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Comment cannot be empty').max(5000).trim(),
});
exports.CreateBudgetSchema = zod_1.z.object({
    department: exports.DepartmentSchema,
    period: exports.BudgetPeriodSchema,
    year: zod_1.z.number().int().min(2020).max(2100),
    month: zod_1.z.number().int().min(1).max(12).optional(),
    quarter: zod_1.z.number().int().min(1).max(4).optional(),
    allocated: positiveDecimal,
});
exports.CreatePayrollSchema = zod_1.z.object({
    userId: cuid,
    month: zod_1.z.number().int().min(1).max(12),
    year: zod_1.z.number().int().min(2020).max(2100),
    baseSalary: positiveDecimal,
    allowances: nonNegativeDecimal.default(0),
    deductions: nonNegativeDecimal.default(0),
    bonus: nonNegativeDecimal.default(0),
    notes: zod_1.z.string().max(1000).trim().optional(),
});
exports.CreateLeaveSchema = zod_1.z
    .object({
    type: exports.LeaveTypeSchema,
    startDate: isoDate,
    endDate: isoDate,
    reason: zod_1.z.string().max(1000).trim().optional(),
})
    .refine((data) => new Date(data.endDate) >= new Date(data.startDate), { message: 'End date must be on or after start date', path: ['endDate'] });
exports.ReviewLeaveSchema = zod_1.z.object({
    status: zod_1.z.enum(['APPROVED', 'REJECTED']),
    rejectionReason: zod_1.z.string().max(500).optional(),
});
exports.UpdateFileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).trim().optional(),
    folderPath: zod_1.z.string().max(500).trim().optional(),
    visibility: exports.FileVisibilitySchema.optional(),
    department: exports.DepartmentSchema.optional(),
});
exports.PaginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=schemas.js.map