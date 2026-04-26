'use client';

import { motion } from 'framer-motion';
import {
  Users, AlertCircle, Activity, ArrowUpRight, Zap,
  TrendingUp, TrendingDown, ChevronRight, Clock,
  DollarSign, CheckCircle, BarChart2
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import Link from 'next/link';
import { getPendingExtensions, approveExtension } from '@/lib/actions/extensions';
import { getEmployeesForSecretary } from '@/lib/actions/hr';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const T = {
  ar: {
    title: 'مركز القيادة', sub: 'لوحة تحكم استراتيجية متكاملة',
    revenue: 'إجمالي الإيرادات', users: 'المستخدمون النشطون',
    tasks: 'المهام المعلقة', invoices: 'الفواتير المتأخرة',
    revChart: 'مخطط التدفق المالي', activity: 'النشاط الأخير',
    viewAll: 'عرض السجلات', health: 'صحة النظام',
  },
  en: {
    title: 'Command Center', sub: 'Integrated strategic intelligence dashboard',
    revenue: 'Total Revenue', users: 'Active Users',
    tasks: 'Pending Tasks', invoices: 'Overdue Invoices',
    revChart: 'Revenue Flow', activity: 'Live Activity Feed',
    viewAll: 'View all logs', health: 'System Health',
  }
};

const SAMPLE_REVENUE_DATA = [
  { month: 'Jan', revenue: 4000 },
  { month: 'Feb', revenue: 3000 },
  { month: 'Mar', revenue: 5000 },
  { month: 'Apr', revenue: 4500 },
  { month: 'May', revenue: 6000 },
  { month: 'Jun', revenue: 5500 },
];

const fadeIn = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

function KpiCard({ label, value, delta, icon, trend }: any) {
  return (
    <motion.div variants={fadeIn} className="glass-card p-6 border-slate-100">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand/5 border border-brand/10 text-brand">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${trend === 'up' ? 'text-emerald-600 bg-emerald-50' : trend === 'down' ? 'text-rose-600 bg-rose-50' : 'text-slate-400 bg-slate-50'
          }`}>
          {trend === 'up' ? <TrendingUp size={11} /> : trend === 'down' ? <TrendingDown size={11} /> : null}
          {delta}
        </div>
      </div>
      <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-widest font-black">{label}</p>
      <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { language } = useUIStore();
  const t = T[language as keyof typeof T] || T.en;
  const isRtl = language === 'ar';

  const [extensions, setExtensions] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [extRes, attRes] = await Promise.all([getPendingExtensions(), getEmployeesForSecretary()]);
      if (extRes.success) setExtensions(extRes.data || []);
      if (attRes.success) setAttendance(attRes.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleExtension = async (id: string, approve: boolean) => {
    const res = await approveExtension(id, approve);
    if (res.success) {
      toast.success(approve ? 'Extension Approved' : 'Request Rejected');
      setExtensions(extensions.filter(e => e.id !== id));
    }
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeIn} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-1 uppercase tracking-tight">{t.title}</h1>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t.sub}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-100 bg-emerald-50">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t.health}: 99.2%</span>
        </div>
      </motion.div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label={t.revenue} value="$128.4k" delta="+12.4%" trend="up" icon={<DollarSign size={18} />} />
        <KpiCard label={t.users} value="1,240" delta="+42" trend="up" icon={<Users size={18} />} />
        <KpiCard label={t.tasks} value={extensions.length} delta="Pending Extensions" icon={<Clock size={18} />} />
        <KpiCard label={t.invoices} value="3" delta="Alert" trend="down" icon={<AlertCircle size={18} />} />
      </div>

      {/* Admin Quick View (Secretary & Extensions) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Secretary Watchlist Summary */}
        <motion.div variants={fadeIn} className="glass-card p-6 border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-brand" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{isRtl ? 'ملخص الحضور (السكرتيرة)' : 'Attendance Sync'}</h3>
            </div>
          </div>
          <div className="space-y-3">
            {attendance.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-900">
                    {a.name?.[0]}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{a.name}</p>
                    <p className={clsx(
                      "text-[9px] font-black uppercase tracking-widest",
                      a.attendance?.status === 'PRESENT' ? 'text-emerald-600' : 'text-slate-400'
                    )}>{a.attendance?.status || 'ABSENT'}</p>
                  </div>
                </div>
                {a.attendance?.checkIn && (
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(a.attendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            ))}
            <Link href="/secretary" className="block text-center py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-brand transition-colors mt-2">
              {isRtl ? 'عرض القائمة الكاملة' : 'View Full Watchlist'}
            </Link>
          </div>
        </motion.div>

        {/* Extension Requests */}
        <motion.div variants={fadeIn} className="glass-card p-6 border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{isRtl ? 'طلبات تمديد الموعد' : 'Extension Requests'}</h3>
            </div>
          </div>
          <div className="space-y-3">
            {extensions.length === 0 ? (
              <p className="text-[10px] font-black text-slate-400 py-10 text-center uppercase tracking-widest">No pending requests</p>
            ) : extensions.map(e => (
              <div key={e.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{e.task?.title}</p>
                  <span className="text-[9px] text-rose-500 font-black uppercase tracking-widest">{new Date(e.requestedDate).toLocaleDateString()}</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-3 italic">"{e.reason}"</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExtension(e.id, true)}
                    className="flex-1 py-2 rounded-lg bg-brand text-white text-[9px] font-black uppercase tracking-widest hover:bg-brand/90 transition-all shadow-md shadow-brand/10"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleExtension(e.id, false)}
                    className="flex-1 py-2 rounded-lg bg-rose-50 text-rose-500 border border-rose-100 text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Revenue Flow */}
        <motion.div variants={fadeIn} className="xl:col-span-8 glass-card p-6 border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand/5 border border-brand/10 flex items-center justify-center">
                <BarChart2 size={16} className="text-brand" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{t.revChart}</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Financial Pulse</p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SAMPLE_REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1C93B2" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#1C93B2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#1C93B2' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#1C93B2" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live Activity Feed */}
        <motion.div variants={fadeIn} className="xl:col-span-4 glass-card p-6 border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-brand" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{t.activity}</h3>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          </div>

          <div className="flex-1 space-y-4">
            {[
              { id: 1, user: 'Ahmed S.', action: 'authorized', entity: 'new procurement', time: '2m ago' },
              { id: 2, user: 'Sarah K.', action: 'updated', entity: 'financial audit', time: '14m ago' },
              { id: 3, user: 'System', action: 'completed', entity: 'node synchronization', time: '1h ago' },
              { id: 4, user: 'Ibrahim Blue', action: 'signed', entity: 'contract #204', time: '3h ago' },
            ].map((a, idx) => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-brand/20 transition-all">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:text-brand transition-colors">
                  {a.user[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-600 leading-tight">
                    <span className="font-black text-slate-900 uppercase tracking-tight">{a.user}</span> {a.action} <span className="font-bold text-brand">{a.entity}</span>
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock size={8} className="text-slate-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{a.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/audit"
            className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 hover:text-brand hover:border-brand/20 transition-all uppercase tracking-widest"
          >
            {t.viewAll}
            <ChevronRight size={14} />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
