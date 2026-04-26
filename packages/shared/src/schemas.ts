// =============================================================================
// SHARED ZOD SCHEMAS — Validation schemas used on both client and server
// =============================================================================

import { z } from 'zod';
import {
  UserRole,
  UserStatus,
  Department,
  TransactionType,
  TransactionStatus,
  InvoiceStatus,
  TaskStatus,
  TaskPriority,
  ProjectStatus,
  LeaveType,
  LeaveStatus,
  FileVisibility,
  BudgetPeriod,
  PaymentMethod,
} from './enums';

// ─────────────────────────────────────────────────────────────────────────────
// Primitive helpers
// ─────────────────────────────────────────────────────────────────────────────
const cuid = z.string().min(1, 'ID is required');
const isoDate = z.preprocess((arg) => {
  if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
}, z.date());
const email = z.string().email('Invalid email address').toLowerCase().trim();
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');
const phone = z
  .string()
  .regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number')
  .optional();
const positiveDecimal = z.number().positive('Must be a positive number');
const nonNegativeDecimal = z.number().min(0, 'Cannot be negative');

// ─────────────────────────────────────────────────────────────────────────────
// Enum schemas
// ─────────────────────────────────────────────────────────────────────────────
export const UserRoleSchema = z.nativeEnum(UserRole);
export const UserStatusSchema = z.nativeEnum(UserStatus);
export const DepartmentSchema = z.nativeEnum(Department);
export const TransactionTypeSchema = z.nativeEnum(TransactionType);
export const TransactionStatusSchema = z.nativeEnum(TransactionStatus);
export const InvoiceStatusSchema = z.nativeEnum(InvoiceStatus);
export const TaskStatusSchema = z.nativeEnum(TaskStatus);
export const TaskPrioritySchema = z.nativeEnum(TaskPriority);
export const ProjectStatusSchema = z.nativeEnum(ProjectStatus);
export const LeaveTypeSchema = z.nativeEnum(LeaveType);
export const LeaveStatusSchema = z.nativeEnum(LeaveStatus);
export const FileVisibilitySchema = z.nativeEnum(FileVisibility);
export const BudgetPeriodSchema = z.nativeEnum(BudgetPeriod);
export const PaymentMethodSchema = z.nativeEnum(PaymentMethod);

// ─────────────────────────────────────────────────────────────────────────────
// Auth schemas
// ─────────────────────────────────────────────────────────────────────────────
export const RegisterSchema = z
  .object({
    email,
    password,
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required').max(50).trim(),
    lastName: z.string().min(1, 'Last name is required').max(50).trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const LoginSchema = z.object({
  employeeNumber: z.string().min(1, 'Employee number is required'),
  password: z.string().min(1, 'Password is required'),
});

export const ForgotPasswordSchema = z.object({ email });

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─────────────────────────────────────────────────────────────────────────────
// User schemas
// ─────────────────────────────────────────────────────────────────────────────
export const CreateUserSchema = z.object({
  email,
  password,
  firstName: z.string().min(1).max(50).trim(),
  lastName: z.string().min(1).max(50).trim(),
  role: UserRoleSchema.default('EMPLOYEE'),
  department: DepartmentSchema.optional(),
  position: z.string().max(100).trim().optional(),
  phone,
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).max(50).trim().optional(),
  lastName: z.string().min(1).max(50).trim().optional(),
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
  department: DepartmentSchema.optional(),
  position: z.string().max(100).trim().optional(),
  phone,
  avatarUrl: z.string().url().optional().nullable(),
});

export const UserFiltersSchema = z.object({
  search: z.string().trim().optional(),
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
  department: DepartmentSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['firstName', 'lastName', 'email', 'createdAt', 'role']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ─────────────────────────────────────────────────────────────────────────────
// Client schemas
// ─────────────────────────────────────────────────────────────────────────────
export const CreateClientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200).trim(),
  email: z.string().email().optional().nullable(),
  phone,
  company: z.string().max(200).trim().optional(),
  address: z.string().max(500).trim().optional(),
  taxId: z.string().max(50).trim().optional(),
});

export const UpdateClientSchema = CreateClientSchema.partial();

// ─────────────────────────────────────────────────────────────────────────────
// Invoice schemas
// ─────────────────────────────────────────────────────────────────────────────
export const InvoiceLineItemSchema = z.object({
  description: z.string().min(1).max(500).trim(),
  quantity: positiveDecimal,
  unitPrice: nonNegativeDecimal,
  sortOrder: z.number().int().min(0).default(0),
});

export const CreateInvoiceSchema = z.object({
  clientId: cuid,
  dueDate: isoDate,
  taxRate: z.number().min(0).max(100).default(0),
  discount: nonNegativeDecimal.default(0),
  currency: z.string().length(3).default('USD'),
  notes: z.string().max(2000).trim().optional(),
  lineItems: z.array(InvoiceLineItemSchema).min(1, 'At least one line item required'),
});

export const UpdateInvoiceSchema = CreateInvoiceSchema.partial().extend({
  status: InvoiceStatusSchema.optional(),
});

