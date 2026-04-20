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
import { ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';

const T = {
  ar: {
    title: 'مركز القيادة', sub: 'لوحة تحكم استراتيجية متكاملة',
    revenue: 'إجمالي الإيرادات', users: 'المستخدمون النشطون',
    tasks: 'المهام المعلقة', invoices: 'الفواتير المتأخرة',
    revChart: 'مخطط التدفق المالي', deptRadar: 'كفاءة الأقسام',
    activity: 'النشاط الأخير', viewAll: 'عرض كل السجلات',
    taskDist: 'توزيع المهام', health: 'صحة النظام',
    growth: 'نمو الشهر', peak: 'الذروة الشهرية',
  },
  en: {
    title: 'Command Center', sub: 'Integrated strategic intelligence dashboard',
    revenue: 'Total Revenue', users: 'Active Users',
    tasks: 'Pending Tasks', invoices: 'Overdue Invoices',
    revChart: 'Revenue Flow', deptRadar: 'Department Performance',
    activity: 'Live Activity Feed', viewAll: 'View all logs',
    taskDist: 'Task Distribution', health: 'System Health',
    growth: 'Monthly Growth', peak: 'Monthly Peak',
  }
};

// Sample task distribution data
const TASK_DIST_DATA = [
  { name: 'Done', value: 45, color: '#10b981' },
  { name: 'In Progress', value: 30, color: '#3b82f6' },
  { name: 'Pending', value: 15, color: '#f59e0b' },
  { name: 'Blocked', value: 10, color: '#ef4444' },
];

// Fade-in variant for sections
const fadeIn = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

function KpiCard({ label, value, delta, icon, color, bg, trend }: any) {
  return (
    <motion.div variants={fadeIn} className="stat-card group hover-lift">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
          <span className={color}>{icon}</span>
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
          trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' : trend === 'down' ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 bg-slate-700/30'
        }`}>
          {trend === 'up' ? <TrendingUp size={11}/> : trend === 'down' ? <TrendingDown size={11}/> : null}
          {delta}
        </div>
      </div>
      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );
}

const tooltipStyle = {
  backgroundColor: '#111827',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  color: '#f1f5f9',
  fontSize: '12px',
  padding: '10px 14px',
};

export function DashboardPage() {
  const { language } = useUIStore();
  const t = T[language];

  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: () => api.get<any>('/dashboard/kpis').then(r => r.data.data),
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
  });

  if (kpisError) return <ErrorState message="Failed to load dashboard" onRetry={() => window.location.reload()} />;

  // Transform dept data for radar
  const radarData = (deptPerf ?? []).slice(0, 6).map((d: any) => ({
    dept: d.department?.slice(0, 4),
    value: d.utilizationPercent ?? 0,
  }));

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
          <h1 className="text-2xl font-bold text-white mb-1">{t.title}</h1>
          <p className="text-sm text-slate-500">{t.sub}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" style={{ color: '#10b981' }} />
          <span className="text-xs font-semibold text-emerald-400">{t.health}: 99.2%</span>
        </div>
      </motion.div>

      {/* KPI cards */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpisLoading ? (
          [1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)
        ) : (
          <>
            <KpiCard label={t.revenue} value={`$${((kpis?.totalRevenue||0)/1000).toFixed(1)}k`}
              delta="+12.4%" trend="up" icon={<DollarSign size={18}/>} color="text-emerald-400" bg="bg-emerald-500/10" />
            <KpiCard label={t.users} value={kpis?.activeUsers ?? 0}
              delta="+4" trend="up" icon={<Users size={18}/>} color="text-blue-400" bg="bg-blue-500/10" />
            <KpiCard label={t.tasks} value={kpis?.pendingTasks ?? 0}
              delta="Active" icon={<CheckCircle size={18}/>} color="text-amber-400" bg="bg-amber-500/10" />
            <KpiCard label={t.invoices} value={kpis?.overdueInvoices ?? 0}
              delta="Alert" trend="down" icon={<AlertCircle size={18}/>} color="text-rose-400" bg="bg-rose-500/10" />
          </>
        )}
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* Revenue Area Chart — spans 8 cols */}
        <motion.div variants={fadeIn} className="xl:col-span-8 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <BarChart2 size={16} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{t.revChart}</h3>
                <p className="text-xs text-slate-600">12-month rolling window</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-600 uppercase tracking-wider">{t.peak}</p>
                <p className="text-sm font-bold text-white">$12.4k</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-600 uppercase tracking-wider">{t.growth}</p>
                <p className="text-sm font-bold text-emerald-400">+8.2%</p>
              </div>
            </div>
          </div>

          {revenueLoading ? (
            <Skeleton className="h-56 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenue ?? []} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGridCustom />
                <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Right column: Radar + mini stats */}
        <div className="xl:col-span-4 flex flex-col gap-5">

          {/* Department Radar */}
          <motion.div variants={fadeIn} className="glass-card p-6 flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Target size={15} className="text-violet-400" />
              <h3 className="text-sm font-semibold text-white">{t.deptRadar}</h3>
            </div>
            {deptLoading ? (
              <Skeleton className="h-44 rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis tick={{ fill: '#475569', fontSize: 10 }} dataKey="dept" />
                  <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                  <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* System metrics mini */}
          <motion.div variants={fadeIn} className="glass-card p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">System Metrics</p>
            {[
              { label: 'Storage', used: 64, color: '#3b82f6' },
              { label: 'API Load', used: 38, color: '#10b981' },
              { label: 'Users Online', used: 82, color: '#6366f1' },
            ].map(m => (
              <div key={m.label} className="mb-2.5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{m.label}</span>
                  <span className="text-white font-medium">{m.used}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.used}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: m.color }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Task distribution + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Task distribution bar chart */}
        <motion.div variants={fadeIn} className="lg:col-span-5 glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Zap size={15} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white">{t.taskDist}</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={TASK_DIST_DATA} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                {TASK_DIST_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {TASK_DIST_DATA.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-xs text-slate-500">{d.name}</span>
                <span className="text-xs font-semibold text-white ml-auto">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Live Activity Feed */}
        <motion.div variants={fadeIn} className="lg:col-span-7 glass-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-teal-400" />
              <h3 className="text-sm font-semibold text-white">{t.activity}</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 pulse-dot" style={{ color: '#14b8a6' }} />
              <span className="text-[11px] text-teal-400">Live</span>
            </div>
          </div>

          <div className="flex-1 space-y-0">
            {activityLoading ? (
              [1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 rounded-xl mb-2" />)
            ) : (
              (activity ?? []).slice(0, 6).map((a: any, idx: number) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0 group-hover:bg-white/8 transition-all">
                    {a.user ? `${a.user.firstName?.[0]}${a.user.lastName?.[0]}` : '⚡'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 truncate">
                      <span className="font-medium text-white">
                        {a.user ? `${a.user.firstName} ${a.user.lastName}` : 'System'}
                      </span>
                      {' '}{a.action?.toLowerCase()}ed {a.entity}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock size={10} className="text-slate-600" />
                      <p className="text-[11px] text-slate-600">{new Date(a.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="badge badge-slate text-[10px]">{a.action}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <Link
            to="/audit-logs"
            className="mt-4 flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/10 transition-all group"
          >
            <span className="text-sm font-medium text-slate-400 group-hover:text-white transition-colors">{t.viewAll}</span>
            <ChevronRight size={14} className="text-slate-600 group-hover:text-white transition-colors" />
          </Link>
        </motion.div>
      </div>

      {/* Bottom stats row */}
      <motion.div variants={fadeIn} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Completion Rate', value: '87%', icon: <CheckCircle size={14} className="text-emerald-400"/>, color: 'text-emerald-400' },
          { label: 'Avg Response', value: '2.4h', icon: <Clock size={14} className="text-blue-400"/>, color: 'text-blue-400' },
          { label: 'Active Projects', value: kpis?.activeProjects ?? 12, icon: <Target size={14} className="text-amber-400"/>, color: 'text-amber-400' },
          { label: 'Revenue Growth', value: '+8.2%', icon: <ArrowUpRight size={14} className="text-teal-400"/>, color: 'text-teal-400' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 flex items-center gap-3 hover-lift">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">{s.icon}</div>
            <div>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// Helper: subtle cartesian grid
function CartesianGridCustom() {
  return (
    <defs>
      <pattern id="cgrid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      </pattern>
    </defs>
  );
}
