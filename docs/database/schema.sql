-- =============================================================================
-- ENTERPRISE MANAGEMENT SYSTEM — SUPABASE POSTGRESQL SCHEMA
-- Version: 1.0.0
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED');
CREATE TYPE department_name AS ENUM ('ENGINEERING', 'FINANCE', 'HR', 'MARKETING', 'OPERATIONS', 'SALES', 'LEGAL', 'PRODUCT');
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER', 'REFUND');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');
CREATE TYPE invoice_status AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED');
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE project_status AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED');
CREATE TYPE leave_type AS ENUM ('ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'EMERGENCY');
CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'REMOTE');
CREATE TYPE notification_type AS ENUM ('INFO', 'WARNING', 'SUCCESS', 'ERROR', 'SYSTEM');
CREATE TYPE file_visibility AS ENUM ('PUBLIC', 'PRIVATE', 'TEAM', 'DEPARTMENT');
CREATE TYPE budget_period AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL');
CREATE TYPE payment_method AS ENUM ('BANK_TRANSFER', 'CREDIT_CARD', 'CASH', 'CHECK', 'DIGITAL_WALLET');

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: users
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  role            user_role NOT NULL DEFAULT 'EMPLOYEE',
  status          user_status NOT NULL DEFAULT 'PENDING',
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  avatar_url      TEXT,
  phone           TEXT,
  department      department_name,
  position        TEXT,
  refresh_token   TEXT,
  email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  email_verify_token TEXT,
  pw_reset_token  TEXT,
  pw_reset_expires TIMESTAMPTZ,
  last_login_at   TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: departments
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE departments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        department_name NOT NULL UNIQUE,
  description TEXT,
  head_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  budget      NUMERIC(15, 2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_departments_head ON departments(head_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: budget_allocations
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE budget_allocations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department    department_name NOT NULL,
  period        budget_period NOT NULL DEFAULT 'MONTHLY',
  year          SMALLINT NOT NULL,
  month         SMALLINT,   -- NULL for quarterly/annual
  quarter       SMALLINT,   -- NULL for monthly/annual
  allocated     NUMERIC(15, 2) NOT NULL DEFAULT 0,
  spent         NUMERIC(15, 2) NOT NULL DEFAULT 0,
  created_by    UUID NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_budget_month CHECK (month IS NULL OR (month >= 1 AND month <= 12)),
  CONSTRAINT chk_budget_quarter CHECK (quarter IS NULL OR (quarter >= 1 AND quarter <= 4))
);

CREATE INDEX idx_budget_dept_period ON budget_allocations(department, period, year);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: transactions
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type            transaction_type NOT NULL,
  status          transaction_status NOT NULL DEFAULT 'COMPLETED',
  amount          NUMERIC(15, 2) NOT NULL,
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  description     TEXT NOT NULL,
  category        TEXT NOT NULL,
  department      department_name,
  reference       TEXT,
  payment_method  payment_method,
  invoice_id      UUID,   -- FK added after invoices table
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_dept ON transactions(department);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: clients (for invoicing)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE clients (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE,
  phone       TEXT,
  company     TEXT,
  address     TEXT,
  tax_id      TEXT,
  created_by  UUID NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_company ON clients(company);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: invoices
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number  TEXT NOT NULL UNIQUE,
  client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  status          invoice_status NOT NULL DEFAULT 'DRAFT',
  subtotal        NUMERIC(15, 2) NOT NULL DEFAULT 0,
  tax_rate        NUMERIC(5, 2) NOT NULL DEFAULT 0,    -- percentage
  tax_amount      NUMERIC(15, 2) NOT NULL DEFAULT 0,
  discount        NUMERIC(15, 2) NOT NULL DEFAULT 0,
  total           NUMERIC(15, 2) NOT NULL DEFAULT 0,
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  notes           TEXT,
  due_date        TIMESTAMPTZ NOT NULL,
  issued_at       TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,
  created_by      UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: invoice_line_items
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE invoice_line_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id  UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity    NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_price  NUMERIC(15, 2) NOT NULL,
  total       NUMERIC(15, 2) NOT NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_line_items_invoice ON invoice_line_items(invoice_id);

-- Now add FK from transactions to invoices
ALTER TABLE transactions
  ADD CONSTRAINT fk_transactions_invoice
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;

CREATE INDEX idx_transactions_invoice ON transactions(invoice_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: projects
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  status      project_status NOT NULL DEFAULT 'PLANNING',
  manager_id  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  department  department_name,
  start_date  TIMESTAMPTZ NOT NULL,
  end_date    TIMESTAMPTZ,
  budget      NUMERIC(15, 2),
  progress    SMALLINT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_by  UUID NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ,

  CONSTRAINT chk_project_dates CHECK (end_date IS NULL OR end_date > start_date)
);

CREATE INDEX idx_projects_manager ON projects(manager_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_dept ON projects(department);
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: tasks
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  status      task_status NOT NULL DEFAULT 'TODO',
  priority    task_priority NOT NULL DEFAULT 'MEDIUM',
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reporter_id UUID NOT NULL REFERENCES users(id),
  due_date    TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_hours NUMERIC(6, 2),
  actual_hours    NUMERIC(6, 2),
  tags        TEXT[],
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: task_comments
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE task_comments (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id   UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_comments_task ON task_comments(task_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: files
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE files (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  original_name   TEXT NOT NULL,
  mime_type       TEXT NOT NULL,
  size_bytes      BIGINT NOT NULL,
  storage_path    TEXT NOT NULL,   -- path in Supabase Storage
  public_url      TEXT,
  folder_path     TEXT NOT NULL DEFAULT '/',
  visibility      file_visibility NOT NULL DEFAULT 'PRIVATE',
  department      department_name,
  entity_type     TEXT,   -- polymorphic: 'project', 'task', 'user', etc.
  entity_id       UUID,
  uploaded_by     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_files_uploader ON files(uploaded_by);
CREATE INDEX idx_files_folder ON files(folder_path);
CREATE INDEX idx_files_entity ON files(entity_type, entity_id);
CREATE INDEX idx_files_visibility ON files(visibility);
CREATE INDEX idx_files_dept ON files(department);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: file_permissions
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE file_permissions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id     UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  can_view    BOOLEAN NOT NULL DEFAULT TRUE,
  can_download BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete  BOOLEAN NOT NULL DEFAULT FALSE,
  granted_by  UUID NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_file_permission UNIQUE (file_id, user_id)
);

CREATE INDEX idx_file_perms_file ON file_permissions(file_id);
CREATE INDEX idx_file_perms_user ON file_permissions(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: notifications
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL DEFAULT 'INFO',
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  action_url  TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: audit_logs
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,   -- CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT
  entity      TEXT NOT NULL,   -- table/resource name
  entity_id   UUID,
  old_values  JSONB,
  new_values  JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create initial partition for current year
CREATE TABLE audit_logs_2026 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

CREATE TABLE audit_logs_2027 PARTITION OF audit_logs
  FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: payroll_records
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE payroll_records (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  month         SMALLINT NOT NULL CHECK (month >= 1 AND month <= 12),
  year          SMALLINT NOT NULL,
  base_salary   NUMERIC(15, 2) NOT NULL,
  allowances    NUMERIC(15, 2) NOT NULL DEFAULT 0,
  deductions    NUMERIC(15, 2) NOT NULL DEFAULT 0,
  bonus         NUMERIC(15, 2) NOT NULL DEFAULT 0,
  net_salary    NUMERIC(15, 2) NOT NULL,
  is_paid       BOOLEAN NOT NULL DEFAULT FALSE,
  paid_at       TIMESTAMPTZ,
  notes         TEXT,
  processed_by  UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_payroll_user_month UNIQUE (user_id, month, year)
);

CREATE INDEX idx_payroll_user ON payroll_records(user_id);
CREATE INDEX idx_payroll_period ON payroll_records(year, month);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: leave_requests
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE leave_requests (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          leave_type NOT NULL,
  status        leave_status NOT NULL DEFAULT 'PENDING',
  start_date    TIMESTAMPTZ NOT NULL,
  end_date      TIMESTAMPTZ NOT NULL,
  days_count    NUMERIC(5, 1) NOT NULL,
  reason        TEXT,
  approved_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at   TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_leave_dates CHECK (end_date >= start_date),
  CONSTRAINT chk_leave_days CHECK (days_count > 0)
);

CREATE INDEX idx_leave_user ON leave_requests(user_id);
CREATE INDEX idx_leave_status ON leave_requests(status);
CREATE INDEX idx_leave_dates ON leave_requests(start_date, end_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: attendance_records
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE attendance_records (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  status      attendance_status NOT NULL DEFAULT 'PRESENT',
  check_in    TIMESTAMPTZ,
  check_out   TIMESTAMPTZ,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_attendance_user_date UNIQUE (user_id, date)
);

CREATE INDEX idx_attendance_user ON attendance_records(user_id);
CREATE INDEX idx_attendance_date ON attendance_records(date);

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGER: auto-update updated_at
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_budget_updated_at BEFORE UPDATE ON budget_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_task_comments_updated_at BEFORE UPDATE ON task_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_payroll_updated_at BEFORE UPDATE ON payroll_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_leave_updated_at BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_attendance_updated_at BEFORE UPDATE ON attendance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function: check if user is admin or above
CREATE OR REPLACE FUNCTION is_admin_or_above()
RETURNS BOOLEAN AS $$
  SELECT auth_user_role() IN ('SUPER_ADMIN', 'ADMIN')
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function: check if manager or above
CREATE OR REPLACE FUNCTION is_manager_or_above()
RETURNS BOOLEAN AS $$
  SELECT auth_user_role() IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER')
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ── users RLS ──
CREATE POLICY users_select ON users FOR SELECT
  USING (deleted_at IS NULL AND (id = auth.uid() OR is_manager_or_above()));

CREATE POLICY users_insert ON users FOR INSERT
  WITH CHECK (is_admin_or_above());

CREATE POLICY users_update ON users FOR UPDATE
  USING (id = auth.uid() OR is_admin_or_above());

CREATE POLICY users_delete ON users FOR DELETE
  USING (is_admin_or_above());

-- ── departments RLS ──
CREATE POLICY dept_select ON departments FOR SELECT
  USING (TRUE);   -- all authenticated can view

CREATE POLICY dept_insert ON departments FOR INSERT
  WITH CHECK (is_admin_or_above());

CREATE POLICY dept_update ON departments FOR UPDATE
  USING (is_admin_or_above());

CREATE POLICY dept_delete ON departments FOR DELETE
  USING (auth_user_role() = 'SUPER_ADMIN');

-- ── budget_allocations RLS ──
CREATE POLICY budget_select ON budget_allocations FOR SELECT
  USING (is_manager_or_above());

CREATE POLICY budget_insert ON budget_allocations FOR INSERT
  WITH CHECK (is_admin_or_above());

CREATE POLICY budget_mutate ON budget_allocations FOR UPDATE
  USING (is_admin_or_above());

-- ── transactions RLS ──
CREATE POLICY tx_select ON transactions FOR SELECT
  USING (is_manager_or_above() OR created_by = auth.uid());

CREATE POLICY tx_insert ON transactions FOR INSERT
  WITH CHECK (is_manager_or_above());

CREATE POLICY tx_update ON transactions FOR UPDATE
  USING (is_admin_or_above());

CREATE POLICY tx_delete ON transactions FOR DELETE
  USING (is_admin_or_above());

-- ── clients RLS ──
CREATE POLICY clients_select ON clients FOR SELECT
  USING (is_manager_or_above());

CREATE POLICY clients_insert ON clients FOR INSERT
  WITH CHECK (is_manager_or_above());

CREATE POLICY clients_update ON clients FOR UPDATE
  USING (is_manager_or_above());

CREATE POLICY clients_delete ON clients FOR DELETE
  USING (is_admin_or_above());

-- ── invoices RLS ──
CREATE POLICY invoices_select ON invoices FOR SELECT
  USING (is_manager_or_above() OR created_by = auth.uid());

CREATE POLICY invoices_insert ON invoices FOR INSERT
  WITH CHECK (is_manager_or_above());

CREATE POLICY invoices_update ON invoices FOR UPDATE
  USING (is_manager_or_above() AND (created_by = auth.uid() OR is_admin_or_above()));

CREATE POLICY invoices_delete ON invoices FOR DELETE
  USING (is_admin_or_above());

-- ── invoice_line_items RLS ──
CREATE POLICY line_items_all ON invoice_line_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_id
        AND (i.created_by = auth.uid() OR is_manager_or_above())
    )
  );

-- ── projects RLS ──
CREATE POLICY projects_select ON projects FOR SELECT
  USING (
    deleted_at IS NULL AND (
      manager_id = auth.uid()
      OR is_manager_or_above()
      OR EXISTS (
        SELECT 1 FROM tasks t WHERE t.project_id = projects.id AND t.assignee_id = auth.uid()
      )
    )
  );

CREATE POLICY projects_insert ON projects FOR INSERT
  WITH CHECK (is_manager_or_above());

CREATE POLICY projects_update ON projects FOR UPDATE
  USING (manager_id = auth.uid() OR is_admin_or_above());

CREATE POLICY projects_delete ON projects FOR DELETE
  USING (is_admin_or_above());

-- ── tasks RLS ──
CREATE POLICY tasks_select ON tasks FOR SELECT
  USING (
    deleted_at IS NULL AND (
      assignee_id = auth.uid()
      OR reporter_id = auth.uid()
      OR is_manager_or_above()
    )
  );

CREATE POLICY tasks_insert ON tasks FOR INSERT
  WITH CHECK (is_manager_or_above() OR reporter_id = auth.uid());

CREATE POLICY tasks_update ON tasks FOR UPDATE
  USING (
    assignee_id = auth.uid()
    OR reporter_id = auth.uid()
    OR is_manager_or_above()
  );

CREATE POLICY tasks_delete ON tasks FOR DELETE
  USING (reporter_id = auth.uid() OR is_admin_or_above());

-- ── task_comments RLS ──
CREATE POLICY comments_select ON task_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_id
        AND (t.assignee_id = auth.uid() OR t.reporter_id = auth.uid() OR is_manager_or_above())
    )
  );

CREATE POLICY comments_insert ON task_comments FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY comments_update ON task_comments FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY comments_delete ON task_comments FOR DELETE
  USING (author_id = auth.uid() OR is_admin_or_above());

-- ── files RLS ──
CREATE POLICY files_select ON files FOR SELECT
  USING (
    deleted_at IS NULL AND (
      uploaded_by = auth.uid()
      OR visibility = 'PUBLIC'
      OR is_admin_or_above()
      OR (visibility = 'DEPARTMENT' AND department = (SELECT department FROM users WHERE id = auth.uid()))
      OR EXISTS (SELECT 1 FROM file_permissions fp WHERE fp.file_id = files.id AND fp.user_id = auth.uid() AND fp.can_view = TRUE)
    )
  );

CREATE POLICY files_insert ON files FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY files_update ON files FOR UPDATE
  USING (uploaded_by = auth.uid() OR is_admin_or_above());

CREATE POLICY files_delete ON files FOR DELETE
  USING (
    uploaded_by = auth.uid()
    OR is_admin_or_above()
    OR EXISTS (SELECT 1 FROM file_permissions fp WHERE fp.file_id = files.id AND fp.user_id = auth.uid() AND fp.can_delete = TRUE)
  );

-- ── notifications RLS ──
CREATE POLICY notifications_select ON notifications FOR SELECT
  USING (user_id = auth.uid() OR is_admin_or_above());

CREATE POLICY notifications_update ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY notifications_delete ON notifications FOR DELETE
  USING (user_id = auth.uid() OR is_admin_or_above());

-- ── audit_logs RLS ──
CREATE POLICY audit_select ON audit_logs FOR SELECT
  USING (is_admin_or_above() OR user_id = auth.uid());

CREATE POLICY audit_insert ON audit_logs FOR INSERT
  WITH CHECK (TRUE);   -- all authenticated users, done by service role

-- ── payroll_records RLS ──
CREATE POLICY payroll_select ON payroll_records FOR SELECT
  USING (user_id = auth.uid() OR is_admin_or_above());

CREATE POLICY payroll_insert ON payroll_records FOR INSERT
  WITH CHECK (is_admin_or_above());

CREATE POLICY payroll_update ON payroll_records FOR UPDATE
  USING (is_admin_or_above());

-- ── leave_requests RLS ──
CREATE POLICY leave_select ON leave_requests FOR SELECT
  USING (user_id = auth.uid() OR is_manager_or_above());

CREATE POLICY leave_insert ON leave_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY leave_update ON leave_requests FOR UPDATE
  USING (
    (user_id = auth.uid() AND status = 'PENDING')
    OR is_manager_or_above()
  );

CREATE POLICY leave_delete ON leave_requests FOR DELETE
  USING (user_id = auth.uid() AND status = 'PENDING');

-- ── attendance_records RLS ──
CREATE POLICY attendance_select ON attendance_records FOR SELECT
  USING (user_id = auth.uid() OR is_manager_or_above());

CREATE POLICY attendance_insert ON attendance_records FOR INSERT
  WITH CHECK (user_id = auth.uid() OR is_manager_or_above());

CREATE POLICY attendance_update ON attendance_records FOR UPDATE
  USING (is_manager_or_above());
