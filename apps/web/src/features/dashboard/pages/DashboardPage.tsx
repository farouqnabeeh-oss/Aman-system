import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell
} from 'recharts';
import {
  Users, AlertCircle, Activity, ArrowUpRight, Zap,
  TrendingUp, TrendingDown, ChevronRight, Clock,
  DollarSign, CheckCircle, Target, BarChart2
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { useUIStore } from '@/store/ui.store';
import { ErrorState, PageHeader } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { clsx } from 'clsx';

const T = {
  ar: {
    title: 'مركز القيادة الاستراتيجي', sub: 'لوحة تحكم استراتيجية متكاملة لرقابة العمليات',
    revenue: 'إجمالي الإيرادات', users: 'المستخدمون النشطون',
    tasks: 'المهام المعلقة', invoices: 'الفواتير المتأخرة',
    revChart: 'مخطط التدفق المالي', deptRadar: 'كفاءة الأقسام',
    activity: 'النشاط اللحظي', viewAll: 'عرض السجلات',
    taskDist: 'توزيع المهام', health: 'صحة النظام',
    growth: 'نمو الشهر', peak: 'الذروة الشهرية',
  },
  en: {
    title: 'Strategic Command', sub: 'Integrated strategic intelligence dashboard',
    revenue: 'Total Revenue', users: 'Active Users',
    tasks: 'Pending Tasks', invoices: 'Overdue Invoices',
    revChart: 'Revenue Flow', deptRadar: 'Department Performance',
    activity: 'Live Activity Feed', viewAll: 'View all logs',
    taskDist: 'Task Distribution', health: 'System Health',
    growth: 'Monthly Growth', peak: 'Monthly Peak',
  }
};

const TASK_DIST_DATA = [
  { name: 'Done', value: 45, color: '#10b981' },
  { name: 'In Progress', value: 30, color: '#3b82f6' },
  { name: 'Pending', value: 15, color: '#f59e0b' },
  { name: 'Blocked', value: 10, color: '#ef4444' },
];

const fadeIn = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

function KpiCard({ label, value, delta, icon, color, bg, trend }: any) {
  return (
    <motion.div variants={fadeIn} className="stat-card group hover-lift border-[var(--border)]">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${bg} border border-[var(--border)] shadow-sm`}>
          <span className={color}>{icon}</span>
        </div>
        <div className={clsx(
            'flex items-center gap-1.5 text-[10px] font-black px-2 py-1 rounded-xl uppercase tracking-wider border',
            trend === 'up' && 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
            trend === 'down' && 'text-rose-500 bg-rose-500/10 border-rose-500/20',
            trend === 'neutral' && 'text-[var(--text-4)] bg-[var(--bg-glass)] border-[var(--border)]',
          )}>
          {trend === 'up' && <TrendingUp size={11} />}
          {trend === 'down' && <TrendingDown size={11} />}
          {delta}
        </div>
      </div>
      <p className="text-[10px] text-[var(--text-4)] mb-1.5 uppercase font-black tracking-[0.2em]">{label}</p>
      <p className="text-2xl font-black text-[var(--text-1)] tracking-tight">{value}</p>
    </motion.div>
  );
}

export function DashboardPage() {
  const { language, theme } = useUIStore();
  const t = T[language];
  const isDark = theme === 'dark';

  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: () => api.get<any>('/dashboard/kpis').then(r => r.data.data),
    staleTime: 0,
    refetchInterval: 30000,
  });

  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ['dashboard', 'revenue'],
    queryFn: () => api.get<any>('/dashboard/revenue-chart').then(r => r.data.data),
  });

  const { data: deptPerf, isLoading: deptLoading } = useQuery({
    queryKey: ['dashboard', 'departments'],
    queryFn: () => api.get<any>('/dashboard/department-performance').then(r => r.data.data),
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => api.get<any>('/dashboard/recent-activity').then(r => r.data.data),
    staleTime: 0,
    refetchInterval: 10000,
  });

  if (kpisError) return <ErrorState message="Failed to load command center" onRetry={() => window.location.reload()} />;

  const radarData = (deptPerf ?? []).slice(0, 6).map((d: any) => ({
    dept: d.department?.slice(0, 4),
    value: d.utilizationPercent ?? 0,
  }));

  const tooltipStyle = {
    backgroundColor: isDark ? '#111827' : '#ffffff',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(14,165,233,0.15)'}`,
    borderRadius: '12px',
    color: isDark ? '#f1f5f9' : '#0f172a',
    fontSize: '12px',
    padding: '10px 14px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeIn}>
        <PageHeader 
          title={t.title} 
          description={t.sub} 
          badge={{ label: `${t.health}: 99.2%`, color: 'green' }}
        />
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {kpisLoading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)
        ) : (
          <>
            <KpiCard label={t.revenue} value={`$${((kpis?.totalRevenue || 0) / 1000).toFixed(1)}k`}
              delta="+12.4%" trend="up" icon={<DollarSign size={20} />} color="text-emerald-500" bg="bg-emerald-500/10" />
            <KpiCard label={t.users} value={kpis?.activeUsers ?? 0}
              delta="+4" trend="up" icon={<Users size={20} />} color="text-blue-500" bg="bg-blue-500/10" />
            <KpiCard label={t.tasks} value={kpis?.pendingTasks ?? 0}
              delta="Active" icon={<CheckCircle size={20} />} color="text-amber-500" bg="bg-amber-500/10" />
            <KpiCard label={t.invoices} value={kpis?.overdueInvoices ?? 0}
              delta="Alert" trend="down" icon={<AlertCircle size={20} />} color="text-rose-500" bg="bg-rose-500/10" />
          </>
        )}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <motion.div variants={fadeIn} className="xl:col-span-8 glass-card p-8 border-[var(--border)]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center">
                <BarChart2 size={20} className="text-brand" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[var(--text-1)] uppercase tracking-widest">{t.revChart}</h3>
                <p className="text-xs text-[var(--text-4)] mt-1 font-medium">12-month rolling window</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] text-[var(--text-4)] font-black uppercase tracking-widest">{t.peak}</p>
                <p className="text-lg font-black text-[var(--text-1)]">$12.4k</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[var(--text-4)] font-black uppercase tracking-widest">{t.growth}</p>
                <p className="text-lg font-black text-emerald-500">+8.2%</p>
              </div>
            </div>
          </div>

          {revenueLoading ? (
            <Skeleton className="h-64 rounded-2xl" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenue ?? []} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: 'var(--text-4)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-4)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(14,165,233,0.1)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} fill="url(#revGrad)" dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: isDark ? '#0f172a' : '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <div className="xl:col-span-4 flex flex-col gap-6">
          <motion.div variants={fadeIn} className="glass-card p-8 flex-1 border-[var(--border)]">
            <div className="flex items-center gap-3 mb-6">
              <Target size={18} className="text-indigo-500" />
              <h3 className="text-sm font-black text-[var(--text-1)] uppercase tracking-widest">{t.deptRadar}</h3>
            </div>
            {deptLoading ? (
              <Skeleton className="h-56 rounded-2xl" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(14,165,233,0.1)"} />
                  <PolarAngleAxis tick={{ fill: 'var(--text-4)', fontSize: 10, fontWeight: 700 }} dataKey="dept" />
                  <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                  <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          <motion.div variants={fadeIn} className="glass-card p-6 border-[var(--border)]">
            <p className="text-[10px] font-black text-[var(--text-4)] uppercase tracking-[0.2em] mb-4">System Telemetry</p>
            {[
              { label: 'Storage', used: 64, color: '#3b82f6' },
              { label: 'API Load', used: 38, color: '#10b981' },
              { label: 'Network', used: 82, color: '#6366f1' },
            ].map(m => (
              <div key={m.label} className="mb-4">
                <div className="flex justify-between text-[11px] font-bold mb-1.5">
                  <span className="text-[var(--text-3)]">{m.label}</span>
                  <span className="text-[var(--text-1)]">{m.used}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--bg-glass)] overflow-hidden border border-[var(--border)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.used}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full rounded-full"
                    style={{ background: m.color }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div variants={fadeIn} className="lg:col-span-5 glass-card p-8 border-[var(--border)]">
          <div className="flex items-center gap-3 mb-8">
            <Zap size={18} className="text-amber-500" />
            <h3 className="text-sm font-black text-[var(--text-1)] uppercase tracking-widest">{t.taskDist}</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={TASK_DIST_DATA} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-4)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-4)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(14,165,233,0.05)' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={36}>
                {TASK_DIST_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-4 mt-8">
            {TASK_DIST_DATA.map(d => (
              <div key={d.name} className="flex items-center gap-3 p-2 rounded-xl bg-[var(--bg-glass)] border border-[var(--border)]">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-[10px] text-[var(--text-4)] font-bold uppercase tracking-wider">{d.name}</span>
                <span className="text-xs font-black text-[var(--text-1)] ml-auto">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeIn} className="lg:col-span-7 glass-card p-8 flex flex-col border-[var(--border)]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Activity size={18} className="text-teal-500" />
              <h3 className="text-sm font-black text-[var(--text-1)] uppercase tracking-widest">{t.activity}</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 pulse-dot" />
              <span className="text-[10px] font-black uppercase text-teal-500 tracking-widest">Live Feed</span>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            {activityLoading ? (
              [1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-2xl mb-2" />)
            ) : (
              (activity ?? []).slice(0, 6).map((a: any, idx: number) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-4 py-4 border-b border-[var(--border)] last:border-0 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[var(--bg-glass)] border border-[var(--border)] flex items-center justify-center text-[10px] font-black text-[var(--text-3)] flex-shrink-0 group-hover:bg-brand/10 group-hover:text-brand transition-all">
                    {a.user ? `${a.user.firstName?.[0]}${a.user.lastName?.[0]}` : '⚡'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-2)] truncate">
                      <span className="font-bold text-[var(--text-1)]">
                        {a.user ? `${a.user.firstName} ${a.user.lastName}` : 'System'}
                      </span>
                      {' '}{a.action?.toLowerCase()}ed {a.entity}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={11} className="text-[var(--text-4)]" />
                      <p className="text-[10px] text-[var(--text-4)] font-bold">{new Date(a.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="px-2 py-0.5 rounded-lg bg-[var(--bg-glass)] border border-[var(--border)] text-[9px] font-black uppercase tracking-widest text-[var(--text-4)]">{a.action}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <Link
            to="/audit-logs"
            className="mt-6 flex items-center justify-between px-5 py-3 rounded-2xl bg-[var(--bg-glass)] hover:bg-brand/5 border border-[var(--border)] hover:border-brand/20 transition-all group"
          >
            <span className="text-xs font-black uppercase tracking-widest text-[var(--text-4)] group-hover:text-brand transition-colors">{t.viewAll}</span>
            <ChevronRight size={14} className="text-[var(--text-4)] group-hover:text-brand transition-colors" />
          </Link>
        </motion.div>
      </div>

      <motion.div variants={fadeIn} className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Success Rate', value: '87%', icon: <CheckCircle size={16} className="text-emerald-500" />, color: 'text-emerald-500' },
          { label: 'Avg Latency', value: '24ms', icon: <Clock size={16} className="text-blue-500" />, color: 'text-blue-500' },
          { label: 'Active Streams', value: kpis?.activeProjects ?? 12, icon: <Target size={16} className="text-amber-500" />, color: 'text-amber-500' },
          { label: 'Growth Vector', value: '+8.2%', icon: <ArrowUpRight size={16} className="text-teal-500" />, color: 'text-teal-500' },
        ].map(s => (
          <div key={s.label} className="stat-card p-5 flex items-center gap-4 hover-lift border-[var(--border)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-glass)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">{s.icon}</div>
            <div>
              <p className="text-[10px] font-black text-[var(--text-4)] uppercase tracking-widest mb-0.5">{s.label}</p>
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
