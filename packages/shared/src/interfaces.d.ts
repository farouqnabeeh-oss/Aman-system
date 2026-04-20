import type { UserRole, UserStatus, Department, TransactionType, TransactionStatus, InvoiceStatus, TaskStatus, TaskPriority, ProjectStatus, LeaveType, LeaveStatus, AttendanceStatus, NotificationType, FileVisibility, BudgetPeriod, PaymentMethod } from './enums';
export interface IUser {
    id: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    phone: string | null;
    department: Department | null;
    position: string | null;
    emailVerified: boolean;
    lastLoginAt: string | null;
    createdById: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}
export interface IUserWithStats extends IUser {
    tasksCount?: number;
    projectsCount?: number;
    pendingLeaves?: number;
}
export type IUserPublic = Pick<IUser, 'id' | 'firstName' | 'lastName' | 'email' | 'avatarUrl' | 'role' | 'department' | 'position'>;
export interface IAuthTokens {
    accessToken: string;
    expiresIn: number;
}
export interface IJwtPayload {
    sub: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}
export interface IDepartment {
    id: string;
    name: Department;
    description: string | null;
    headId: string | null;
    budget: number;
    createdAt: string;
    updatedAt: string;
}
export interface IBudgetAllocation {
    id: string;
    department: Department;
    period: BudgetPeriod;
    year: number;
    month: number | null;
    quarter: number | null;
    allocated: number;
    spent: number;
    remaining: number;
    utilizationPercent: number;
    createdById: string;
    createdAt: string;
    updatedAt: string;
}
export interface IClient {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    address: string | null;
    taxId: string | null;
    createdById: string;
    createdAt: string;
    updatedAt: string;
}
export interface IInvoiceLineItem {
    id: string;
    invoiceId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    sortOrder: number;
}
export interface IInvoice {
    id: string;
    invoiceNumber: string;
    clientId: string;
    client?: IClient;
    status: InvoiceStatus;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discount: number;
    total: number;
    currency: string;
    notes: string | null;
    dueDate: string;
    issuedAt: string | null;
    paidAt: string | null;
    createdById: string;
    createdAt: string;
    updatedAt: string;
    lineItems?: IInvoiceLineItem[];
}
export interface ITransaction {
    id: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    currency: string;
    description: string;
    category: string;
    department: Department | null;
    reference: string | null;
    paymentMethod: PaymentMethod | null;
    invoiceId: string | null;
    transactionDate: string;
    createdById: string;
    createdBy?: IUserPublic;
    createdAt: string;
    updatedAt: string;
}
export interface IProject {
    id: string;
    name: string;
    description: string | null;
    status: ProjectStatus;
    managerId: string;
    manager?: IUserPublic;
    clientId: string | null;
    client?: IClient;
    department: Department | null;
    startDate: string;
    endDate: string | null;
    budget: number | null;
    progress: number;
    createdById: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    tasksCount?: number;
}
export interface ITask {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    projectId: string;
    project?: Pick<IProject, 'id' | 'name'>;
    assigneeId: string | null;
    assignee?: IUserPublic;
    reporterId: string;
    reporter?: IUserPublic;
    dueDate: string | null;
    completedAt: string | null;
    estimatedHours: number | null;
    actualHours: number | null;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    commentsCount?: number;
}
export interface ITaskComment {
    id: string;
    taskId: string;
    authorId: string;
    author?: IUserPublic;
    content: string;
    createdAt: string;
    updatedAt: string;
}
export interface IFile {
    id: string;
    name: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    storagePath: string;
    publicUrl: string | null;
    folderPath: string;
    visibility: FileVisibility;
    department: Department | null;
    entityType: string | null;
    entityId: string | null;
    uploadedById: string;
    uploadedBy?: IUserPublic;
    createdAt: string;
    deletedAt: string | null;
}
export interface INotification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    actionUrl: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
}
export interface IAuditLog {
    id: string;
    userId: string | null;
    user?: IUserPublic;
    action: string;
    entity: string;
    entityId: string | null;
    oldValues: Record<string, unknown> | null;
    newValues: Record<string, unknown> | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
}
export interface IPayrollRecord {
    id: string;
    userId: string;
    user?: IUserPublic;
    month: number;
    year: number;
    baseSalary: number;
    allowances: number;
    deductions: number;
    bonus: number;
    netSalary: number;
    isPaid: boolean;
    paidAt: string | null;
    notes: string | null;
    processedById: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface ILeaveRequest {
    id: string;
    userId: string;
    user?: IUserPublic;
    type: LeaveType;
    status: LeaveStatus;
    startDate: string;
    endDate: string;
    daysCount: number;
    reason: string | null;
    approvedById: string | null;
    approvedBy?: IUserPublic;
    approvedAt: string | null;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface IAttendanceRecord {
    id: string;
    userId: string;
    user?: IUserPublic;
    date: string;
    status: AttendanceStatus;
    checkIn: string | null;
    checkOut: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface IDashboardKPIs {
    totalRevenue: number;
    revenueGrowth: number;
    activeUsers: number;
    newUsersThisMonth: number;
    pendingTasks: number;
    tasksCompletedThisMonth: number;
    overdueInvoices: number;
    overdueAmount: number;
}
export interface IRevenueDataPoint {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
}
export interface IDepartmentPerformance {
    department: Department;
    budgetAllocated: number;
    budgetSpent: number;
    utilizationPercent: number;
    employeeCount: number;
    activeProjects: number;
}
export interface IRecentActivity {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    user: IUserPublic | null;
    createdAt: string;
}
