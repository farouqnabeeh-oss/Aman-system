'use client';

import { useState } from 'react';
import { Users, Calendar, Clock, UserCheck, Briefcase, TrendingUp, Search, Plus } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '@/components/ui/States';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

import { getAttendanceToday, getLeaveRequests, selfAttendance, requestLeave, updateLeaveStatus } from '@/lib/actions/hr';
import { getPayrollRecords } from '@/lib/actions/payroll';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';

const T = {
  ar: {
    hr: 'الموارد البشرية', hrSub: 'إدارة شؤون الموظفين والإجازات والحضور',
    attendance: 'الحضور', leaves: 'الإجازات', payroll: 'الرواتب',
    present: 'حاضر اليوم', onLeave: 'في إجازة', late: 'متأخرون', totalPayroll: 'إجمالي الرواتب',
    employee: 'الموظف', status: 'الحالة', checkIn: 'وقت الحضور', dept: 'القسم',
  },
  en: {
    hr: 'Human Resources', hrSub: 'Personnel management, attendance tracking and payroll',
    attendance: 'Attendance', leaves: 'Leave Requests', payroll: 'Payroll',
    present: 'Present Today', onLeave: 'On Leave', late: 'Late Arrivals', totalPayroll: 'Total Payroll',
    employee: 'Employee', status: 'Status', checkIn: 'Check-in', dept: 'Department',
  }
};

const statusColor: Record<string, string> = {
  PRESENT: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  LATE: 'text-amber-600 bg-amber-50 border-amber-100',
  ABSENT: 'text-rose-600 bg-rose-50 border-rose-100',
  REMOTE: 'text-blue-600 bg-blue-50 border-blue-100',
  HALF_DAY: 'text-violet-600 bg-violet-50 border-violet-100',
  PENDING: 'text-amber-600 bg-amber-50 border-amber-100',
  APPROVED: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  REJECTED: 'text-rose-600 bg-rose-50 border-rose-100',
};

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.04 } } };

