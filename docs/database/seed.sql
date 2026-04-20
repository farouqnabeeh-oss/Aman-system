-- =============================================================================
-- ENTERPRISE MANAGEMENT SYSTEM — SEED DATA
-- Run AFTER schema.sql
-- Passwords are all: "Password123!" (bcrypt hash below)
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- USERS (seeded directly; in prod these flow through auth API)
-- password_hash = bcrypt("Password123!", 12)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO users (id, email, password_hash, role, status, first_name, last_name, department, position, email_verified) VALUES
('00000000-0000-0000-0000-000000000001', 'superadmin@ems.dev',  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewm7OUGF9yIPMzXS', 'SUPER_ADMIN', 'ACTIVE', 'Alex',    'Chen',       'ENGINEERING',  'CTO',                   TRUE),
('00000000-0000-0000-0000-000000000002', 'admin@ems.dev',       '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewm7OUGF9yIPMzXS', 'ADMIN',       'ACTIVE', 'Sarah',   'Johnson',    'HR',           'HR Director',           TRUE),
('00000000-0000-0000-0000-000000000003', 'manager.eng@ems.dev', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewm7OUGF9yIPMzXS', 'MANAGER',     'ACTIVE', 'Marcus',  'Williams',   'ENGINEERING',  'Engineering Manager',   TRUE),
('00000000-0000-0000-0000-000000000004', 'manager.fin@ems.dev', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewm7OUGF9yIPMzXS', 'MANAGER',     'ACTIVE', 'Julia',   'Martinez',   'FINANCE',      'Finance Manager',       TRUE),
('00000000-0000-0000-0000-000000000005', 'emp1@ems.dev',        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewm7OUGF9yIPMzXS', 'EMPLOYEE',    'ACTIVE', 'David',   'Kim',        'ENGINEERING',  'Senior Full-Stack Dev', TRUE),
('00000000-0000-0000-0000-000000000006', 'emp2@ems.dev',        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewm7OUGF9yIPMzXS', 'EMPLOYEE',    'ACTIVE', 'Emily',   'Rodriguez',  'MARKETING',    'Marketing Specialist',  TRUE),
('00000000-0000-0000-0000-000000000007', 'emp3@ems.dev',        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewm7OUGF9yIPMzXS', 'EMPLOYEE',    'ACTIVE', 'James',   'Thompson',   'SALES',        'Sales Representative',  TRUE),
('00000000-0000-0000-0000-000000000008', 'emp4@ems.dev',        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewm7OUGF9yIPMzXS', 'EMPLOYEE',    'INACTIVE','Olivia',  'Brown',      'OPERATIONS',   'Operations Analyst',    TRUE),
('00000000-0000-0000-0000-000000000009', 'manager.sales@ems.dev','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewm7OUGF9yIPMzXS','MANAGER',    'ACTIVE', 'Noah',    'Garcia',     'SALES',        'Sales Manager',         TRUE),
('00000000-0000-0000-0000-000000000010', 'emp5@ems.dev',        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewm7OUGF9yIPMzXS', 'EMPLOYEE',    'ACTIVE', 'Sophia',  'Patel',      'PRODUCT',      'Product Designer',      TRUE);

-- ─────────────────────────────────────────────────────────────────────────────
-- DEPARTMENTS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO departments (name, description, head_id, budget) VALUES
('ENGINEERING',  'Software engineering and infrastructure',  '00000000-0000-0000-0000-000000000003', 500000),
('FINANCE',      'Financial planning and analysis',          '00000000-0000-0000-0000-000000000004', 200000),
('HR',           'Human resources and people operations',    '00000000-0000-0000-0000-000000000002', 150000),
('MARKETING',    'Brand and growth marketing',               '00000000-0000-0000-0000-000000000006', 180000),
('OPERATIONS',   'Business operations and logistics',        '00000000-0000-0000-0000-000000000008', 120000),
('SALES',        'Sales and business development',           '00000000-0000-0000-0000-000000000009', 250000),
('PRODUCT',      'Product management and design',            '00000000-0000-0000-0000-000000000010', 130000),
('LEGAL',        'Legal and compliance',                     NULL,                                    80000);

-- ─────────────────────────────────────────────────────────────────────────────
-- BUDGET ALLOCATIONS (last 12 months — 2025 + 2026)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO budget_allocations (department, period, year, month, allocated, spent, created_by) VALUES
('ENGINEERING',  'MONTHLY', 2026, 4,  42000, 38500, '00000000-0000-0000-0000-000000000001'),
('ENGINEERING',  'MONTHLY', 2026, 3,  42000, 41200, '00000000-0000-0000-0000-000000000001'),
('ENGINEERING',  'MONTHLY', 2026, 2,  42000, 39800, '00000000-0000-0000-0000-000000000001'),
('FINANCE',      'MONTHLY', 2026, 4,  16000, 12400, '00000000-0000-0000-0000-000000000001'),
('FINANCE',      'MONTHLY', 2026, 3,  16000, 15900, '00000000-0000-0000-0000-000000000001'),
('HR',           'MONTHLY', 2026, 4,  12500, 10200, '00000000-0000-0000-0000-000000000001'),
('MARKETING',    'MONTHLY', 2026, 4,  15000, 14700, '00000000-0000-0000-0000-000000000001'),
('SALES',        'MONTHLY', 2026, 4,  20000, 18300, '00000000-0000-0000-0000-000000000001'),
('PRODUCT',      'MONTHLY', 2026, 4,  10800, 9100,  '00000000-0000-0000-0000-000000000001'),
('OPERATIONS',   'MONTHLY', 2026, 4,  10000, 7800,  '00000000-0000-0000-0000-000000000001');

-- ─────────────────────────────────────────────────────────────────────────────
-- CLIENTS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO clients (id, name, email, phone, company, address, created_by) VALUES
('c0000000-0000-0000-0000-000000000001', 'TechCorp Inc.',       'billing@techcorp.io',    '+1-555-0101', 'TechCorp Incorporated',    '123 Innovation Dr, San Francisco, CA', '00000000-0000-0000-0000-000000000001'),
('c0000000-0000-0000-0000-000000000002', 'Nexus Digital',       'finance@nexusdigital.com','+1-555-0202', 'Nexus Digital LLC',        '456 Commerce Blvd, Austin, TX',        '00000000-0000-0000-0000-000000000001'),
('c0000000-0000-0000-0000-000000000003', 'GlobalRetail Group',  'ap@globalretail.com',    '+1-555-0303', 'GlobalRetail Group PLC',   '789 Market St, New York, NY',          '00000000-0000-0000-0000-000000000004'),
('c0000000-0000-0000-0000-000000000004', 'Orion Ventures',      'accounting@orion.vc',    '+1-555-0404', 'Orion Ventures Partners',  '321 Capital Ave, Boston, MA',          '00000000-0000-0000-0000-000000000004');

-- ─────────────────────────────────────────────────────────────────────────────
-- INVOICES
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO invoices (id, invoice_number, client_id, status, subtotal, tax_rate, tax_amount, discount, total, due_date, issued_at, paid_at, created_by) VALUES
('i0000000-0000-0000-0000-000000000001', 'INV-2026-0001', 'c0000000-0000-0000-0000-000000000001', 'PAID',    12000, 10, 1200, 0,    13200, '2026-02-28', '2026-02-01', '2026-02-25', '00000000-0000-0000-0000-000000000004'),
('i0000000-0000-0000-0000-000000000002', 'INV-2026-0002', 'c0000000-0000-0000-0000-000000000002', 'PAID',    8500,  10, 850,  500,   8850, '2026-03-15', '2026-03-01', '2026-03-12', '00000000-0000-0000-0000-000000000004'),
('i0000000-0000-0000-0000-000000000003', 'INV-2026-0003', 'c0000000-0000-0000-0000-000000000003', 'SENT',    22000, 15, 3300, 1000, 24300, '2026-05-01', '2026-04-10', NULL,         '00000000-0000-0000-0000-000000000004'),
('i0000000-0000-0000-0000-000000000004', 'INV-2026-0004', 'c0000000-0000-0000-0000-000000000004', 'DRAFT',   6000,  10, 600,  0,    6600,  '2026-06-01', NULL,         NULL,         '00000000-0000-0000-0000-000000000004'),
('i0000000-0000-0000-0000-000000000005', 'INV-2026-0005', 'c0000000-0000-0000-0000-000000000001', 'OVERDUE', 15000, 10, 1500, 0,   16500, '2026-04-01', '2026-03-15', NULL,         '00000000-0000-0000-0000-000000000004');

INSERT INTO invoice_line_items (invoice_id, description, quantity, unit_price, total, sort_order) VALUES
('i0000000-0000-0000-0000-000000000001', 'Software Development Services - Q1', 1, 10000, 10000, 0),
('i0000000-0000-0000-0000-000000000001', 'Cloud Infrastructure Setup',          2,  1000,  2000, 1),
('i0000000-0000-0000-0000-000000000002', 'UI/UX Design Consulting',            10,   850,  8500, 0),
('i0000000-0000-0000-0000-000000000003', 'Enterprise Platform License',         1, 18000, 18000, 0),
('i0000000-0000-0000-0000-000000000003', 'Implementation & Onboarding',         1,  4000,  4000, 1),
('i0000000-0000-0000-0000-000000000004', 'API Integration Services',           20,   300,  6000, 0),
('i0000000-0000-0000-0000-000000000005', 'Annual Support Contract',             1, 12000, 12000, 0),
('i0000000-0000-0000-0000-000000000005', 'Priority SLA Add-on',                 1,  3000,  3000, 1);

-- ─────────────────────────────────────────────────────────────────────────────
-- TRANSACTIONS (12 months of realistic data)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO transactions (type, status, amount, description, category, department, reference, payment_method, transaction_date, created_by) VALUES
-- INCOME
('INCOME',  'COMPLETED', 156000, 'Q1 Enterprise License Revenue',     'Revenue',         NULL,          'Q1-ENT-2026',  'BANK_TRANSFER',   '2026-01-31', '00000000-0000-0000-0000-000000000004'),
('INCOME',  'COMPLETED', 23500,  'TechCorp Consulting Services',      'Consulting',      NULL,          'INV-2026-0001','BANK_TRANSFER',   '2026-02-25', '00000000-0000-0000-0000-000000000004'),
('INCOME',  'COMPLETED', 98700,  'Nexus Digital SaaS Subscription',   'Subscriptions',   NULL,          'SUB-Q1-2026',  'CREDIT_CARD',     '2026-03-01', '00000000-0000-0000-0000-000000000004'),
('INCOME',  'COMPLETED', 8850,   'Nexus UI/UX Payment',               'Consulting',      NULL,          'INV-2026-0002','BANK_TRANSFER',   '2026-03-12', '00000000-0000-0000-0000-000000000004'),
('INCOME',  'COMPLETED', 42000,  'GlobalRetail API Integration',      'Professional Fees',NULL,         'PO-2026-031',  'BANK_TRANSFER',   '2026-03-28', '00000000-0000-0000-0000-000000000004'),
('INCOME',  'COMPLETED', 175000, 'Q2 Platform Revenue - April',       'Revenue',         NULL,          'Q2-2026-APR',  'BANK_TRANSFER',   '2026-04-15', '00000000-0000-0000-0000-000000000004'),
-- EXPENSES
('EXPENSE', 'COMPLETED', 38500,  'Engineering Payroll - April',       'Payroll',         'ENGINEERING', 'PAY-APR-ENG',  'BANK_TRANSFER',   '2026-04-01', '00000000-0000-0000-0000-000000000004'),
('EXPENSE', 'COMPLETED', 12400,  'Finance Team Payroll - April',      'Payroll',         'FINANCE',     'PAY-APR-FIN',  'BANK_TRANSFER',   '2026-04-01', '00000000-0000-0000-0000-000000000004'),
('EXPENSE', 'COMPLETED', 8500,   'AWS Cloud Infrastructure',          'Infrastructure',  'ENGINEERING', 'AWS-APR-2026', 'CREDIT_CARD',     '2026-04-05', '00000000-0000-0000-0000-000000000004'),
('EXPENSE', 'COMPLETED', 4200,   'Office Supplies & Equipment',       'Operations',      'OPERATIONS',  'SUP-APR-2026', 'CREDIT_CARD',     '2026-04-08', '00000000-0000-0000-0000-000000000004'),
('EXPENSE', 'COMPLETED', 14700,  'Marketing Campaign - April',        'Marketing',       'MARKETING',   'MKT-APR-2026', 'CREDIT_CARD',     '2026-04-10', '00000000-0000-0000-0000-000000000004'),
('EXPENSE', 'COMPLETED', 3800,   'SaaS Tools & Licenses',             'Software',        'ENGINEERING', 'LIC-APR-2026', 'CREDIT_CARD',     '2026-04-12', '00000000-0000-0000-0000-000000000004'),
('EXPENSE', 'COMPLETED', 9100,   'Product Team Costs - April',        'Payroll',         'PRODUCT',     'PAY-APR-PRD',  'BANK_TRANSFER',   '2026-04-01', '00000000-0000-0000-0000-000000000004'),
('EXPENSE', 'COMPLETED', 18300,  'Sales Commission & Costs',          'Sales Costs',     'SALES',       'SAL-APR-2026', 'BANK_TRANSFER',   '2026-04-15', '00000000-0000-0000-0000-000000000004'),
('EXPENSE', 'COMPLETED', 7800,   'Operations Overhead - April',       'Operations',      'OPERATIONS',  'OPS-APR-2026', 'BANK_TRANSFER',   '2026-04-01', '00000000-0000-0000-0000-000000000004'),
-- Previous months for charts
('INCOME',  'COMPLETED', 142000, 'January Total Revenue',             'Revenue',  NULL, NULL, 'BANK_TRANSFER', '2026-01-31', '00000000-0000-0000-0000-000000000004'),
('INCOME',  'COMPLETED', 158000, 'February Total Revenue',            'Revenue',  NULL, NULL, 'BANK_TRANSFER', '2026-02-28', '00000000-0000-0000-0000-000000000004'),
('INCOME',  'COMPLETED', 165000, 'March Total Revenue',               'Revenue',  NULL, NULL, 'BANK_TRANSFER', '2026-03-31', '00000000-0000-0000-0000-000000000004'),
('INCOME',  'COMPLETED', 118000, 'December 2025 Revenue',             'Revenue',  NULL, NULL, 'BANK_TRANSFER', '2025-12-31', '00000000-0000-0000-0000-000000000004'),
('INCOME',  'COMPLETED', 125000, 'November 2025 Revenue',             'Revenue',  NULL, NULL, 'BANK_TRANSFER', '2025-11-30', '00000000-0000-0000-0000-000000000004'),
('INCOME',  'COMPLETED', 132000, 'October 2025 Revenue',              'Revenue',  NULL, NULL, 'BANK_TRANSFER', '2025-10-31', '00000000-0000-0000-0000-000000000004'),
('INCOME',  'COMPLETED', 128000, 'September 2025 Revenue',            'Revenue',  NULL, NULL, 'BANK_TRANSFER', '2025-09-30', '00000000-0000-0000-0000-000000000004'),
('INCOME',  'COMPLETED', 115000, 'August 2025 Revenue',               'Revenue',  NULL, NULL, 'BANK_TRANSFER', '2025-08-31', '00000000-0000-0000-0000-000000000004'),
('INCOME',  'COMPLETED', 109000, 'July 2025 Revenue',                 'Revenue',  NULL, NULL, 'BANK_TRANSFER', '2025-07-31', '00000000-0000-0000-0000-000000000004'),
('INCOME',  'COMPLETED', 98000,  'June 2025 Revenue',                 'Revenue',  NULL, NULL, 'BANK_TRANSFER', '2025-06-30', '00000000-0000-0000-0000-000000000004'),
('INCOME',  'COMPLETED', 95000,  'May 2025 Revenue',                  'Revenue',  NULL, NULL, 'BANK_TRANSFER', '2025-05-31', '00000000-0000-0000-0000-000000000004');

-- ─────────────────────────────────────────────────────────────────────────────
-- PROJECTS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO projects (id, name, description, status, manager_id, client_id, department, start_date, end_date, budget, progress, created_by) VALUES
('p0000000-0000-0000-0000-000000000001', 'EMS Portal v2.0',           'Internal enterprise management system rebuild',    'ACTIVE',    '00000000-0000-0000-0000-000000000003', NULL,                                       'ENGINEERING',  '2026-01-01', '2026-06-30', 120000, 65, '00000000-0000-0000-0000-000000000001'),
('p0000000-0000-0000-0000-000000000002', 'TechCorp Integration',      'Full API integration for TechCorp platform',       'ACTIVE',    '00000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001',  'ENGINEERING',  '2026-02-15', '2026-05-31', 45000,  40, '00000000-0000-0000-0000-000000000001'),
('p0000000-0000-0000-0000-000000000003', 'Q2 Marketing Campaign',     'Multi-channel digital marketing push for Q2',      'ACTIVE',    '00000000-0000-0000-0000-000000000009', NULL,                                       'MARKETING',    '2026-04-01', '2026-06-30', 30000,  20, '00000000-0000-0000-0000-000000000002'),
('p0000000-0000-0000-0000-000000000004', 'GlobalRetail Enterprise',   'Enterprise license implementation & onboarding',   'PLANNING',  '00000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003',  'ENGINEERING',  '2026-05-01', '2026-09-30', 80000,  5,  '00000000-0000-0000-0000-000000000001'),
('p0000000-0000-0000-0000-000000000005', 'Financial System Upgrade',  'Upgrade legacy financial reporting infrastructure', 'COMPLETED', '00000000-0000-0000-0000-000000000004', NULL,                                       'FINANCE',      '2025-10-01', '2026-01-31', 25000,  100,'00000000-0000-0000-0000-000000000001');

-- ─────────────────────────────────────────────────────────────────────────────
-- TASKS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO tasks (title, description, status, priority, project_id, assignee_id, reporter_id, due_date, estimated_hours, tags) VALUES
('Set up project repositories',  'Initialize Git monorepo with CI/CD pipelines',       'DONE',        'HIGH',     'p0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', '2026-01-15', 8,  ARRAY['infrastructure','devops']),
('Design database schema',       'Define all production DB tables and RLS policies',   'DONE',        'CRITICAL', 'p0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', '2026-01-20', 16, ARRAY['database','architecture']),
('Build auth module',            'JWT auth with refresh tokens and role guards',        'DONE',        'CRITICAL', 'p0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', '2026-02-01', 24, ARRAY['auth','backend']),
('Dashboard analytics API',      'Build KPI aggregation endpoints for dashboard',      'IN_PROGRESS', 'HIGH',     'p0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', '2026-04-25', 20, ARRAY['analytics','api']),
('Frontend dashboard page',      'Build interactive dashboard with Recharts',           'IN_PROGRESS', 'HIGH',     'p0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000003', '2026-04-28', 32, ARRAY['frontend','charts']),
('User management CRUD',         'Complete user admin panel with bulk actions',         'IN_REVIEW',   'MEDIUM',   'p0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', '2026-04-30', 28, ARRAY['users','admin']),
('File upload service',          'Implement file upload to storage with previews',      'TODO',        'MEDIUM',   'p0000000-0000-0000-0000-000000000001', NULL,                                   '00000000-0000-0000-0000-000000000003', '2026-05-10', 16, ARRAY['files','storage']),
('TechCorp OAuth setup',         'Set up OAuth2 integration with TechCorp IdP',         'IN_PROGRESS', 'HIGH',     'p0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', '2026-04-22', 12, ARRAY['oauth','integration']),
('Webhook event system',         'Build outbound webhook system for events',            'TODO',        'MEDIUM',   'p0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', '2026-05-15', 18, ARRAY['webhooks','backend']),
('Campaign landing pages',       'Create 5 landing pages for Q2 campaign',              'IN_PROGRESS', 'HIGH',     'p0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000009', '2026-04-30', 40, ARRAY['marketing','design']),
('Social media automation',      'Set up automated posting schedule',                   'TODO',        'LOW',      'p0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000009', '2026-05-20', 10, ARRAY['social','automation']);

-- ─────────────────────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO notifications (user_id, type, title, message, is_read, action_url) VALUES
('00000000-0000-0000-0000-000000000001', 'INFO',    'System Initialized',         'Enterprise Management System is now live and operational.',         TRUE,  '/dashboard'),
('00000000-0000-0000-0000-000000000001', 'WARNING', 'Invoice Overdue',            'Invoice INV-2026-0005 for TechCorp Inc. is past due date.',        FALSE, '/finance/invoices'),
('00000000-0000-0000-0000-000000000001', 'SUCCESS', 'Payment Received',           'Invoice INV-2026-0002 has been paid. Amount: $8,850.00',           FALSE, '/finance/invoices'),
('00000000-0000-0000-0000-000000000002', 'INFO',    'New Employee Added',         'David Kim has been added to the Engineering department.',           TRUE,  '/users'),
('00000000-0000-0000-0000-000000000003', 'INFO',    'Task In Review',             'Task "User management CRUD" has been moved to In Review.',         FALSE, '/tasks'),
('00000000-0000-0000-0000-000000000005', 'SUCCESS', 'Task Completed',             'Task "Build auth module" has been marked as completed.',            TRUE,  '/tasks'),
('00000000-0000-0000-0000-000000000005', 'INFO',    'New Task Assigned',          'You have been assigned to "Dashboard analytics API".',             FALSE, '/tasks'),
('00000000-0000-0000-0000-000000000004', 'WARNING', 'Budget Alert',               'Marketing department has used 98% of April budget.',               FALSE, '/finance/budget'),
('00000000-0000-0000-0000-000000000009', 'SUCCESS', 'Project Started',            'Q2 Marketing Campaign project has kicked off.',                    FALSE, '/projects'),
('00000000-0000-0000-0000-000000000010', 'INFO',    'File Uploaded',              'A new design file has been shared with your team.',                FALSE, '/files');

-- ─────────────────────────────────────────────────────────────────────────────
-- PAYROLL RECORDS (April 2026)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO payroll_records (user_id, month, year, base_salary, allowances, deductions, bonus, net_salary, is_paid, paid_at, processed_by) VALUES
('00000000-0000-0000-0000-000000000005', 4, 2026, 8500, 500, 850,  1000, 9150, TRUE, '2026-04-01', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000006', 4, 2026, 5500, 300, 550,  500,  5750, TRUE, '2026-04-01', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000007', 4, 2026, 6000, 400, 600,  800,  6600, TRUE, '2026-04-01', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000010', 4, 2026, 7000, 400, 700,  500,  7200, TRUE, '2026-04-01', '00000000-0000-0000-0000-000000000002');

-- ─────────────────────────────────────────────────────────────────────────────
-- LEAVE REQUESTS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO leave_requests (user_id, type, status, start_date, end_date, days_count, reason, approved_by, approved_at) VALUES
('00000000-0000-0000-0000-000000000005', 'ANNUAL',    'APPROVED', '2026-05-05', '2026-05-09', 5, 'Family vacation',    '00000000-0000-0000-0000-000000000002', '2026-04-15'),
('00000000-0000-0000-0000-000000000006', 'SICK',      'APPROVED', '2026-04-14', '2026-04-15', 2, 'Medical appointment','00000000-0000-0000-0000-000000000002', '2026-04-13'),
('00000000-0000-0000-0000-000000000010', 'ANNUAL',    'PENDING',  '2026-05-12', '2026-05-16', 5, 'Personal travel',    NULL,                                   NULL),
('00000000-0000-0000-0000-000000000007', 'EMERGENCY', 'APPROVED', '2026-04-10', '2026-04-11', 1, 'Family emergency',   '00000000-0000-0000-0000-000000000002', '2026-04-10');

-- ─────────────────────────────────────────────────────────────────────────────
-- ATTENDANCE RECORDS (sample — last 5 working days)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO attendance_records (user_id, date, status, check_in, check_out) VALUES
('00000000-0000-0000-0000-000000000005', '2026-04-18', 'PRESENT', '2026-04-18 08:55:00+00', '2026-04-18 17:30:00+00'),
('00000000-0000-0000-0000-000000000006', '2026-04-18', 'PRESENT', '2026-04-18 09:02:00+00', '2026-04-18 17:00:00+00'),
('00000000-0000-0000-0000-000000000007', '2026-04-18', 'PRESENT', '2026-04-18 09:10:00+00', '2026-04-18 18:00:00+00'),
('00000000-0000-0000-0000-000000000010', '2026-04-18', 'REMOTE',  '2026-04-18 08:30:00+00', '2026-04-18 17:15:00+00'),
('00000000-0000-0000-0000-000000000005', '2026-04-17', 'PRESENT', '2026-04-17 08:50:00+00', '2026-04-17 17:45:00+00'),
('00000000-0000-0000-0000-000000000006', '2026-04-17', 'LATE',    '2026-04-17 09:35:00+00', '2026-04-17 18:00:00+00'),
('00000000-0000-0000-0000-000000000007', '2026-04-17', 'PRESENT', '2026-04-17 08:58:00+00', '2026-04-17 17:30:00+00');

-- ─────────────────────────────────────────────────────────────────────────────
-- AUDIT LOGS (sample)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO audit_logs (user_id, action, entity, entity_id, new_values, ip_address, user_agent) VALUES
('00000000-0000-0000-0000-000000000001', 'CREATE', 'users', '00000000-0000-0000-0000-000000000005', '{"email":"emp1@ems.dev","role":"EMPLOYEE"}', '192.168.1.1', 'Mozilla/5.0'),
('00000000-0000-0000-0000-000000000001', 'CREATE', 'users', '00000000-0000-0000-0000-000000000006', '{"email":"emp2@ems.dev","role":"EMPLOYEE"}', '192.168.1.1', 'Mozilla/5.0'),
('00000000-0000-0000-0000-000000000003', 'CREATE', 'projects', 'p0000000-0000-0000-0000-000000000001', '{"name":"EMS Portal v2.0","status":"ACTIVE"}', '192.168.1.2', 'Mozilla/5.0'),
('00000000-0000-0000-0000-000000000005', 'UPDATE', 'tasks', NULL, '{"status":"DONE","completedAt":"2026-02-01"}', '192.168.1.3', 'Mozilla/5.0'),
('00000000-0000-0000-0000-000000000004', 'CREATE', 'invoices', 'i0000000-0000-0000-0000-000000000001', '{"invoiceNumber":"INV-2026-0001","total":13200}', '192.168.1.1', 'Mozilla/5.0'),
('00000000-0000-0000-0000-000000000001', 'LOGIN',  'auth', NULL, '{"loginAt":"2026-04-19T08:00:00Z"}', '192.168.1.1', 'Mozilla/5.0'),
('00000000-0000-0000-0000-000000000002', 'LOGIN',  'auth', NULL, '{"loginAt":"2026-04-19T08:15:00Z"}', '192.168.1.4', 'Mozilla/5.0');
