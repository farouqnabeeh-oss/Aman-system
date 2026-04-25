import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Plus, TrendingUp, TrendingDown, DollarSign, Wallet, FileText, PieChart as PieChartIcon, ArrowUpRight, Edit2, Trash2, Target, Layers, Users, Calendar, Zap } from 'lucide-react';
import api from '../../../lib/axios';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '../../../components/ui/States';
import { Table, Pagination } from '../../../components/ui/Table';
import { SkeletonTable, Skeleton } from '../../../components/ui/Skeleton';
import { statusBadge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input, Select, Textarea } from '../../../components/ui/Input';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const TRANSLATIONS = {
  ar: {
    finance: 'الإدارة المالية',
    financeSub: 'التحكم الكامل في التدفق المالي والميزانيات التشغيلية',
    overview: 'المركز اللإحصائي',
    transactions: 'سجل المعاملات',
    invoices: 'إدارة الفواتير',
    budgets: 'المخصصات المالية',
    income: 'الإيرادات الإجمالية',
    expenses: 'المصروفات النشطة',
    netProfit: 'صافي الربح المحقق',
    invoiceStatus: 'مراقبة الفواتير',
    newTransaction: 'عملية مالية جديدة',
    newInvoice: 'فاتورة جديدة',
    editTransaction: 'تعديل المعاملة',
    save: 'حفظ التغييرات',
    cancel: 'إلغاء',
    type: 'النوع',
    amount: 'المبلغ',
    description: 'البيان',
    category: 'الفئة الضريبية',
    department: 'القسم المستفيد',
    status: 'حالة الدفع',
    client: 'العميل / الجهة',
    dueDate: 'تاريخ الاستحقاق',
    actions: 'إجراءات',
    budget: 'الميزانية',
    spent: 'المصروف',
  },
  en: {
    finance: 'Finance Core',
    financeSub: 'Complete control over financial flow and operating budgets',
    overview: 'Statistical Center',
    transactions: 'Transaction Ledger',
    invoices: 'Invoice Management',
    budgets: 'Financial Allocations',
    income: 'Total Revenue',
    expenses: 'Active Expenses',
    netProfit: 'Realized Net Profit',
    invoiceStatus: 'Invoice Monitoring',
    newTransaction: 'New Entry',
    newInvoice: 'Create Invoice',
    editTransaction: 'Edit Transaction',
    save: 'Apply Changes',
    cancel: 'Cancel',
    type: 'Type',
    amount: 'Amount',
    description: 'Description',
    category: 'Tax Category',
    department: 'Department',
    status: 'Payment Status',
    client: 'Entity / Client',
    dueDate: 'Due Date',
    actions: 'Actions',
    budget: 'Budget Pool',
    spent: 'Capital Spent',
  }
};