export default function HrPage() {
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const { user } = useAuthStore();
  const t = T[language as keyof typeof T] || T.en;
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'attendance' | 'leaves' | 'payroll'>('attendance');
  const queryClient = useQueryClient();

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ type: 'ANNUAL', startDate: '', endDate: '', reason: '' });
  const [saving, setSaving] = useState(false);

  const { data: attendanceData } = useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      const res = await getAttendanceToday();
      return res.data || [];
    },
    enabled: tab === 'attendance',
  });

  const { data: leavesData } = useQuery({
    queryKey: ['leaves'],
    queryFn: async () => {
      const res = await getLeaveRequests();
      return res.data || [];
    },
    enabled: tab === 'leaves',
  });

  const { data: payrollData } = useQuery({
    queryKey: ['payroll'],
    queryFn: async () => {
      const res = await getPayrollRecords();
      return res.data || [];
    },
  });

  const attendanceMutation = useMutation({
    mutationFn: (action: 'IN' | 'OUT') => selfAttendance(action),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['attendance'] });
        toast.success(isRtl ? 'تم تسجيل حضورك' : 'Attendance recorded');
      } else {
        toast.error(res.error || 'Operation failed');
      }
    }
  });

  const leaveMutation = useMutation({
    mutationFn: (data: any) => requestLeave(data),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['leaves'] });
        setIsLeaveModalOpen(false);
        toast.success(isRtl ? 'تم إرسال طلب الإجازة' : 'Leave request submitted');
      } else {
        toast.error(res.error || 'Request failed');
      }
    }
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => updateLeaveStatus(id, status),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['leaves'] });
        toast.success(isRtl ? 'تم تحديث حالة الطلب' : 'Status updated');
      } else {
        toast.error(res.error || 'Update failed');
      }
    }
  });

  const handleLeaveRequest = () => {
    const start = new Date(leaveForm.startDate);
    const end = new Date(leaveForm.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    leaveMutation.mutate({ ...leaveForm, daysCount: days });
  };

  const SAMPLE_ATTENDANCE = (attendanceData || []).filter((a: any) => 
    a.userName?.toLowerCase().includes(search.toLowerCase()) ||
    a.department?.toLowerCase().includes(search.toLowerCase())
  );
  
  const SAMPLE_LEAVES = (leavesData || []).filter((l: any) => 
    l.userName?.toLowerCase().includes(search.toLowerCase()) ||
    l.type?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { key: 'attendance' as const, label: t.attendance, icon: Clock },
    { key: 'leaves' as const, label: t.leaves, icon: Calendar },
    { key: 'payroll' as const, label: t.payroll, icon: Briefcase },
  ];

  const presentCount = (attendanceData || []).filter((a: any) => a.status === 'PRESENT' || a.status === 'REMOTE').length;
  const lateCount = (attendanceData || []).filter((a: any) => a.status === 'LATE').length;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader title={t.hr} description={t.hrSub} />

      <motion.div variants={fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card !p-6 border-brand/20 bg-brand/5 relative overflow-hidden group shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                    <Clock size={20} />
                </div>
                <span className="text-[9px] font-black text-brand uppercase tracking-widest px-2 py-1 bg-brand/20 rounded-lg">Real-time</span>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Daily Attendance</p>
            <div className="flex gap-2">
                <button 
                    onClick={() => attendanceMutation.mutate('IN')}
                    className="flex-1 py-2 rounded-lg bg-brand text-white text-[9px] font-black uppercase tracking-widest hover:bg-brand/90 transition-all shadow-md"
                >
                    Check In
                </button>
                <button 
                    onClick={() => attendanceMutation.mutate('OUT')}
                    className="flex-1 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                    Check Out
                </button>
            </div>
        </div>
        <StatCard label={t.onLeave} value={(leavesData || []).filter((l: any) => l.status === 'APPROVED').length} icon={<Calendar size={18} />} />
        <StatCard label={t.late} value={lateCount} icon={<Clock size={18} />} trend="down" delta={String(lateCount)} />
        <StatCard label={t.totalPayroll} value={`₪${payrollData?.reduce((a: number, r: any) => a + Number(r.netSalary), 0).toLocaleString() || '0'}`} icon={<Briefcase size={18} />} />
      </motion.div>

      {/* Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            {tabs.map(tb => (
            <button key={tb.key} onClick={() => { setTab(tb.key); setSearch(''); }} className={clsx(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border',
                tab === tb.key ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50 hover:text-slate-900'
            )}>
                <tb.icon size={13} /> {tb.label}
            </button>
            ))}
        </div>
        
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">
            <div className="flex-1 flex items-center gap-4 bg-white border border-slate-100 rounded-xl px-5 py-2.5 focus-within:border-brand/40 transition-all shadow-sm">
                <Search size={16} className="text-slate-400" />
                <input 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder={isRtl ? 'بحث في الموظفين...' : 'Search personnel...'} 
                    className="bg-transparent text-xs text-slate-900 outline-none w-full font-medium placeholder:text-slate-300" 
                />
            </div>
            {tab === 'leaves' && (
                <button 
                    onClick={() => setIsLeaveModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-105 transition-all whitespace-nowrap"
                >
                    <Plus size={14} /> {isRtl ? 'طلب إجازة' : 'Request Leave'}
                </button>
            )}
        </div>
      </div>

      {/* Attendance Tab */}
      {tab === 'attendance' && (
        <motion.div variants={fadeIn} className="glass-card !p-0 overflow-hidden border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full">
                <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                    {[t.employee, t.dept, t.status, t.checkIn, 'Check-out'].map((h, i) => (
                    <th key={i} className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {SAMPLE_ATTENDANCE.length === 0 ? (
                    <tr><td colSpan={5} className="p-20 text-center text-slate-300 uppercase tracking-[0.3em] text-[9px] font-black">No Records Found</td></tr>
                ) : SAMPLE_ATTENDANCE.map((a: any) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-900">{a.userName?.[0] || '?'}</div>
                        <span className="text-sm font-bold text-slate-900">{a.userName}</span>
                        </div>
                    </td>
                    <td className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{a.department || a.dept}</td>
                    <td className="px-8 py-5">
                        <span className={clsx('text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border', statusColor[a.status] || 'text-slate-400 bg-slate-50 border-slate-100')}>
                        {a.status}
                        </span>
                    </td>
                    <td className="px-8 py-5 text-xs font-mono text-slate-400">{a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td className="px-8 py-5 text-xs font-mono text-slate-400">{a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Leaves Tab */}
      {tab === 'leaves' && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
          {SAMPLE_LEAVES.map((l: any) => (
            <motion.div key={l.id} variants={fadeIn} className="glass-card !p-5 flex items-center gap-4 border-slate-100 bg-white hover:bg-slate-50 hover:border-brand/20 transition-all group shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-black text-slate-900">{l.userName?.[0] || '?'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{l.userName}</p>
                    <span className={clsx('text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest border', statusColor[l.status])}>
                        {l.status}
                    </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 font-black uppercase tracking-tight">
                    {l.type} · {l.daysCount || l.days} DAYS · FROM {new Date(l.startDate).toLocaleDateString()}
                </p>
                {l.reason && <p className="text-[10px] text-slate-400 mt-1 italic opacity-70">"{l.reason}"</p>}
              </div>
              
              {['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(user?.role || '') && l.status === 'PENDING' && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => approveMutation.mutate({ id: l.id, status: 'APPROVED' })}
                        className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                      >
                          Approve
                      </button>
                      <button 
                        onClick={() => approveMutation.mutate({ id: l.id, status: 'REJECTED' })}
                        className="px-4 py-2 rounded-lg bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 shadow-lg shadow-rose-500/20"
                      >
                          Reject
                      </button>
                  </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Leave Modal */}
      <Modal open={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} title={isRtl ? 'طلب إجازة جديد' : 'New Leave Request'}>
          <div className="space-y-6 pt-2">
              <Select 
                label={isRtl ? 'نوع الإجازة' : 'Leave Type'}
                value={leaveForm.type}
                options={[
                    { value: 'ANNUAL', label: isRtl ? 'سنوية' : 'Annual' },
                    { value: 'SICK', label: isRtl ? 'مرضية' : 'Sick' },
                    { value: 'EMERGENCY', label: isRtl ? 'طارئة' : 'Emergency' },
                    { value: 'UNPAID', label: isRtl ? 'بدون راتب' : 'Unpaid' },
                ]}
                onChange={(e: any) => setLeaveForm({ ...leaveForm, type: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label={isRtl ? 'تاريخ البدء' : 'Start Date'}
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e: any) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  />
                  <Input 
                    label={isRtl ? 'تاريخ الانتهاء' : 'End Date'}
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e: any) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  />
              </div>
              <Input 
                label={isRtl ? 'السبب' : 'Reason'}
                placeholder="..."
                value={leaveForm.reason}
                onChange={(e: any) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              />
              <div className="flex justify-end gap-3 pt-6">
                  <button onClick={() => setIsLeaveModalOpen(false)} className="px-6 py-2.5 rounded-xl bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100">
                      {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button 
                    onClick={handleLeaveRequest}
                    disabled={leaveMutation.isPending}
                    className="px-8 py-2.5 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 disabled:opacity-50"
                  >
                      {leaveMutation.isPending ? 'Submitting...' : (isRtl ? 'إرسال الطلب' : 'Submit Request')}
                  </button>
              </div>
          </div>
      </Modal>

      {/* Payroll Tab */}
      {tab === 'payroll' && (
        <motion.div variants={fadeIn} className="glass-card p-12 text-center">
          <Briefcase size={32} className="text-slate-600 mx-auto mb-4" />
          <p className="text-sm font-bold text-white mb-1">Payroll Processing</p>
          <p className="text-xs text-slate-500">Connect to payroll Server Actions for full salary management.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
