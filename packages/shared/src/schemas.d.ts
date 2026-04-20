import { z } from 'zod';
export declare const UserRoleSchema: z.ZodNativeEnum<{
    readonly SUPER_ADMIN: "SUPER_ADMIN";
    readonly ADMIN: "ADMIN";
    readonly MANAGER: "MANAGER";
    readonly EMPLOYEE: "EMPLOYEE";
}>;
export declare const UserStatusSchema: z.ZodNativeEnum<{
    readonly ACTIVE: "ACTIVE";
    readonly INACTIVE: "INACTIVE";
    readonly PENDING: "PENDING";
    readonly SUSPENDED: "SUSPENDED";
}>;
export declare const DepartmentSchema: z.ZodNativeEnum<{
    readonly ENGINEERING: "ENGINEERING";
    readonly FINANCE: "FINANCE";
    readonly HR: "HR";
    readonly MARKETING: "MARKETING";
    readonly OPERATIONS: "OPERATIONS";
    readonly SALES: "SALES";
    readonly LEGAL: "LEGAL";
    readonly PRODUCT: "PRODUCT";
}>;
export declare const TransactionTypeSchema: z.ZodNativeEnum<{
    readonly INCOME: "INCOME";
    readonly EXPENSE: "EXPENSE";
    readonly TRANSFER: "TRANSFER";
    readonly REFUND: "REFUND";
}>;
export declare const TransactionStatusSchema: z.ZodNativeEnum<{
    readonly PENDING: "PENDING";
    readonly COMPLETED: "COMPLETED";
    readonly FAILED: "FAILED";
    readonly CANCELLED: "CANCELLED";
}>;
export declare const InvoiceStatusSchema: z.ZodNativeEnum<{
    readonly DRAFT: "DRAFT";
    readonly SENT: "SENT";
    readonly PAID: "PAID";
    readonly OVERDUE: "OVERDUE";
    readonly CANCELLED: "CANCELLED";
}>;
export declare const TaskStatusSchema: z.ZodNativeEnum<{
    readonly TODO: "TODO";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly IN_REVIEW: "IN_REVIEW";
    readonly DONE: "DONE";
    readonly CANCELLED: "CANCELLED";
}>;
export declare const TaskPrioritySchema: z.ZodNativeEnum<{
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly HIGH: "HIGH";
    readonly CRITICAL: "CRITICAL";
}>;
export declare const ProjectStatusSchema: z.ZodNativeEnum<{
    readonly PLANNING: "PLANNING";
    readonly ACTIVE: "ACTIVE";
    readonly ON_HOLD: "ON_HOLD";
    readonly COMPLETED: "COMPLETED";
    readonly CANCELLED: "CANCELLED";
}>;
export declare const LeaveTypeSchema: z.ZodNativeEnum<{
    readonly ANNUAL: "ANNUAL";
    readonly SICK: "SICK";
    readonly MATERNITY: "MATERNITY";
    readonly PATERNITY: "PATERNITY";
    readonly UNPAID: "UNPAID";
    readonly EMERGENCY: "EMERGENCY";
}>;
export declare const LeaveStatusSchema: z.ZodNativeEnum<{
    readonly PENDING: "PENDING";
    readonly APPROVED: "APPROVED";
    readonly REJECTED: "REJECTED";
    readonly CANCELLED: "CANCELLED";
}>;
export declare const FileVisibilitySchema: z.ZodNativeEnum<{
    readonly PUBLIC: "PUBLIC";
    readonly PRIVATE: "PRIVATE";
    readonly TEAM: "TEAM";
    readonly DEPARTMENT: "DEPARTMENT";
}>;
export declare const BudgetPeriodSchema: z.ZodNativeEnum<{
    readonly MONTHLY: "MONTHLY";
    readonly QUARTERLY: "QUARTERLY";
    readonly ANNUAL: "ANNUAL";
}>;
export declare const PaymentMethodSchema: z.ZodNativeEnum<{
    readonly BANK_TRANSFER: "BANK_TRANSFER";
    readonly CREDIT_CARD: "CREDIT_CARD";
    readonly CASH: "CASH";
    readonly CHECK: "CHECK";
    readonly DIGITAL_WALLET: "DIGITAL_WALLET";
}>;
export declare const RegisterSchema: z.ZodEffects<z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}, {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}>, {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}, {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const ForgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const ResetPasswordSchema: z.ZodEffects<z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    confirmPassword: string;
    token: string;
}, {
    password: string;
    confirmPassword: string;
    token: string;
}>, {
    password: string;
    confirmPassword: string;
    token: string;
}, {
    password: string;
    confirmPassword: string;
    token: string;
}>;
export declare const ChangePasswordSchema: z.ZodEffects<z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}>, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}>;
export declare const CreateUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodDefault<z.ZodNativeEnum<{
        readonly SUPER_ADMIN: "SUPER_ADMIN";
        readonly ADMIN: "ADMIN";
        readonly MANAGER: "MANAGER";
        readonly EMPLOYEE: "EMPLOYEE";
    }>>;
    department: z.ZodOptional<z.ZodNativeEnum<{
        readonly ENGINEERING: "ENGINEERING";
        readonly FINANCE: "FINANCE";
        readonly HR: "HR";
        readonly MARKETING: "MARKETING";
        readonly OPERATIONS: "OPERATIONS";
        readonly SALES: "SALES";
        readonly LEGAL: "LEGAL";
        readonly PRODUCT: "PRODUCT";
    }>>;
    position: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE";
    password: string;
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    position?: string | undefined;
    phone?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    role?: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | undefined;
    position?: string | undefined;
    phone?: string | undefined;
}>;
export declare const UpdateUserSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodNativeEnum<{
        readonly SUPER_ADMIN: "SUPER_ADMIN";
        readonly ADMIN: "ADMIN";
        readonly MANAGER: "MANAGER";
        readonly EMPLOYEE: "EMPLOYEE";
    }>>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        readonly ACTIVE: "ACTIVE";
        readonly INACTIVE: "INACTIVE";
        readonly PENDING: "PENDING";
        readonly SUSPENDED: "SUSPENDED";
    }>>;
    department: z.ZodOptional<z.ZodNativeEnum<{
        readonly ENGINEERING: "ENGINEERING";
        readonly FINANCE: "FINANCE";
        readonly HR: "HR";
        readonly MARKETING: "MARKETING";
        readonly OPERATIONS: "OPERATIONS";
        readonly SALES: "SALES";
        readonly LEGAL: "LEGAL";
        readonly PRODUCT: "PRODUCT";
    }>>;
    position: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    avatarUrl?: string | null | undefined;
    role?: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | undefined;
    position?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED" | undefined;
    phone?: string | undefined;
}, {
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    avatarUrl?: string | null | undefined;
    role?: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | undefined;
    position?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED" | undefined;
    phone?: string | undefined;
}>;
export declare const UserFiltersSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodNativeEnum<{
        readonly SUPER_ADMIN: "SUPER_ADMIN";
        readonly ADMIN: "ADMIN";
        readonly MANAGER: "MANAGER";
        readonly EMPLOYEE: "EMPLOYEE";
    }>>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        readonly ACTIVE: "ACTIVE";
        readonly INACTIVE: "INACTIVE";
        readonly PENDING: "PENDING";
        readonly SUSPENDED: "SUSPENDED";
    }>>;
    department: z.ZodOptional<z.ZodNativeEnum<{
        readonly ENGINEERING: "ENGINEERING";
        readonly FINANCE: "FINANCE";
        readonly HR: "HR";
        readonly MARKETING: "MARKETING";
        readonly OPERATIONS: "OPERATIONS";
        readonly SALES: "SALES";
        readonly LEGAL: "LEGAL";
        readonly PRODUCT: "PRODUCT";
    }>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["firstName", "lastName", "email", "createdAt", "role"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "firstName" | "lastName" | "email" | "role" | "createdAt";
    sortOrder: "asc" | "desc";
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    search?: string | undefined;
    role?: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | undefined;
    status?: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED" | undefined;
}, {
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    search?: string | undefined;
    role?: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | undefined;
    status?: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "firstName" | "lastName" | "email" | "role" | "createdAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const CreateClientSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    phone: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    taxId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email?: string | null | undefined;
    phone?: string | undefined;
    company?: string | undefined;
    address?: string | undefined;
    taxId?: string | undefined;
}, {
    name: string;
    email?: string | null | undefined;
    phone?: string | undefined;
    company?: string | undefined;
    address?: string | undefined;
    taxId?: string | undefined;
}>;
export declare const UpdateClientSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    company: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    address: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    taxId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | null | undefined;
    phone?: string | undefined;
    company?: string | undefined;
    address?: string | undefined;
    taxId?: string | undefined;
}, {
    name?: string | undefined;
    email?: string | null | undefined;
    phone?: string | undefined;
    company?: string | undefined;
    address?: string | undefined;
    taxId?: string | undefined;
}>;
export declare const InvoiceLineItemSchema: z.ZodObject<{
    description: z.ZodString;
    quantity: z.ZodNumber;
    unitPrice: z.ZodNumber;
    sortOrder: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    description: string;
    sortOrder: number;
    quantity: number;
    unitPrice: number;
}, {
    description: string;
    quantity: number;
    unitPrice: number;
    sortOrder?: number | undefined;
}>;
export declare const CreateInvoiceSchema: z.ZodObject<{
    clientId: z.ZodString;
    dueDate: z.ZodString;
    taxRate: z.ZodDefault<z.ZodNumber>;
    discount: z.ZodDefault<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    lineItems: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        sortOrder: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        sortOrder: number;
        quantity: number;
        unitPrice: number;
    }, {
        description: string;
        quantity: number;
        unitPrice: number;
        sortOrder?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    clientId: string;
    dueDate: string;
    taxRate: number;
    discount: number;
    currency: string;
    lineItems: {
        description: string;
        sortOrder: number;
        quantity: number;
        unitPrice: number;
    }[];
    notes?: string | undefined;
}, {
    clientId: string;
    dueDate: string;
    lineItems: {
        description: string;
        quantity: number;
        unitPrice: number;
        sortOrder?: number | undefined;
    }[];
    taxRate?: number | undefined;
    discount?: number | undefined;
    currency?: string | undefined;
    notes?: string | undefined;
}>;
export declare const UpdateInvoiceSchema: z.ZodObject<{
    clientId: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    taxRate: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    discount: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    currency: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    lineItems: z.ZodOptional<z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        sortOrder: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        sortOrder: number;
        quantity: number;
        unitPrice: number;
    }, {
        description: string;
        quantity: number;
        unitPrice: number;
        sortOrder?: number | undefined;
    }>, "many">>;
} & {
    status: z.ZodOptional<z.ZodNativeEnum<{
        readonly DRAFT: "DRAFT";
        readonly SENT: "SENT";
        readonly PAID: "PAID";
        readonly OVERDUE: "OVERDUE";
        readonly CANCELLED: "CANCELLED";
    }>>;
}, "strip", z.ZodTypeAny, {
    status?: "CANCELLED" | "DRAFT" | "SENT" | "PAID" | "OVERDUE" | undefined;
    clientId?: string | undefined;
    dueDate?: string | undefined;
    taxRate?: number | undefined;
    discount?: number | undefined;
    currency?: string | undefined;
    notes?: string | undefined;
    lineItems?: {
        description: string;
        sortOrder: number;
        quantity: number;
        unitPrice: number;
    }[] | undefined;
}, {
    status?: "CANCELLED" | "DRAFT" | "SENT" | "PAID" | "OVERDUE" | undefined;
    clientId?: string | undefined;
    dueDate?: string | undefined;
    taxRate?: number | undefined;
    discount?: number | undefined;
    currency?: string | undefined;
    notes?: string | undefined;
    lineItems?: {
        description: string;
        quantity: number;
        unitPrice: number;
        sortOrder?: number | undefined;
    }[] | undefined;
}>;
export declare const InvoiceFiltersSchema: z.ZodObject<{
    clientId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        readonly DRAFT: "DRAFT";
        readonly SENT: "SENT";
        readonly PAID: "PAID";
        readonly OVERDUE: "OVERDUE";
        readonly CANCELLED: "CANCELLED";
    }>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "CANCELLED" | "DRAFT" | "SENT" | "PAID" | "OVERDUE" | undefined;
    clientId?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    status?: "CANCELLED" | "DRAFT" | "SENT" | "PAID" | "OVERDUE" | undefined;
    clientId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}>;
