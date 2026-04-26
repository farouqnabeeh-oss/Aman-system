'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPayrollRecords, updatePayrollStatus, createPayrollRecord } from '@/lib/actions/payroll';
import { PageHeader } from '@/components/ui/States';
import { clsx } from 'clsx';
import { DollarSign, CheckCircle, Clock, Search, Filter, Download, User, Calendar, CreditCard, Plus } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { getUsers } from '@/lib/actions/users';
import toast from 'react-hot-toast';

const T = {
  ar: {
    title: 'سجل الرواتب',
    sub: 'إدارة المستحقات المالية الشهرية للموظفين',
    employee: 'الموظف',
    month: 'الشهر',
    year: 'السنة',
    base: 'الراتب الأساسي',
    allowances: 'البدلات',
    deductions: 'الخصومات',
    net: 'صافي الراتب',
    status: 'الحالة',
    paid: 'مدفوع',
    pending: 'قيد الانتظار',
    markAsPaid: 'تحديد كمدفوع',
    markAsPending: 'تحديد كقيد الانتظار',
  },
  en: {
    title: 'Payroll Management',
    sub: 'Manage monthly financial entitlements for employees',
    employee: 'Employee',
    month: 'Month',
    year: 'Year',
    base: 'Base Salary',
    allowances: 'Allowances',
    deductions: 'Deductions',
    net: 'Net Salary',
    status: 'Status',
    paid: 'Paid',
    pending: 'Pending',
    markAsPaid: 'Mark as Paid',
    markAsPending: 'Mark as Pending',
  }
};

export default function PayrollPage() {
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const t = T[language as keyof typeof T] || T.en;
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ userId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), baseSalary: 0, allowances: 0, deductions: 0 });

  const { data: records, isLoading } = useQuery({
    queryKey: ['payroll'],
    queryFn: async () => {
      const res = await getPayrollRecords();
      return res.data || [];
    }
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
        const res = await getUsers({ page: 1, limit: 100 } as any);
        return (res.data as any)?.items || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createPayrollRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      setIsModalOpen(false);
      toast.success(isRtl ? 'تم إنشاء سجل الراتب' : 'Payroll record created');
    }
  });

  const handleCreate = () => {
    const net = Number(form.baseSalary) + Number(form.allowances) - Number(form.deductions);
    createMutation.mutate({
        ...form,
        baseSalary: Number(form.baseSalary),
        allowances: Number(form.allowances),
        deductions: Number(form.deductions),
        netSalary: net,
        isPaid: false
    });
  };

  const mutation = useMutation({
    mutationFn: ({ id, isPaid }: { id: string, isPaid: boolean }) => updatePayrollStatus(id, isPaid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      toast.success(isRtl ? 'تم تحديث الحالة بنجاح' : 'Status updated successfully');
    },
    onError: () => {
      toast.error(isRtl ? 'فشل تحديث الحالة' : 'Failed to update status');
    }
  });

  return (
    <div className="space-y-8">
      <PageHeader 
        title={t.title} 
        description={t.sub} 
        action={
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-105 transition-all"
            >
                <Plus size={14} /> {isRtl ? 'إضافة راتب' : 'Add Payroll'}
            </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'إجمالي الرواتب' : 'Total Payroll'}</p>
            <p className="text-xl font-black text-white mt-1">
              {records?.reduce((acc: number, curr: any) => acc + Number(curr.netSalary), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" dir={isRtl ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.employee}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.month}/{t.year}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.base}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.net}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">{t.status}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">{isRtl ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {records?.map((r: any) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 font-bold text-[10px]">
                        {r.user.firstName?.[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-tight">{r.user.firstName} {r.user.lastName}</p>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest">{r.user.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={14} className="text-brand" />
                      <span className="text-[10px] font-black uppercase">{r.month}/{r.year}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-tight">${Number(r.baseSalary).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-white tracking-tighter">${Number(r.netSalary).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <span className={clsx(
                        'px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5',
                        r.isPaid ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      )}>
                        {r.isPaid ? <CheckCircle size={10} /> : <Clock size={10} />}
                        {r.isPaid ? t.paid : t.pending}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => mutation.mutate({ id: r.id, isPaid: !r.isPaid })}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border',
                        r.isPaid ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                      )}
                    >
                      {r.isPaid ? t.markAsPending : t.markAsPaid}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={isRtl ? 'إضافة سجل راتب جديد' : 'New Payroll Entry'}>
          <div className="space-y-6 pt-2">
              <Select 
                label={isRtl ? 'الموظف' : 'Employee'}
                value={form.userId}
                options={users?.map((u: any) => ({ value: u.id, label: `${u.firstName} ${u.lastName} (${u.employeeNumber})` })) || []}
                onChange={(e: any) => setForm({ ...form, userId: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label={isRtl ? 'الشهر' : 'Month'}
                    type="number"
                    min={1} max={12}
                    value={form.month}
                    onChange={(e: any) => setForm({ ...form, month: parseInt(e.target.value) })}
                  />
                  <Input 
                    label={isRtl ? 'السنة' : 'Year'}
                    type="number"
                    value={form.year}
                    onChange={(e: any) => setForm({ ...form, year: parseInt(e.target.value) })}
                  />
              </div>
              <div className="grid grid-cols-3 gap-4">
                  <Input 
                    label={t.base}
                    type="number"
                    value={form.baseSalary}
                    onChange={(e: any) => setForm({ ...form, baseSalary: parseFloat(e.target.value) })}
                  />
                  <Input 
                    label={t.allowances}
                    type="number"
                    value={form.allowances}
                    onChange={(e: any) => setForm({ ...form, allowances: parseFloat(e.target.value) })}
                  />
                  <Input 
                    label={t.deductions}
                    type="number"
                    value={form.deductions}
                    onChange={(e: any) => setForm({ ...form, deductions: parseFloat(e.target.value) })}
                  />
              </div>
              <div className="p-4 rounded-2xl bg-brand/5 border border-brand/10 flex justify-between items-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.net}</p>
                  <p className="text-xl font-black text-brand">${(Number(form.baseSalary) + Number(form.allowances) - Number(form.deductions)).toLocaleString()}</p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button 
                    onClick={handleCreate}
                    disabled={createMutation.isPending || !form.userId}
                    className="px-8 py-2.5 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 disabled:opacity-50"
                  >
                      {createMutation.isPending ? 'Saving...' : (isRtl ? 'حفظ السجل' : 'Save Entry')}
                  </button>
              </div>
          </div>
      </Modal>
    </div>
  );
}