export const InvoiceFiltersSchema = z.object({
  clientId: cuid.optional(),
  status: InvoiceStatusSchema.optional(),
  dateFrom: isoDate.optional(),
  dateTo: isoDate.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─────────────────────────────────────────────────────────────────────────────
// Transaction schemas
// ─────────────────────────────────────────────────────────────────────────────
export const CreateTransactionSchema = z.object({
  type: TransactionTypeSchema,
  amount: positiveDecimal,
  currency: z.string().length(3).default('USD'),
  description: z.string().min(1).max(500).trim(),
  category: z.string().min(1).max(100).trim(),
  department: DepartmentSchema.optional(),
  reference: z.string().max(100).trim().optional(),
  paymentMethod: PaymentMethodSchema.optional(),
  invoiceId: cuid.optional(),
  transactionDate: isoDate.optional(),
});

export const TransactionFiltersSchema = z.object({
  type: TransactionTypeSchema.optional(),
  status: TransactionStatusSchema.optional(),
  department: DepartmentSchema.optional(),
  category: z.string().trim().optional(),
  dateFrom: isoDate.optional(),
  dateTo: isoDate.optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['transactionDate', 'amount', 'createdAt']).default('transactionDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ─────────────────────────────────────────────────────────────────────────────
// Project schemas
// ─────────────────────────────────────────────────────────────────────────────
export const CreateProjectBaseSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).trim().optional(),
  managerId: cuid,
  clientId: cuid.optional(),
  department: DepartmentSchema.optional(),
  startDate: isoDate,
  endDate: isoDate.optional(),
  budget: positiveDecimal.optional(),
});

export const CreateProjectSchema = CreateProjectBaseSchema.refine(
  (data) => !data.endDate || new Date(data.endDate) > new Date(data.startDate),
  { message: 'End date must be after start date', path: ['endDate'] },
);

export const UpdateProjectSchema = CreateProjectBaseSchema.partial()
  .extend({
    status: ProjectStatusSchema.optional(),
    progress: z.number().int().min(0).max(100).optional(),
  })
  .refine(
    (data) => !data.endDate || !data.startDate || new Date(data.endDate) > new Date(data.startDate),
    { message: 'End date must be after start date', path: ['endDate'] },
  );

// ─────────────────────────────────────────────────────────────────────────────
// Task schemas
// ─────────────────────────────────────────────────────────────────────────────
export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(500).trim(),
  description: z.string().max(5000).trim().optional(),
  priority: TaskPrioritySchema.default('MEDIUM'),
  projectId: cuid,
  assigneeId: cuid.optional(),
  dueDate: isoDate.optional(),
  estimatedHours: positiveDecimal.optional(),
  tags: z.array(z.string().max(50)).max(10).default([]),
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  status: TaskStatusSchema.optional(),
  actualHours: nonNegativeDecimal.optional(),
});

export const CreateTaskCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(5000).trim(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Budget schemas
// ─────────────────────────────────────────────────────────────────────────────
export const CreateBudgetSchema = z.object({
  department: DepartmentSchema,
  period: BudgetPeriodSchema,
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12).optional(),
  quarter: z.number().int().min(1).max(4).optional(),
  allocated: positiveDecimal,
});

// ─────────────────────────────────────────────────────────────────────────────
// Payroll schemas
// ─────────────────────────────────────────────────────────────────────────────
export const CreatePayrollSchema = z.object({
  userId: cuid,
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  baseSalary: positiveDecimal,
  allowances: nonNegativeDecimal.default(0),
  deductions: nonNegativeDecimal.default(0),
  bonus: nonNegativeDecimal.default(0),
  notes: z.string().max(1000).trim().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Leave schemas
// ─────────────────────────────────────────────────────────────────────────────
export const CreateLeaveSchema = z
  .object({
    type: LeaveTypeSchema,
    startDate: isoDate,
    endDate: isoDate,
    reason: z.string().max(1000).trim().optional(),
  })
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    { message: 'End date must be on or after start date', path: ['endDate'] },
  );

export const ReviewLeaveSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().max(500).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// File schemas
// ─────────────────────────────────────────────────────────────────────────────
export const UpdateFileSchema = z.object({
  name: z.string().min(1).max(255).trim().optional(),
  folderPath: z.string().max(500).trim().optional(),
  visibility: FileVisibilitySchema.optional(),
  department: DepartmentSchema.optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────────────────
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─────────────────────────────────────────────────────────────────────────────
// Exported types inferred from schemas
// ─────────────────────────────────────────────────────────────────────────────
export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type UserFilters = z.infer<typeof UserFiltersSchema>;
export type CreateClientDto = z.infer<typeof CreateClientSchema>;
export type UpdateClientDto = z.infer<typeof UpdateClientSchema>;
export type CreateInvoiceDto = z.infer<typeof CreateInvoiceSchema>;
export type UpdateInvoiceDto = z.infer<typeof UpdateInvoiceSchema>;
export type InvoiceFilters = z.infer<typeof InvoiceFiltersSchema>;
export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;
export type TransactionFilters = z.infer<typeof TransactionFiltersSchema>;
export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>;
export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;
export type CreateTaskCommentDto = z.infer<typeof CreateTaskCommentSchema>;
export type CreateBudgetDto = z.infer<typeof CreateBudgetSchema>;
export type CreatePayrollDto = z.infer<typeof CreatePayrollSchema>;
export type CreateLeaveDto = z.infer<typeof CreateLeaveSchema>;
export type ReviewLeaveDto = z.infer<typeof ReviewLeaveSchema>;
export type UpdateFileDto = z.infer<typeof UpdateFileSchema>;
export type PaginationDto = z.infer<typeof PaginationSchema>;