export declare const CreateTransactionSchema: z.ZodObject<{
    type: z.ZodNativeEnum<{
        readonly INCOME: "INCOME";
        readonly EXPENSE: "EXPENSE";
        readonly TRANSFER: "TRANSFER";
        readonly REFUND: "REFUND";
    }>;
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    description: z.ZodString;
    category: z.ZodString;
    department: z.ZodOptional<z.ZodNativeEnum<{
        readonly ENGINEERING: "ENGINEERING";
        readonly FINANCE: "FINANCE";
        readonly HR: "HR";
        readonly MARKETING: "MARKETING";
        readonly OPERATIONS: "OPERATIONS";
        readonly SALES: "SALES";
        readonly LEGAL: "LEGAL";
        readonly PRODUCT: "PRODUCT";
    }>>;
    reference: z.ZodOptional<z.ZodString>;
    paymentMethod: z.ZodOptional<z.ZodNativeEnum<{
        readonly BANK_TRANSFER: "BANK_TRANSFER";
        readonly CREDIT_CARD: "CREDIT_CARD";
        readonly CASH: "CASH";
        readonly CHECK: "CHECK";
        readonly DIGITAL_WALLET: "DIGITAL_WALLET";
    }>>;
    invoiceId: z.ZodOptional<z.ZodString>;
    transactionDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description: string;
    type: "INCOME" | "EXPENSE" | "TRANSFER" | "REFUND";
    currency: string;
    amount: number;
    category: string;
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    reference?: string | undefined;
    paymentMethod?: "BANK_TRANSFER" | "CREDIT_CARD" | "CASH" | "CHECK" | "DIGITAL_WALLET" | undefined;
    invoiceId?: string | undefined;
    transactionDate?: string | undefined;
}, {
    description: string;
    type: "INCOME" | "EXPENSE" | "TRANSFER" | "REFUND";
    amount: number;
    category: string;
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    currency?: string | undefined;
    reference?: string | undefined;
    paymentMethod?: "BANK_TRANSFER" | "CREDIT_CARD" | "CASH" | "CHECK" | "DIGITAL_WALLET" | undefined;
    invoiceId?: string | undefined;
    transactionDate?: string | undefined;
}>;
export declare const TransactionFiltersSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodNativeEnum<{
        readonly INCOME: "INCOME";
        readonly EXPENSE: "EXPENSE";
        readonly TRANSFER: "TRANSFER";
        readonly REFUND: "REFUND";
    }>>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        readonly PENDING: "PENDING";
        readonly COMPLETED: "COMPLETED";
        readonly FAILED: "FAILED";
        readonly CANCELLED: "CANCELLED";
    }>>;
    department: z.ZodOptional<z.ZodNativeEnum<{
        readonly ENGINEERING: "ENGINEERING";
        readonly FINANCE: "FINANCE";
        readonly HR: "HR";
        readonly MARKETING: "MARKETING";
        readonly OPERATIONS: "OPERATIONS";
        readonly SALES: "SALES";
        readonly LEGAL: "LEGAL";
        readonly PRODUCT: "PRODUCT";
    }>>;
    category: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["transactionDate", "amount", "createdAt"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "createdAt" | "amount" | "transactionDate";
    sortOrder: "asc" | "desc";
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    search?: string | undefined;
    status?: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | undefined;
    type?: "INCOME" | "EXPENSE" | "TRANSFER" | "REFUND" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    category?: string | undefined;
}, {
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    search?: string | undefined;
    status?: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | undefined;
    type?: "INCOME" | "EXPENSE" | "TRANSFER" | "REFUND" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "amount" | "transactionDate" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    category?: string | undefined;
}>;
export declare const CreateProjectBaseSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    managerId: z.ZodString;
    clientId: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodNativeEnum<{
        readonly ENGINEERING: "ENGINEERING";
        readonly FINANCE: "FINANCE";
        readonly HR: "HR";
        readonly MARKETING: "MARKETING";
        readonly OPERATIONS: "OPERATIONS";
        readonly SALES: "SALES";
        readonly LEGAL: "LEGAL";
        readonly PRODUCT: "PRODUCT";
    }>>;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    budget: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    managerId: string;
    startDate: string;
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    description?: string | undefined;
    clientId?: string | undefined;
    endDate?: string | undefined;
    budget?: number | undefined;
}, {
    name: string;
    managerId: string;
    startDate: string;
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    description?: string | undefined;
    clientId?: string | undefined;
    endDate?: string | undefined;
    budget?: number | undefined;
}>;
export declare const CreateProjectSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    managerId: z.ZodString;
    clientId: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodNativeEnum<{
        readonly ENGINEERING: "ENGINEERING";
        readonly FINANCE: "FINANCE";
        readonly HR: "HR";
        readonly MARKETING: "MARKETING";
        readonly OPERATIONS: "OPERATIONS";
        readonly SALES: "SALES";
        readonly LEGAL: "LEGAL";
        readonly PRODUCT: "PRODUCT";
    }>>;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    budget: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    managerId: string;
    startDate: string;
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    description?: string | undefined;
    clientId?: string | undefined;
    endDate?: string | undefined;
    budget?: number | undefined;
}, {
    name: string;
    managerId: string;
    startDate: string;
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    description?: string | undefined;
    clientId?: string | undefined;
    endDate?: string | undefined;
    budget?: number | undefined;
}>, {
    name: string;
    managerId: string;
    startDate: string;
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    description?: string | undefined;
    clientId?: string | undefined;
    endDate?: string | undefined;
    budget?: number | undefined;
}, {
    name: string;
    managerId: string;
    startDate: string;
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    description?: string | undefined;
    clientId?: string | undefined;
    endDate?: string | undefined;
    budget?: number | undefined;
}>;
export declare const UpdateProjectSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    managerId: z.ZodOptional<z.ZodString>;
    clientId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    department: z.ZodOptional<z.ZodOptional<z.ZodNativeEnum<{
        readonly ENGINEERING: "ENGINEERING";
        readonly FINANCE: "FINANCE";
        readonly HR: "HR";
        readonly MARKETING: "MARKETING";
        readonly OPERATIONS: "OPERATIONS";
        readonly SALES: "SALES";
        readonly LEGAL: "LEGAL";
        readonly PRODUCT: "PRODUCT";
    }>>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    budget: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
} & {
    status: z.ZodOptional<z.ZodNativeEnum<{
        readonly PLANNING: "PLANNING";
        readonly ACTIVE: "ACTIVE";
        readonly ON_HOLD: "ON_HOLD";
        readonly COMPLETED: "COMPLETED";
        readonly CANCELLED: "CANCELLED";
    }>>;
    progress: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    name?: string | undefined;
    status?: "ACTIVE" | "COMPLETED" | "CANCELLED" | "PLANNING" | "ON_HOLD" | undefined;
    description?: string | undefined;
    managerId?: string | undefined;
    clientId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    budget?: number | undefined;
    progress?: number | undefined;
}, {
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    name?: string | undefined;
    status?: "ACTIVE" | "COMPLETED" | "CANCELLED" | "PLANNING" | "ON_HOLD" | undefined;
    description?: string | undefined;
    managerId?: string | undefined;
    clientId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    budget?: number | undefined;
    progress?: number | undefined;
}>, {
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    name?: string | undefined;
    status?: "ACTIVE" | "COMPLETED" | "CANCELLED" | "PLANNING" | "ON_HOLD" | undefined;
    description?: string | undefined;
    managerId?: string | undefined;
    clientId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    budget?: number | undefined;
    progress?: number | undefined;
}, {
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    name?: string | undefined;
    status?: "ACTIVE" | "COMPLETED" | "CANCELLED" | "PLANNING" | "ON_HOLD" | undefined;
    description?: string | undefined;
    managerId?: string | undefined;
    clientId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    budget?: number | undefined;
    progress?: number | undefined;
}>;
export declare const CreateTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodNativeEnum<{
        readonly LOW: "LOW";
        readonly MEDIUM: "MEDIUM";
        readonly HIGH: "HIGH";
        readonly CRITICAL: "CRITICAL";
    }>>;
    projectId: z.ZodString;
    assigneeId: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    estimatedHours: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    projectId: string;
    tags: string[];
    description?: string | undefined;
    dueDate?: string | undefined;
    assigneeId?: string | undefined;
    estimatedHours?: number | undefined;
}, {
    title: string;
    projectId: string;
    description?: string | undefined;
    dueDate?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined;
    assigneeId?: string | undefined;
    estimatedHours?: number | undefined;
    tags?: string[] | undefined;
}>;
export declare const UpdateTaskSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    priority: z.ZodOptional<z.ZodDefault<z.ZodNativeEnum<{
        readonly LOW: "LOW";
        readonly MEDIUM: "MEDIUM";
        readonly HIGH: "HIGH";
        readonly CRITICAL: "CRITICAL";
    }>>>;
    projectId: z.ZodOptional<z.ZodString>;
    assigneeId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    dueDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    estimatedHours: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    tags: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
} & {
    status: z.ZodOptional<z.ZodNativeEnum<{
        readonly TODO: "TODO";
        readonly IN_PROGRESS: "IN_PROGRESS";
        readonly IN_REVIEW: "IN_REVIEW";
        readonly DONE: "DONE";
        readonly CANCELLED: "CANCELLED";
    }>>;
    actualHours: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: "CANCELLED" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | undefined;
    description?: string | undefined;
    dueDate?: string | undefined;
    title?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined;
    projectId?: string | undefined;
    assigneeId?: string | undefined;
    estimatedHours?: number | undefined;
    tags?: string[] | undefined;
    actualHours?: number | undefined;
}, {
    status?: "CANCELLED" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | undefined;
    description?: string | undefined;
    dueDate?: string | undefined;
    title?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined;
    projectId?: string | undefined;
    assigneeId?: string | undefined;
    estimatedHours?: number | undefined;
    tags?: string[] | undefined;
    actualHours?: number | undefined;
}>;
export declare const CreateTaskCommentSchema: z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
export declare const CreateBudgetSchema: z.ZodObject<{
    department: z.ZodNativeEnum<{
        readonly ENGINEERING: "ENGINEERING";
        readonly FINANCE: "FINANCE";
        readonly HR: "HR";
        readonly MARKETING: "MARKETING";
        readonly OPERATIONS: "OPERATIONS";
        readonly SALES: "SALES";
        readonly LEGAL: "LEGAL";
        readonly PRODUCT: "PRODUCT";
    }>;
    period: z.ZodNativeEnum<{
        readonly MONTHLY: "MONTHLY";
        readonly QUARTERLY: "QUARTERLY";
        readonly ANNUAL: "ANNUAL";
    }>;
    year: z.ZodNumber;
    month: z.ZodOptional<z.ZodNumber>;
    quarter: z.ZodOptional<z.ZodNumber>;
    allocated: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    department: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT";
    period: "ANNUAL" | "MONTHLY" | "QUARTERLY";
    year: number;
    allocated: number;
    month?: number | undefined;
    quarter?: number | undefined;
}, {
    department: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT";
    period: "ANNUAL" | "MONTHLY" | "QUARTERLY";
    year: number;
    allocated: number;
    month?: number | undefined;
    quarter?: number | undefined;
}>;
export declare const CreatePayrollSchema: z.ZodObject<{
    userId: z.ZodString;
    month: z.ZodNumber;
    year: z.ZodNumber;
    baseSalary: z.ZodNumber;
    allowances: z.ZodDefault<z.ZodNumber>;
    deductions: z.ZodDefault<z.ZodNumber>;
    bonus: z.ZodDefault<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    year: number;
    month: number;
    userId: string;
    baseSalary: number;
    allowances: number;
    deductions: number;
    bonus: number;
    notes?: string | undefined;
}, {
    year: number;
    month: number;
    userId: string;
    baseSalary: number;
    notes?: string | undefined;
    allowances?: number | undefined;
    deductions?: number | undefined;
    bonus?: number | undefined;
}>;
export declare const CreateLeaveSchema: z.ZodEffects<z.ZodObject<{
    type: z.ZodNativeEnum<{
        readonly ANNUAL: "ANNUAL";
        readonly SICK: "SICK";
        readonly MATERNITY: "MATERNITY";
        readonly PATERNITY: "PATERNITY";
        readonly UNPAID: "UNPAID";
        readonly EMERGENCY: "EMERGENCY";
    }>;
    startDate: z.ZodString;
    endDate: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startDate: string;
    endDate: string;
    type: "ANNUAL" | "SICK" | "MATERNITY" | "PATERNITY" | "UNPAID" | "EMERGENCY";
    reason?: string | undefined;
}, {
    startDate: string;
    endDate: string;
    type: "ANNUAL" | "SICK" | "MATERNITY" | "PATERNITY" | "UNPAID" | "EMERGENCY";
    reason?: string | undefined;
}>, {
    startDate: string;
    endDate: string;
    type: "ANNUAL" | "SICK" | "MATERNITY" | "PATERNITY" | "UNPAID" | "EMERGENCY";
    reason?: string | undefined;
}, {
    startDate: string;
    endDate: string;
    type: "ANNUAL" | "SICK" | "MATERNITY" | "PATERNITY" | "UNPAID" | "EMERGENCY";
    reason?: string | undefined;
}>;
export declare const ReviewLeaveSchema: z.ZodObject<{
    status: z.ZodEnum<["APPROVED", "REJECTED"]>;
    rejectionReason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "APPROVED" | "REJECTED";
    rejectionReason?: string | undefined;
}, {
    status: "APPROVED" | "REJECTED";
    rejectionReason?: string | undefined;
}>;
export declare const UpdateFileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    folderPath: z.ZodOptional<z.ZodString>;
    visibility: z.ZodOptional<z.ZodNativeEnum<{
        readonly PUBLIC: "PUBLIC";
        readonly PRIVATE: "PRIVATE";
        readonly TEAM: "TEAM";
        readonly DEPARTMENT: "DEPARTMENT";
    }>>;
    department: z.ZodOptional<z.ZodNativeEnum<{
        readonly ENGINEERING: "ENGINEERING";
        readonly FINANCE: "FINANCE";
        readonly HR: "HR";
        readonly MARKETING: "MARKETING";
        readonly OPERATIONS: "OPERATIONS";
        readonly SALES: "SALES";
        readonly LEGAL: "LEGAL";
        readonly PRODUCT: "PRODUCT";
    }>>;
}, "strip", z.ZodTypeAny, {
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    name?: string | undefined;
    folderPath?: string | undefined;
    visibility?: "PUBLIC" | "PRIVATE" | "TEAM" | "DEPARTMENT" | undefined;
}, {
    department?: "ENGINEERING" | "FINANCE" | "HR" | "MARKETING" | "OPERATIONS" | "SALES" | "LEGAL" | "PRODUCT" | undefined;
    name?: string | undefined;
    folderPath?: string | undefined;
    visibility?: "PUBLIC" | "PRIVATE" | "TEAM" | "DEPARTMENT" | undefined;
}>;
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
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
