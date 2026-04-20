import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CreditCard, Plus, Check, DollarSign, Calendar, Users, Target, Layers, Zap } from 'lucide-react';
import api from '../../../lib/axios';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '../../../components/ui/States';
import { Table, Pagination } from '../../../components/ui/Table';
import { SkeletonTable, Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import { Input, Select } from '../../../components/ui/Input';
import toast from 'react-hot-toast';

const TRANSLATIONS = {
   ar: {
      payroll: 'شؤون الرواتب',
      payrollSub: 'نظام صرف الرواتب والبدلات والمكافآت',
      newRecord: 'سجل جديد',
      ytd: 'إجمالي العام (YTD)',
      employee: 'الموظف',
      period: 'الفترة',
      base: 'الأساسي',
      net: 'صافي الراتب',
      status: 'الحالة',
      markPaid: 'صرف الراتب',
      save: 'حفظ السجل',
      cancel: 'إلغاء',
      allowances: 'البدلات',
      deductions: 'الاستقطاعات',
      bonus: 'المكافآت',
      paid: 'تم الصرف',
      pending: 'قيد الانتظار',
   },
   en: {
      payroll: 'Payroll Center',
      payrollSub: 'Salary disbursement, allowances, and bonuses system',
      newRecord: 'Add Record',
      ytd: 'Year-to-Date (YTD)',
      employee: 'Personnel',
      period: 'Cycle',
      base: 'Base Salary',
      net: 'Net Total',
      status: 'Status',
      markPaid: 'Authorize Payment',
      save: 'Confirm Record',
      cancel: 'Cancel',
      allowances: 'Allowances',
      deductions: 'Deductions',
      bonus: 'Bonuses',
      paid: 'Transferred',
      pending: 'Awaiting',
   }
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function PayrollPage() {
   const qc = useQueryClient();
   const { language } = useUIStore();
   const isRtl = language === 'ar';
   const t = TRANSLATIONS[language];

   const [page, setPage] = useState(1);
   const [year, setYear] = useState(new Date().getFullYear());
   const [createOpen, setCreateOpen] = useState(false);
   const [form, setForm] = useState({ userId: '', month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()), baseSalary: '', allowances: '', deductions: '', bonus: '' });

   const { data, isLoading } = useQuery({
      queryKey: ['payroll', page, year],
      queryFn: () => api.get<any>('/payroll', { params: { page, year } }).then(r => r.data.data),
   });

   const { data: summary, isLoading: summaryLoading } = useQuery({
      queryKey: ['payroll-summary', year],
      queryFn: () => api.get<any>(`/payroll/summary?year=${year}`).then(r => r.data.data),
   });

   const { data: users } = useQuery({
      queryKey: ['users-list'],
      queryFn: () => api.get<any>('/users', { params: { limit: 100 } }).then(r => r.data.data.items),
   });

   const createMutation = useMutation({
      mutationFn: () => api.post('/payroll', { ...form, month: parseInt(form.month), year: parseInt(form.year), baseSalary: parseFloat(form.baseSalary), allowances: parseFloat(form.allowances || '0'), deductions: parseFloat(form.deductions || '0'), bonus: parseFloat(form.bonus || '0') }),
      onSuccess: () => { qc.invalidateQueries({ queryKey: ['payroll'] }); setCreateOpen(false); toast.success('Created'); },
   });

   const markPaid = useMutation({
      mutationFn: (id: string) => api.patch(`/payroll/${id}/mark-paid`),
      onSuccess: () => { qc.invalidateQueries({ queryKey: ['payroll'] }); toast.success('Payment Authorized'); },
   });

   const totalYTD = (summary ?? []).reduce((s: number, m: any) => s + m.totalPayroll, 0);

   const cols = [
      { key: 'user', label: t.employee, render: (r: any) => <span className="text-sm font-bold text-white">{r.user?.firstName} {r.user?.lastName}</span> },
      { key: 'period', label: t.period, render: (r: any) => <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{MONTHS[r.month - 1]} {r.year}</span> },
      { key: 'base', label: t.base, render: (r: any) => <span className="text-sm font-bold text-slate-400">${r.baseSalary.toLocaleString()}</span> },
      { key: 'net', label: t.net, render: (r: any) => <span className="text-base font-black text-white">${r.netSalary.toLocaleString()}</span> },
      {
         key: 'status', label: t.status, render: (r: any) => r.isPaid ?
            <span className="text-[10px] font-black text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">{t.paid}</span> :
            <span className="text-[10px] font-black text-slate-600 border border-white/5 px-3 py-1.5 rounded-xl uppercase tracking-widest">{t.pending}</span>
      },
      {
         key: 'action', label: '', render: (r: any) => !r.isPaid && (
            <button onClick={() => markPaid.mutate(r.id)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Check size={14} /></button>
         )
      }
   ];

   return (
      <div className="space-y-12">
         <PageHeader
            title={t.payroll}
            description={t.payrollSub}
            action={<button onClick={() => setCreateOpen(true)} className="clean-btn-primary h-12 gap-2 text-xs uppercase tracking-widest"><Plus size={16} /> {t.newRecord}</button>}
         />

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 clean-card !p-10">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">{t.payroll} — {year}</h3>
                  <select value={year} onChange={(e: any) => setYear(Number(e.target.value))} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-slate-400 outline-none">
                     {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
               </div>
               {summaryLoading ? <Skeleton className="h-64 rounded-3xl" /> : (
                  <ResponsiveContainer width="100%" height={260}>
                     <BarChart data={(summary ?? []).map((m: any) => ({ name: MONTHS[m.month - 1], val: m.totalPayroll }))}>
                        <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.02)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Bar dataKey="val" fill="white" radius={[6, 6, 0, 0]} barSize={24} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }} />
                     </BarChart>
                  </ResponsiveContainer>
               )}
            </div>

            <div className="space-y-6">
               <StatCard label={t.ytd} value={`$${(totalYTD / 1000).toFixed(1)}K`} icon={<CreditCard size={24} />} />
               <div className="clean-card !p-8">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Payment Overview</h4>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">Total Processed</span>
                        <span className="text-white font-black">{summary?.reduce((a: number, m: any) => a + m.paidCount, 0) || 0}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">Pending Approval</span>
                        <span className="text-white font-black">{summary?.reduce((a: number, m: any) => a + m.unpaidCount, 0) || 0}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="clean-card !p-0 overflow-hidden">
            {isLoading ? <SkeletonTable rows={10} cols={6} /> : (
               <Table columns={cols} data={data?.items || []} keyFn={r => r.id} />
            )}
            {data?.meta && <Pagination page={page} totalPages={data.meta.totalPages} total={data.meta.total} limit={data.meta.limit} onPage={setPage} />}
         </div>

         <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t.newRecord}>
            <div className="space-y-8 pt-4">
               <Select label={t.employee} icon={Users} value={form.userId} options={(users ?? []).map((u: any) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))} onChange={(e: any) => setForm(f => ({ ...f, userId: e.target.value }))} />

               <div className="grid grid-cols-2 gap-6">
                  <Select label={isRtl ? 'الشهر' : 'Cycle Month'} icon={Calendar} value={form.month} options={MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))} onChange={(e: any) => setForm(f => ({ ...f, month: e.target.value }))} />
                  <Select label={isRtl ? 'السنة' : 'Cycle Year'} icon={Calendar} value={form.year} options={[2024, 2025, 2026].map(y => ({ value: String(y), label: String(y) }))} onChange={(e: any) => setForm(f => ({ ...f, year: e.target.value }))} />
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <Input label={t.base} icon={Target} type="number" value={form.baseSalary} onChange={(e: any) => setForm(f => ({ ...f, baseSalary: e.target.value }))} />
                  <Input label={t.bonus} icon={Zap} type="number" value={form.bonus} onChange={(e: any) => setForm(f => ({ ...f, bonus: e.target.value }))} />
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <Input label={t.allowances} icon={Layers} type="number" value={form.allowances} onChange={(e: any) => setForm(f => ({ ...f, allowances: e.target.value }))} />
                  <Input label={t.deductions} icon={DollarSign} type="number" value={form.deductions} onChange={(e: any) => setForm(f => ({ ...f, deductions: e.target.value }))} />
               </div>

               <div className="flex justify-end gap-4 mt-12 py-6 border-t border-white/5">
                  <button className="clean-btn-secondary px-10" onClick={() => setCreateOpen(false)}>{t.cancel}</button>
                  <button className="clean-btn-primary px-10" onClick={() => createMutation.mutate()}>{t.save}</button>
               </div>
            </div>
         </Modal>
      </div>
   );
}
