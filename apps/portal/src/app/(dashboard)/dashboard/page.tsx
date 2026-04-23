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

function KpiCard({ label, value, delta, icon, color, bg, trend, isRtl }: any) {
  return (
    <motion.div variants={fadeIn} className="glass-card p-6 group hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
          <span className={color}>{icon}</span>
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${
          trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' : trend === 'down' ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 bg-slate-700/30'
        }`}>
          {trend === 'up' ? <TrendingUp size={11}/> : trend === 'down' ? <TrendingDown size={11}/> : null}
          {delta}
        </div>
      </div>
      <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-widest font-black">{label}</p>
      <p className="text-2xl font-black text-white tracking-tight">{value}</p>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { language } = useUIStore();
  const t = T[language as keyof typeof T] || T.en;
  const isRtl = language === 'ar';

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
          <h1 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">{t.title}</h1>
          <p className="text-xs font-medium text-slate-500">{t.sub}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t.health}: 99.2%</span>
        </div>
      </motion.div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label={t.revenue} value="$128.4k" delta="+12.4%" trend="up" icon={<DollarSign size={18}/>} color="text-emerald-400" bg="bg-emerald-500/10" isRtl={isRtl} />
        <KpiCard label={t.users} value="1,240" delta="+42" trend="up" icon={<Users size={18}/>} color="text-blue-400" bg="bg-blue-500/10" isRtl={isRtl} />
        <KpiCard label={t.tasks} value="18" delta="Active" icon={<CheckCircle size={18}/>} color="text-amber-400" bg="bg-amber-500/10" isRtl={isRtl} />
        <KpiCard label={t.invoices} value="3" delta="Alert" trend="down" icon={<AlertCircle size={18}/>} color="text-rose-400" bg="bg-rose-500/10" isRtl={isRtl} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Revenue Flow */}
        <motion.div variants={fadeIn} className="xl:col-span-8 glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <BarChart2 size={16} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">{t.revChart}</h3>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Digital Node Pulse</p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SAMPLE_REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live Activity Feed */}
        <motion.div variants={fadeIn} className="xl:col-span-4 glass-card p-6 flex flex-col">
           <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-teal-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-tight">{t.activity}</h3>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          </div>

          <div className="flex-1 space-y-4">
             {[
               { id: 1, user: 'Ahmed S.', action: 'authorized', entity: 'new procurement', time: '2m ago' },
               { id: 2, user: 'Sarah K.', action: 'updated', entity: 'financial audit', time: '14m ago' },
               { id: 3, user: 'System', action: 'completed', entity: 'node synchronization', time: '1h ago' },
               { id: 4, user: 'Ibrahim Blue', action: 'signed', entity: 'contract #204', time: '3h ago' },
             ].map((a, idx) => (
               <div key={a.id} className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.03]">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black text-slate-500">
                    {a.user[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-300 leading-tight">
                      <span className="font-bold text-white">{a.user}</span> {a.action} {a.entity}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                       <Clock size={8} className="text-slate-600" />
                       <span className="text-[9px] font-bold text-slate-600 uppercase">{a.time}</span>
                    </div>
                  </div>
               </div>
             ))}
          </div>

          <Link
            href="/audit-logs"
            className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
          >
            <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest">{t.viewAll}</span>
            <ChevronRight size={14} className="text-slate-600 group-hover:text-white" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
