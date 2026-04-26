'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
    Plus, TrendingUp, TrendingDown, DollarSign, Wallet, FileText, 
    PieChart as PieChartIcon, Edit2, Trash2, Target, Layers, 
    Users, Calendar, Zap, ArrowUpRight, ArrowDownLeft, Activity 
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { getFinanceSummary, getTransactions, getBudgets, createTransaction, deleteTransaction, updateTransaction } from '@/lib/actions/finance';

const T = {
  ar: {
    finance: 'الإدارة المالية', financeSub: 'التحكم الكامل في التدفق المالي والميزانيات التشغيلية',
    overview: 'المركز الإحصائي', transactions: 'سجل المعاملات', invoices: 'الفواتير', budgets: 'المخصصات',
    income: 'الإيرادات', expenses: 'المصروفات', netProfit: 'صافي الربح',
    newTransaction: 'عملية جديدة', save: 'حفظ البيانات', cancel: 'إلغاء',
    type: 'النوع', amount: 'المبلغ', description: 'البيان', category: 'الفئة', department: 'القسم',
    budget: 'الميزانية', spent: 'المصروف',
    deleteConfirm: 'هل أنت متأكد من حذف هذه المعاملة؟',
  },
  en: {
    finance: 'Finance Core', financeSub: 'Complete control over financial flow and operating budgets',
    overview: 'Market Overview', transactions: 'Ledger History', invoices: 'Invoices', budgets: 'Budget Pools',
    income: 'Total Revenue', expenses: 'Operational Costs', netProfit: 'Net Liquidity',
    newTransaction: 'New Entry', save: 'Log Transaction', cancel: 'Cancel',
    type: 'Type', amount: 'Amount', description: 'Description', category: 'Category', department: 'Department',
    budget: 'Budget Pool', spent: 'Spent',
    deleteConfirm: 'Are you sure you want to delete this transaction?',
  }
};

const DEPARTMENTS = ['ENGINEERING', 'FINANCE', 'HR', 'MARKETING', 'OPERATIONS'];

