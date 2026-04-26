'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPayrollRecords, updatePayrollStatus } from '@/lib/actions/payroll';
import { PageHeader } from '@/components/ui/States';
import { clsx } from 'clsx';
import { DollarSign, CheckCircle, Clock, Search, Filter, Download, User, Calendar, CreditCard } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
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

  const { data: records, isLoading } = useQuery({
    queryKey: ['payroll'],
    queryFn: async () => {
      const res = await getPayrollRecords();
      return res.data || [];
    }
  });

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
      <PageHeader title={t.title} description={t.sub} />

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
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{r.user.firstName} {r.user.lastName}</p>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest">{r.user.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={14} />
                      <span className="text-xs font-mono">{r.month}/{r.year}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-300">{Number(r.baseSalary).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-white">{Number(r.netSalary).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={clsx(
                        'px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5',
                        r.isPaid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
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
                        'px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all',
                        r.isPaid ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
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
    </div>
  );
}
