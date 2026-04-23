'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, TrendingUp, TrendingDown, DollarSign, Wallet, FileText, PieChart as PieChartIcon, Edit2, Trash2, Target, Layers, Users, Calendar, Zap } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { getFinanceSummary, getTransactions, getBudgets, createTransaction } from '@/lib/actions/finance';

const T = {
  ar: {
    finance: 'الإدارة المالية', financeSub: 'التحكم الكامل في التدفق المالي والميزانيات التشغيلية',
    overview: 'المركز الإحصائي', transactions: 'سجل المعاملات', invoices: 'الفواتير', budgets: 'المخصصات',
    income: 'الإيرادات', expenses: 'المصروفات', netProfit: 'صافي الربح',
    newTransaction: 'عملية جديدة', save: 'حفظ', cancel: 'إلغاء',
    type: 'النوع', amount: 'المبلغ', description: 'البيان', category: 'الفئة', department: 'القسم',
    budget: 'الميزانية', spent: 'المصروف',
  },
  en: {
    finance: 'Finance Core', financeSub: 'Complete control over financial flow and operating budgets',
    overview: 'Overview', transactions: 'Transactions', invoices: 'Invoices', budgets: 'Budgets',
    income: 'Total Revenue', expenses: 'Active Expenses', netProfit: 'Net Profit',
    newTransaction: 'New Entry', save: 'Apply', cancel: 'Cancel',
    type: 'Type', amount: 'Amount', description: 'Description', category: 'Category', department: 'Department',
    budget: 'Budget Pool', spent: 'Spent',
  }
};

const DEPARTMENTS = ['ENGINEERING', 'FINANCE', 'HR', 'MARKETING', 'OPERATIONS'];

function fmt(n: number, rtl: boolean) {
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}${rtl ? ' د.إ' : '$'}`;
}

export default function FinancePage() {
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const t = T[language as keyof typeof T] || T.en;
  const [tab, setTab] = useState<'overview' | 'transactions' | 'budgets'>('overview');

  const { data: summaryData } = useQuery({
    queryKey: ['financeSummary'],
    queryFn: async () => { const r = await getFinanceSummary(); return r.data; },
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => { const r = await getTransactions(); return r.data || []; },
    enabled: tab === 'transactions',
  });

  const { data: budgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => { const r = await getBudgets(); return r.data || []; },
    enabled: tab === 'budgets',
  });

  const SAMPLE_SUMMARY = summaryData || { totalIncome: 0, totalExpense: 0, netProfit: 0, profitMargin: 0, invoicesByStatus: [] };
  const SAMPLE_CHART = summaryData?.invoicesByStatus || [];
  const SAMPLE_BUDGETS = budgets || [];

  const tabs = [
    { key: 'overview' as const, label: t.overview, icon: PieChartIcon },
    { key: 'transactions' as const, label: t.transactions, icon: Wallet },
    { key: 'budgets' as const, label: t.budgets, icon: DollarSign },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title={t.finance} description={t.financeSub} />

      {/* Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {tabs.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)} className={clsx(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap',
            tab === tb.key ? 'bg-white text-black' : 'text-slate-500 hover:text-white hover:bg-white/5'
          )}>
            <tb.icon size={13} /> {tb.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label={t.income} value={fmt(SAMPLE_SUMMARY.totalIncome, isRtl)} icon={<TrendingUp size={20} />} trend="up" delta="+12%" />
            <StatCard label={t.expenses} value={fmt(SAMPLE_SUMMARY.totalExpense, isRtl)} icon={<TrendingDown size={20} />} trend="down" />
            <StatCard label={t.netProfit} value={fmt(SAMPLE_SUMMARY.netProfit, isRtl)} icon={<Wallet size={20} />} trend="up" delta={`${SAMPLE_SUMMARY.profitMargin}%`} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 glass-card p-8">
              <h3 className="text-sm font-black text-white uppercase tracking-tight mb-6">Invoice Status</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SAMPLE_CHART}>
                    <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }} />
                    <Bar dataKey="_count" radius={[8, 8, 0, 0]} barSize={40} fill="white" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass-card p-8">
              <h3 className="text-sm font-black text-white mb-6">Revenue Yield</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ n: 'Income', v: SAMPLE_SUMMARY.totalIncome }, { n: 'Expense', v: SAMPLE_SUMMARY.totalExpense }]} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="v">
                      <Cell fill="white" stroke="transparent" />
                      <Cell fill="#1e293b" stroke="transparent" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions placeholder */}
      {tab === 'transactions' && (
        <div className="glass-card p-12 text-center">
          <Wallet size={32} className="text-slate-600 mx-auto mb-4" />
          <p className="text-sm font-bold text-white mb-1">Transaction Ledger</p>
          <p className="text-xs text-slate-500">Connect to live data via Server Actions for full transaction management.</p>
        </div>
      )}

      {/* Budgets */}
      {tab === 'budgets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {SAMPLE_BUDGETS.map((b: any) => {
            const allocatedStr = Number(b.allocated || 0);
            const spentStr = Number(b.spent || 0);
            const pct = Math.min(allocatedStr > 0 ? (spentStr / allocatedStr) * 100 : 0, 100);
            return (
              <div key={b.department} className="glass-card p-8 group hover:border-white/15 transition-all">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">{b.department}</h4>
                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Allocated Pool</p>
                  </div>
                  <span className="text-xl font-black text-white">{pct.toFixed(0)}%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-8">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.2 }} className={clsx('h-full rounded-full', pct > 90 ? 'bg-rose-500' : 'bg-white')} />
                </div>
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest pt-5 border-t border-white/5">
                  <div><p className="text-slate-700 mb-0.5">{t.spent}</p><p className="text-white text-sm">{fmt(spentStr, isRtl)}</p></div>
                  <div className="text-right"><p className="text-slate-700 mb-0.5">{t.budget}</p><p className="text-slate-500 text-sm">{fmt(allocatedStr, isRtl)}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
