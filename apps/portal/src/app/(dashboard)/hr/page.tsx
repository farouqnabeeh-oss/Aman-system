'use client';

import { useState } from 'react';
import { Users, Calendar, Clock, UserCheck, Briefcase, TrendingUp, Search, Plus } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '@/components/ui/States';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

import { getAttendanceToday, getLeaveRequests } from '@/lib/actions/hr';
import { useQuery } from '@tanstack/react-query';

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
  PRESENT: 'text-emerald-400 bg-emerald-500/10',
  LATE: 'text-amber-400 bg-amber-500/10',
  ABSENT: 'text-rose-400 bg-rose-500/10',
  REMOTE: 'text-blue-400 bg-blue-500/10',
  HALF_DAY: 'text-violet-400 bg-violet-500/10',
  PENDING: 'text-amber-400 bg-amber-500/10',
  APPROVED: 'text-emerald-400 bg-emerald-500/10',
  REJECTED: 'text-rose-400 bg-rose-500/10',
};

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.04 } } };

export default function HrPage() {
  const { language } = useUIStore();
  const t = T[language as keyof typeof T] || T.en;
  const [tab, setTab] = useState<'attendance' | 'leaves' | 'payroll'>('attendance');

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

  const SAMPLE_ATTENDANCE = attendanceData || [];
  const SAMPLE_LEAVES = leavesData || [];

  const tabs = [
    { key: 'attendance' as const, label: t.attendance, icon: Clock },
    { key: 'leaves' as const, label: t.leaves, icon: Calendar },
    { key: 'payroll' as const, label: t.payroll, icon: Briefcase },
  ];

  const presentCount = SAMPLE_ATTENDANCE.filter(a => a.status === 'PRESENT' || a.status === 'REMOTE').length;
  const lateCount = SAMPLE_ATTENDANCE.filter(a => a.status === 'LATE').length;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader title={t.hr} description={t.hrSub} />

      <motion.div variants={fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t.present} value={presentCount} icon={<UserCheck size={18} />} delta="Live" trend="up" />
        <StatCard label={t.onLeave} value={SAMPLE_LEAVES.filter(l => l.status === 'APPROVED').length} icon={<Calendar size={18} />} />
        <StatCard label={t.late} value={lateCount} icon={<Clock size={18} />} trend="down" delta={String(lateCount)} />
        <StatCard label={t.totalPayroll} value="$42.5k" icon={<Briefcase size={18} />} />
      </motion.div>

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

      {/* Attendance Tab */}
      {tab === 'attendance' && (
        <motion.div variants={fadeIn} className="glass-card !p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {[t.employee, t.dept, t.status, t.checkIn, 'Check-out'].map((h, i) => (
                  <th key={i} className="px-5 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ATTENDANCE.map((a: any) => (
                <tr key={a.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs text-white">{a.userName?.[0] || '?'}</div>
                      <span className="text-sm font-bold text-white">{a.userName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{a.department || a.dept}</td>
                  <td className="px-5 py-4">
                    <span className={clsx('text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest', statusColor[a.status] || 'text-slate-400 bg-white/5')}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs font-mono text-slate-400">{a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                  <td className="px-5 py-4 text-xs font-mono text-slate-400">{a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Leaves Tab */}
      {tab === 'leaves' && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
          {SAMPLE_LEAVES.map((l: any) => (
            <motion.div key={l.id} variants={fadeIn} className="glass-card !p-5 flex items-center gap-4 hover:border-white/15 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sm font-black text-white">{l.userName?.[0] || '?'}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{l.userName}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{l.type} · {l.days || l.daysCount?.toString()} days · from {new Date(l.startDate).toLocaleDateString()}</p>
              </div>
              <span className={clsx('text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest flex-shrink-0', statusColor[l.status])}>
                {l.status}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}

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