function formatCurrency(n: number, isRtl: boolean) {
  const sym = isRtl ? ' ₪' : ' ILS';
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}${sym}`;
}

function FinanceTabs() {
  const { pathname } = useLocation();
  const { language } = useUIStore();
  const t = TRANSLATIONS[language];
  const tabs = [
    { label: t.overview, path: '/finance', icon: PieChartIcon },
    { label: t.transactions, path: '/finance/transactions', icon: Wallet },
    { label: t.invoices, path: '/finance/invoices', icon: FileText },
    { label: t.budgets, path: '/finance/budgets', icon: DollarSign },
  ];

  return (
    <div className="flex gap-4 mb-12 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const active = pathname === tab.path || (tab.path === '/finance' && pathname === '/finance/');
        return (
          <Link key={tab.path} to={tab.path} className={clsx(
            'flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap',
            active ? 'bg-white text-black' : 'text-slate-500 hover:text-white hover:bg-white/5'
          )}>
            <tab.icon size={14} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

function FinanceOverview() {
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const t = TRANSLATIONS[language];

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'summary'],
    queryFn: () => api.get<any>('/finance/summary').then((r) => r.data.data),
  });

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? [1, 2, 3].map(i => <Skeleton key={i} className="h-44 rounded-[2rem]" />) : (
          <>
            <StatCard label={t.income} value={formatCurrency(data?.totalIncome ?? 0, isRtl)} icon={<TrendingUp size={24} />} trend="up" />
            <StatCard label={t.expenses} value={formatCurrency(data?.totalExpense ?? 0, isRtl)} icon={<TrendingDown size={24} />} trend="down" />
            <StatCard label={t.netProfit} value={formatCurrency(data?.netProfit ?? 0, isRtl)} delta={`${(data?.profitMargin ?? 0).toFixed(1)}%`} icon={<Wallet size={24} />} trend="up" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 clean-card !p-12 relative overflow-hidden">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">{t.invoiceStatus}</h3>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl">Real-time Stream</div>
          </div>
          {isLoading ? <Skeleton className="h-64 w-full rounded-3xl" /> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.invoicesByStatus ?? []}>
                <CartesianGrid strokeDasharray="6 6" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis dataKey="status" tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }} />
                <Bar dataKey="_count" radius={[10, 10, 0, 0]} barSize={50} fill="white" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="clean-card !p-12">
          <h3 className="text-lg font-black text-white mb-10">Revenue Yield</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={[{ n: 'Income', v: data?.totalIncome }, { n: 'Expense', v: data?.totalExpense }]} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="v">
                <Cell fill="white" stroke="transparent" />
                <Cell fill="#1e293b" stroke="transparent" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-500">Operating Income</span>
              <span className="text-white">74%</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-500">Fixed Expenses</span>
              <span className="text-white">26%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Transactions() {
  const qc = useQueryClient();
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const t = TRANSLATIONS[language];
  const [page, setPage] = useState(1);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ type: 'EXPENSE', amount: '', description: '', category: '', department: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page],
    queryFn: () => api.get<any>('/finance/transactions', { params: { page, sortBy: 'createdAt', sortOrder: 'desc' } }).then((r) => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: () => editingId ? api.patch(`/finance/transactions/${editingId}`, { ...form, amount: parseFloat(form.amount) }) : api.post('/finance/transactions', { ...form, amount: parseFloat(form.amount) }),
    onSuccess: () => {
      setEditOpen(false);
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['finance'] });
      setPage(1);
      toast.success('Operation Successful');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/finance/transactions/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['transactions'] }); toast.success('Deleted'); },
  });

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setForm({ type: item.type, amount: String(item.amount), description: item.description, category: item.category || '', department: item.department || '' });
    setEditOpen(true);
  };

  const cols = [
    { key: 'date', label: 'Date', render: (t: any) => <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{new Date(t.transactionDate || t.createdAt).toLocaleDateString(language)}</span> },
    { key: 'description', label: t.description, render: (t: any) => <span className="text-sm font-bold text-white">{t.description}</span> },
    { key: 'type', label: t.type, render: (t: any) => statusBadge(t.type) },
    {
      key: 'amount', label: t.amount, render: (t: any) => (
        <span className={clsx('font-black text-sm', t.type === 'INCOME' ? 'text-white' : 'text-slate-500')}>
          {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(t.amount || 0), isRtl)}
        </span>
      )
    },
    {
      key: 'actions', label: '', render: (t: any) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => handleEdit(t)} className="p-2.5 rounded-xl hover:bg-white/10 text-slate-600 hover:text-white transition-all"><Edit2 size={14} /></button>
          <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(t.id) }} className="p-2.5 rounded-xl hover:bg-rose-500/10 text-slate-600 hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-12">
      <div className="flex justify-end">
        <button onClick={() => { setEditingId(null); setForm({ type: 'EXPENSE', amount: '', description: '', category: '', department: '' }); setEditOpen(true); }} className="clean-btn-primary h-12 gap-2 text-[10px] uppercase tracking-widest"><Plus size={16} /> {t.newTransaction}</button>
      </div>
      <div className="clean-card !p-0 overflow-hidden">
        {isLoading ? <SkeletonTable rows={10} cols={5} /> : (
          <>
            <Table columns={cols} data={data?.items ?? []} keyFn={(t: any) => t.id} />
            {data?.meta && data.meta.totalPages > 1 && <Pagination page={page} totalPages={data.meta.totalPages} total={data.meta.total} limit={data.meta.limit} onPage={setPage} />}
          </>
        )}
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={editingId ? t.editTransaction : t.newTransaction}>
        <div className="space-y-8 pt-4">
          <div className="grid grid-cols-2 gap-6">
            <Select label={t.type} icon={Target} value={form.type} onChange={(e: any) => setForm(f => ({ ...f, type: e.target.value }))} options={[{ value: 'INCOME', label: 'Income' }, { value: 'EXPENSE', label: 'Expense' }]} />
            <Input label={t.amount} icon={DollarSign} type="number" value={form.amount} onChange={(e: any) => setForm(f => ({ ...f, amount: e.target.value }))} />
          </div>
          <Textarea label={t.description} icon={Layers} value={form.description} onChange={(e: any) => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-6">
            <Select label={t.department} icon={Users} value={form.department} options={['ENGINEERING', 'FINANCE', 'HR', 'MARKETING', 'OPERATIONS'].map(d => ({ value: d, label: d }))} onChange={(e: any) => setForm(f => ({ ...f, department: e.target.value }))} />
            <Input label={t.category} icon={Zap} value={form.category} onChange={(e: any) => setForm(f => ({ ...f, category: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-4 mt-12 py-6 border-t border-white/5">
            <button className="clean-btn-secondary px-10" onClick={() => setEditOpen(false)}>{t.cancel}</button>
            <button className="clean-btn-primary px-10" onClick={() => {
              if (confirm(isRtl ? 'هل أنت متأكد من حفظ البيانات؟' : 'Are you sure you want to save?')) {
                saveMutation.mutate();
              }
            }} disabled={saveMutation.isPending}>{t.save}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Invoices() {
  const qc = useQueryClient();
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const t = TRANSLATIONS[language];
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ invoiceNumber: '', client: '', amount: '', status: 'PENDING', dueDate: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', page],
    queryFn: () => api.get<any>('/finance/invoices', { params: { page, sortBy: 'createdAt', sortOrder: 'desc' } }).then(r => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/finance/invoices', { ...form, amount: parseFloat(form.amount) }),
    onSuccess: () => {
      setCreateOpen(false);
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['finance'] });
      setPage(1);
      toast.success('Created');
    },
  });

  const cols = [
    { key: 'num', label: 'ID', render: (i: any) => <span className="text-[10px] font-black text-slate-600 font-mono">#{i.invoiceNumber || i.id.slice(0, 8)}</span> },
    { key: 'client', label: t.client, render: (i: any) => <span className="text-sm font-bold text-white">{i.client}</span> },
    { key: 'amount', label: t.amount, render: (i: any) => <span className="text-sm font-black text-white">{formatCurrency(i.amount, isRtl)}</span> },
    { key: 'due', label: t.dueDate, render: (i: any) => <span className="text-[11px] font-bold text-slate-500">{new Date(i.dueDate).toLocaleDateString(language)}</span> },
    { key: 'status', label: t.status, render: (i: any) => statusBadge(i.status) },
    {
      key: 'actions', label: '', render: () => (
        <div className="flex justify-end gap-2">
          <button className="p-2.5 rounded-xl hover:bg-white/10 text-slate-600 hover:text-white transition-all"><ArrowUpRight size={14} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-12">
      <div className="flex justify-end">
        <button onClick={() => setCreateOpen(true)} className="clean-btn-primary h-12 gap-2 text-[10px] uppercase tracking-widest"><Plus size={16} /> {t.newInvoice}</button>
      </div>
      <div className="clean-card !p-0 overflow-hidden">
        {isLoading ? <SkeletonTable rows={10} cols={6} /> : (
          <Table columns={cols} data={data?.items || []} keyFn={(i: any) => i.id} />
        )}
        {data?.meta && <Pagination page={page} totalPages={data.meta.totalPages} total={data.meta.total} limit={data.meta.limit} onPage={setPage} />}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t.newInvoice}>
        <div className="space-y-8 pt-4">
          <Input label={isRtl ? 'رقم الفاتورة' : 'Invoice Identifier'} icon={Target} placeholder="INV-2026-001" value={form.invoiceNumber} onChange={(e: any) => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} />
          <Input label={t.client} icon={Users} value={form.client} onChange={(e: any) => setForm(f => ({ ...f, client: e.target.value }))} />
          <div className="grid grid-cols-2 gap-6">
            <Input label={t.amount} icon={DollarSign} type="number" value={form.amount} onChange={(e: any) => setForm(f => ({ ...f, amount: e.target.value }))} />
            <Input label={t.dueDate} icon={Calendar} type="date" value={form.dueDate} onChange={(e: any) => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          </div>
          <Select label={t.status} icon={Zap} value={form.status} options={['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'].map(s => ({ value: s, label: s }))} onChange={(e: any) => setForm(f => ({ ...f, status: e.target.value }))} />
          <div className="flex justify-end gap-4 mt-12 py-6 border-t border-white/5">
            <button className="clean-btn-secondary px-10" onClick={() => setCreateOpen(false)}>{t.cancel}</button>
            <button className="clean-btn-primary px-10" onClick={() => {
              if (confirm(isRtl ? 'هل أنت متأكد من حفظ البيانات؟' : 'Are you sure you want to save?')) {
                createMutation.mutate();
              }
            }} disabled={createMutation.isPending}>{t.save}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Budgets() {
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const t = TRANSLATIONS[language];
  const { data, isLoading } = useQuery({ queryKey: ['budgets'], queryFn: () => api.get<any>('/finance/budgets').then(r => r.data.data) });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {isLoading ? [1, 2, 3].map(i => <Skeleton key={i} className="h-56 rounded-[2rem]" />) : (
        (Array.isArray(data) ? data : []).map((b: any) => {
          const pct = Math.min(b.allocated > 0 ? (b.spent / b.allocated) * 100 : 0, 100);
          return (
            <div key={b.department} className="clean-card !p-10 group hover:bg-white/[0.02]">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h4 className="text-lg font-black text-white mb-2 uppercase tracking-tight">{b.department}</h4>
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{isRtl ? 'الميزانية المخصصة' : 'ALLOCATED POOL'}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-black text-white">{pct.toFixed(0)}%</span>
                  <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em] mt-1">Utilization</span>
                </div>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-12">
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className={clsx('h-full transition-all duration-1000', pct > 90 ? 'bg-rose-500' : 'bg-white')} />
              </div>
              <div className="flex justify-between items-end pt-8 border-t border-white/5">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{t.spent}</p>
                  <p className="text-sm font-black text-white">{formatCurrency(b.spent, isRtl)}</p>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{t.budget}</p>
                  <p className="text-sm font-black text-slate-500">{formatCurrency(b.allocated, isRtl)}</p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export function FinancePage() {
  const { language } = useUIStore();
  const t = TRANSLATIONS[language];
  return (
    <div className="space-y-4">
      <PageHeader title={t.finance} description={t.financeSub} />
      <FinanceTabs />
      <Routes>
        <Route index element={<FinanceOverview />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="*" element={<FinanceOverview />} />
      </Routes>
    </div>
  );
}
