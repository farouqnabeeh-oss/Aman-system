# EMS — Enterprise Management System

A production-grade, full-stack monorepo for managing Corporate Operations.

## 🚀 Architecture
- **Root**: Pnpm Workspaces + Turborepo
- **Apps/API**: NestJS + Prisma + Passport JWT
- **Apps/Web**: React + Vite + Tailwind + TanStack Query + Zustand
- **Packages/Shared**: Zod Schemas + TypeScript Interfaces (Single source of truth)

## 🛠 Features
- **Auth**: Secure JWT flow with Refresh Tokens (HttpOnly cookies).
- **Dashboard**: Real-time KPIs, Revenue/Expense charts (Recharts), and Activity tracking.
- **Finance**: Transactions, Invoices, Budget utilization, and Client management.
- **Projects & Tasks**: Kanban board, Progress tracking, and Multi-user assignment.
- **HR & Payroll**: Leave management, Attendance (Check-in/out), and processed Payroll history.
- **File Management**: Upload/Download with local storage and Audit logging.
- **Notifications**: Integrated system alerts and real-time read/unread status.

## 🏁 Quick Start

### 1. Prerequisites
- Node.js 18+
- pnpm 9.x (`npm install -g pnpm`)

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Database Setup
```bash
# Generate Prisma Client
pnpm db:generate

# Run Migrations (Creates SQLite DB)
pnpm db:migrate

# Seed the database with demo accounts & 12 months of data
pnpm db:seed
```

### 4. Start Development
```bash
pnpm dev
```
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/v1
- **Swagger Docs**: http://localhost:5000/api/docs

## 🔑 Test Credentials
| Email | Password | Role |
| :--- | :--- | :--- |
| `superadmin@ems.dev` | `Password123!` | SUPER\_ADMIN |
| `admin@ems.dev` | `Password123!` | ADMIN |
| `manager.eng@ems.dev`| `Password123!` | MANAGER |
| `emp1@ems.dev` | `Password123!` | EMPLOYEE |

## 📁 System Folders
- `apps/api/uploads`: Local storage for uploaded files.
- `apps/api/prisma/dev.db`: SQLite database file.
- `packages/shared/src`: Shared validation and business logic.