function fmt(n: number, rtl: boolean) {
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}${rtl ? ' د.إ' : '$'}`;
}

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.05 } } };

export default function FinancePage() {
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const t = T[language as keyof typeof T] || T.en;
  const [tab, setTab] = useState<'overview' | 'transactions' | 'budgets'>('overview');

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['financeSummary'],
    queryFn: async () => { const r = await getFinanceSummary(); return r.data; },
  });

  const tabs = [
    { key: 'overview' as const, label: t.overview, icon: PieChartIcon },
    { key: 'transactions' as const, label: t.transactions, icon: Activity },
    { key: 'budgets' as const, label: t.budgets, icon: DollarSign },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader title={t.finance} description={t.financeSub} />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)} className={clsx(
            'flex items-center gap-2 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap',
            tab === tb.key ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
          )}>
            <tb.icon size={14} /> {tb.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label={t.income} value={fmt(summaryData?.totalIncome || 0, isRtl)} icon={<ArrowUpRight size={20} />} trend="up" delta="+12%" />
              <StatCard label={t.expenses} value={fmt(summaryData?.totalExpense || 0, isRtl)} icon={<ArrowDownLeft size={20} />} trend="down" delta="-4%" />
              <StatCard label={t.netProfit} value={fmt(summaryData?.netProfit || 0, isRtl)} icon={<Wallet size={20} />} trend="up" delta={`${summaryData?.profitMargin?.toFixed(1) || 0}%`} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 glass-card !p-10 border-slate-100 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Financial Velocity</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Invoicing metrics and payment flow</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                        <TrendingUp size={20} />
                    </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summaryData?.invoicesByStatus || []}>
                      <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                      />
                      <Bar dataKey="_count" radius={[10, 10, 0, 0]} barSize={50}>
                        {(summaryData?.invoicesByStatus || []).map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1C93B2' : '#e2e8f0'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-4 glass-card !p-10 border-slate-100 bg-white shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Liquidity Share</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Income vs Expense ratio</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                        <PieChartIcon size={20} />
                    </div>
                </div>
                <div className="flex-1 min-h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={[{ n: 'Income', v: summaryData?.totalIncome || 1 }, { n: 'Expense', v: summaryData?.totalExpense || 0 }]} 
                        cx="50%" cy="50%" 
                        innerRadius={70} outerRadius={100} 
                        dataKey="v"
                        paddingAngle={10}
                        stroke="none"
                      >
                        <Cell fill="#1C93B2" fillOpacity={0.8} />
                        <Cell fill="#f8fafc" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4 mt-8">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="flex items-center gap-3 text-slate-500"><div className="w-2.5 h-2.5 rounded-full bg-brand" /> Income</span>
                        <span className="text-slate-900">{Math.round(((summaryData?.totalIncome || 0) / ((summaryData?.totalIncome || 0) + (summaryData?.totalExpense || 0) || 1)) * 100)}%</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="flex items-center gap-3 text-slate-500"><div className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Expense</span>
                        <span className="text-slate-900">{Math.round(((summaryData?.totalExpense || 0) / ((summaryData?.totalIncome || 0) + (summaryData?.totalExpense || 0) || 1)) * 100)}%</span>
                    </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'transactions' && <TransactionsTab t={t} isRtl={isRtl} />}

        {tab === 'budgets' && <BudgetsTab t={t} isRtl={isRtl} />}
      </AnimatePresence>
    </motion.div>
  );
}

function TransactionsTab({ t, isRtl }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ 
        description: '', amount: '', type: 'EXPENSE', 
        category: 'OPERATIONS', department: 'ENGINEERING', transactionDate: new Date().toISOString().split('T')[0] 
    });
    const queryClient = useQueryClient();

    const { data: transactions = [], isLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: async () => { const r = await getTransactions(); return r.data || []; },
    });

    const handleCreate = async () => {
        if (!form.description || !form.amount) return toast.error('Required fields missing');
        const res = await createTransaction({ ...form, amount: parseFloat(form.amount) });
        if (res.success) {
            toast.success('Transaction logged');
            setIsModalOpen(false);
            setForm({ description: '', amount: '', type: 'EXPENSE', category: 'OPERATIONS', department: 'ENGINEERING', transactionDate: new Date().toISOString().split('T')[0] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['financeSummary'] });
        } else {
            console.error('Transaction creation error:', res.error || res.message);
            toast.error(res.message || 'Failed to create transaction. Check all fields.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t.deleteConfirm)) return;
        const res = await deleteTransaction(id);
        if (res.success) {
            toast.success('Transaction removed');
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['financeSummary'] });
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t.transactions}</h3>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand/90 transition-all shadow-lg shadow-brand/20"
                >
                    <Plus size={14} /> {t.newTransaction}
                </button>
            </div>

            <div className="glass-card !p-0 overflow-hidden border-slate-100 bg-white shadow-sm">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70">
                                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.description}</th>
                                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.type}</th>
                                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.amount}</th>
                                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'التاريخ' : 'Execution Date'}</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={5} className="px-8 py-6"><div className="h-4 bg-slate-100 rounded-lg animate-pulse" /></td></tr>)
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan={5} className="p-32 text-center text-slate-400 uppercase tracking-[0.3em] text-[10px] font-black">No Records Logged</td></tr>
                            ) : transactions.map((tx: any) => (
                                <tr key={tx.id} className="hover:bg-slate-50 transition-all group">
                                    <td className="px-8 py-5">
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{tx.description}</p>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{tx.category} · {tx.department}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={clsx(
                                            "text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border transition-all",
                                            tx.type === 'INCOME' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-500 bg-rose-500/10 border-rose-500/20'
                                        )}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-xs font-black text-slate-900">
                                        {fmt(Number(tx.amount), isRtl)}
                                    </td>
                                    <td className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        {new Date(tx.transactionDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:text-brand transition-all"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDelete(tx.id)} className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={t.newTransaction}>
                <div className="space-y-6 pt-2">
                    <Input label={t.description} value={form.description} onChange={(e: any) => setForm({...form, description: e.target.value})} placeholder="What is this for?" />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label={t.amount} type="number" value={form.amount} onChange={(e: any) => setForm({...form, amount: e.target.value})} placeholder="0.00" />
                        <Select 
                            label={t.type} 
                            value={form.type} 
                            options={[{value: 'INCOME', label: 'INCOME'}, {value: 'EXPENSE', label: 'EXPENSE'}]}
                            onChange={(e: any) => setForm({...form, type: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label={t.category} value={form.category} onChange={(e: any) => setForm({...form, category: e.target.value})} placeholder="Category Name" />
                         <Select 
                            label={t.department} 
                            value={form.department} 
                            options={DEPARTMENTS.map(d => ({ value: d, label: d }))}
                            onChange={(e: any) => setForm({...form, department: e.target.value})}
                        />
                        <Input label={isRtl ? 'تاريخ العملية' : 'Transaction Date'} type="date" value={form.transactionDate} onChange={(e: any) => setForm({...form, transactionDate: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-3 pt-8 border-t border-slate-100">
                        <button className="px-8 py-3 rounded-xl bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100" onClick={() => setIsModalOpen(false)}>{t.cancel}</button>
                        <button className="px-10 py-3 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 hover:bg-brand/90" onClick={handleCreate}>{t.save}</button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}

function BudgetsTab({ t, isRtl }: any) {
    const { data: budgets = [], isLoading } = useQuery({
        queryKey: ['budgets'],
        queryFn: async () => { const r = await getBudgets(); return r.data || []; },
    });

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
                Array(3).fill(0).map((_, i) => <div key={i} className="glass-card h-64 animate-pulse bg-slate-50 border-slate-100" />)
            ) : budgets.length === 0 ? (
                <div className="col-span-full py-32 text-center glass-card border-dashed border-slate-200 bg-white shadow-sm">
                    <Target size={48} className="mx-auto text-slate-300 mb-4 opacity-50" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No Budget Allocations Found</p>
                </div>
            ) : budgets.map((b: any) => {
                const allocated = Number(b.allocated || 0);
                const spent = Number(b.spent || 0);
                const pct = Math.min(allocated > 0 ? (spent / allocated) * 100 : 0, 100);
                return (
                    <div key={b.department} className="glass-card !p-10 border-slate-100 bg-white shadow-sm hover:bg-slate-50 transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{b.department}</h4>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Pool Cycle</p>
                            </div>
                            <div className={clsx(
                                "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs border transition-all group-hover:scale-110",
                                pct > 90 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-brand/10 text-brand border-brand/20'
                            )}>
                                {pct.toFixed(0)}%
                            </div>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-10">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className={clsx('h-full rounded-full', pct > 90 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-brand shadow-[0_0_10px_rgba(28,147,178,0.3)]')} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-100">
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.spent}</p>
                                <p className="text-lg font-black text-slate-900">{fmt(spent, isRtl)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.budget}</p>
                                <p className="text-lg font-black text-slate-500">{fmt(allocated, isRtl)}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </motion.div>
    );
}
