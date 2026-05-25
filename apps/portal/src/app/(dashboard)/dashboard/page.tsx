'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Activity, ArrowUpRight, ArrowDownLeft, Zap,
  TrendingUp, Clock, DollarSign, BarChart2, Search,
  PieChart as PieChartIcon, ShieldCheck, Target,
  LayoutDashboard, CheckCircle2, AlertTriangle, Layers, Bell, CheckSquare
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useRef, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { getDashboardStats } from '@/lib/actions/dashboard';
import { getSelfAttendanceToday, selfAttendance } from '@/lib/actions/hr';
import { getSMClients } from '@/lib/actions/social-media';
import { getTasks } from '@/lib/actions/tasks';
import toast from 'react-hot-toast';
import { StatCard } from '@/components/ui/States';
import Link from 'next/link';
import { AnnouncementModal } from '@/components/dashboard/AnnouncementModal';

const T = {
  ar: {
    title: 'مركز القيادة والتحكم',
    sub: 'الذكاء الاصطناعي وإدارة الموارد في نظام أمان الموحد',
    financialVelocity: 'السيولة والتدفق المالي',
    operationalPulse: 'نبض العمليات',
    teamPresence: 'الفريق والإنتاجية',
    activeProjects: 'المشاريع النشطة',
    tasksByPriority: 'المهام حسب الأولوية',
    systemIntegrity: 'سلامة النظام',
    liveActivity: 'سجل النشاط المباشر',
    attendance: 'الحضور اليومي',
    viewAll: 'عرض الكل',
    income: 'الإيرادات',
    expenses: 'المصروفات',
    netProfit: 'صافي الربح',
  },
  en: {
    title: 'Command & Control Center',
    sub: 'AI-Driven Resource Intelligence - Aman Unified Node',
    financialVelocity: 'Financial Velocity',
    operationalPulse: 'Operational Pulse',
    teamPresence: 'Team & Productivity',
    activeProjects: 'Active Projects',
    tasksByPriority: 'Tasks by Priority',
    systemIntegrity: 'System Integrity',
    liveActivity: 'Live Activity Feed',
    attendance: 'Daily Presence',
    viewAll: 'View All',
    income: 'Income',
    expenses: 'Expenses',
    netProfit: 'Net Profit',
  }
};

const COLORS = ['#1C93B2', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.05 } } };

interface DashboardAnnouncementProps {
  stats: any;
  isRtl: boolean;
}

function DashboardAnnouncement({ stats, isRtl }: DashboardAnnouncementProps) {
  const [announcementVisible, setAnnouncementVisible] = useState(false);

  useEffect(() => {
    if (stats?.latestAnnouncement) {
      const key = `read_announcement_${stats.latestAnnouncement.id}`;
      const firstSeen = localStorage.getItem(key);
      if (firstSeen) {
        const elapsed = (Date.now() - parseInt(firstSeen, 10)) / 1000 / 60;
        if (elapsed < 5) {
          setAnnouncementVisible(true);
          const remainingMs = (5 - elapsed) * 60 * 1000;
          const timer = setTimeout(() => {
            setAnnouncementVisible(false);
          }, remainingMs);
          return () => clearTimeout(timer);
        } else {
          setAnnouncementVisible(false);
        }
      } else {
        localStorage.setItem(key, Date.now().toString());
        setAnnouncementVisible(true);
        const timer = setTimeout(() => {
          setAnnouncementVisible(false);
        }, 5 * 60 * 1000);
        return () => clearTimeout(timer);
      }
    } else {
      setAnnouncementVisible(false);
    }
  }, [stats?.latestAnnouncement]);

  if (!announcementVisible || !stats?.latestAnnouncement) return null;

  const announcement = stats.latestAnnouncement;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden mb-6"
      >
        <div className={clsx(
          "p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 border shadow-lg shadow-brand/5",
          announcement.priority === 'URGENT'
            ? "bg-rose-50 border-rose-100 text-rose-900"
            : "bg-brand/5 border-brand/10 text-brand-900"
        )}>
          <div className="flex items-center gap-5">
            <div className={clsx(
              "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner",
              announcement.priority === 'URGENT' ? "bg-rose-500 text-white" : "bg-brand text-white"
            )}>
              <Bell size={24} className={announcement.priority === 'URGENT' ? "animate-bounce" : ""} />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-tight leading-none mb-2">
                {announcement.title}
              </h4>
              <p className="text-xs font-medium opacity-80 max-w-2xl">
                {announcement.content}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
              {new Date(announcement.createdAt).toLocaleDateString()}
            </span>
            {announcement.priority === 'URGENT' && (
              <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest animate-pulse">
                {isRtl ? 'عاجل جداً' : 'Urgent'}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function CommandCenter() {
  const { language } = useUIStore();
  const user = useAuthStore(s => s.user);
  const router = useRouter();
  const t = T[language as keyof typeof T] || T.en;
  const isRtl = language === 'ar';
  const [logSearch, setLogSearch] = useState('');
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);

  // Removed automatic EMPLOYEE redirect to allow custom dashboards

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await getDashboardStats();
      return res.data;
    },
    refetchInterval: 15000
  });

  const currency = isRtl ? ' د.إ' : '$';
  const fmt = (v: number) => `${v.toLocaleString()}${currency}`;

  if (isLoading) return <div className="h-[80vh] flex items-center justify-center"><Activity className="animate-spin text-brand" size={40} /></div>;
  if (user?.role === 'EMPLOYEE') return <EmployeeDashboard user={user} isRtl={isRtl} language={language} t={t} stats={stats} />;

  const filteredLogs = (stats?.recentLogs || []).filter((log: any) =>
    log.user?.toLowerCase()?.includes(logSearch.toLowerCase()) ||
    log.action?.toLowerCase()?.includes(logSearch.toLowerCase()) ||
    log.entity?.toLowerCase()?.includes(logSearch.toLowerCase())
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8 pb-20">

      {/* Announcement Banner */}
      <DashboardAnnouncement stats={stats} isRtl={isRtl} />

      {/* Header & System Status */}
      <motion.div variants={fadeIn} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand border border-brand/20 shadow-inner">
              <ShieldCheck size={22} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{t.title}</h1>
          </div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t.sub}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAnnouncementOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand text-white font-black text-xs uppercase tracking-widest hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 active:scale-95"
          >
            <Zap size={16} />
            {isRtl ? 'إرسال إعلان' : 'Send Announcement'}
          </button>

          <div className="px-5 py-3 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center gap-4">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.systemIntegrity}</p>
              <p className="text-xs font-black text-emerald-500 uppercase">Secure / 99.9%</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <Clock size={20} className="text-slate-400" />
          </div>
        </div>
      </motion.div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label={t.income} value={fmt(stats?.income || 0)} icon={<ArrowUpRight size={22} />} trend="up" delta="+8.4%" />
        <StatCard label={t.expenses} value={fmt(stats?.expenses || 0)} icon={<ArrowDownLeft size={22} />} trend="down" delta="-2.1%" />
        <StatCard label={t.netProfit} value={fmt(stats?.profit || 0)} icon={<DollarSign size={22} />} trend="up" delta="+15%" />
        <StatCard label={t.attendance} value={`${stats?.attendanceToday || 0} / ${stats?.userCount || 0}`} icon={<Users size={22} />} trend="up" delta="Online" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Financial Area Chart */}
        <motion.div variants={fadeIn} className="lg:col-span-8 glass-card border-slate-100 bg-white p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand/5 border border-brand/10 flex items-center justify-center text-brand">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">{t.financialVelocity}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Growth Index</p>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { n: 'Jan', i: 4000, e: 2400 }, { n: 'Feb', i: 3000, e: 1398 }, { n: 'Mar', i: 2000, e: 9800 },
                { n: 'Apr', i: 2780, e: 3908 }, { n: 'May', i: 1890, e: 4800 }, { n: 'Jun', i: 2390, e: 3800 }
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1C93B2" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1C93B2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="i" stroke="#1C93B2" strokeWidth={4} fillOpacity={1} fill="url(#colorInc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Project Health Donut */}
        <motion.div variants={fadeIn} className="lg:col-span-4 glass-card border-slate-100 bg-white p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
              <PieChartIcon size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">{t.activeProjects}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status Mix</p>
            </div>
          </div>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.projectStatusCounts || [{ status: 'Empty', count: 1 }]}
                  innerRadius={75} outerRadius={100}
                  paddingAngle={8}
                  dataKey="count"
                  stroke="none"
                >
                  {(stats?.projectStatusCounts || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-3xl font-black text-slate-900 leading-none">{stats?.projectCount || 0}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Total</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-8">
            {(stats?.projectStatusCounts || []).slice(0, 4).map((p: any, i: number) => (
              <div key={p.status} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[9px] font-black text-slate-500 uppercase truncate">{p.status}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Task Priorities Bar Chart */}
        <motion.div variants={fadeIn} className="lg:col-span-5 glass-card border-slate-100 bg-white p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl bg-brand/5 border border-brand/10 flex items-center justify-center text-brand">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">{t.tasksByPriority}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Priority Distribution</p>
            </div>
          </div>
          <div className="space-y-6">
            {(stats?.taskPriorityCounts || []).map((p: any, i: number) => {
              const colors = ['#ef4444', '#f59e0b', '#1C93B2', '#10b981'];
              const color = colors[i % colors.length];
              const percentage = (p.count / (stats?.taskCount || 1)) * 100;

              return (
                <div key={p.priority} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{p.priority}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">{p.count}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}40`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Live Logs Widget */}
        <motion.div variants={fadeIn} className="lg:col-span-7 glass-card border-slate-100 bg-white p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">{t.liveActivity}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">System Audit</p>
              </div>
            </div>
            <div className="flex-1 max-w-xs flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 focus-within:border-brand/40 transition-all">
              <Search size={14} className="text-slate-400" />
              <input
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
                placeholder={isRtl ? 'بحث في السجل...' : 'Search logs...'}
                className="bg-transparent text-[10px] text-slate-900 outline-none w-full font-black uppercase tracking-widest placeholder:text-slate-300"
              />
            </div>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
            {filteredLogs.length === 0 ? (
              <div className="py-20 text-center text-slate-300 uppercase tracking-[0.3em] text-[9px] font-black">No matches found</div>
            ) : filteredLogs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-brand/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm group-hover:text-brand transition-colors">
                    {log.user?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                      {log.user} <span className="text-slate-400 font-normal">{log.action}</span> {log.entity}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">{new Date(log.time).toLocaleString()}</p>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-brand transition-colors" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <AnnouncementModal
        isOpen={isAnnouncementOpen}
        onClose={() => setIsAnnouncementOpen(false)}
        language={language}
      />
    </motion.div>
  );
}

function EmployeeDashboard({ user, isRtl, language, t, stats }: any) {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch today's attendance record
  const { data: attendanceRecord } = useQuery({
    queryKey: ['self-attendance'],
    queryFn: async () => {
      const res = await getSelfAttendanceToday();
      return res.data;
    }
  });

  // Fetch client list if in Social Media department
  const isSocialMedia = user?.department === 'SOCIAL_MEDIA';
  const { data: clients = [] } = useQuery({
    queryKey: ['sm-clients'],
    queryFn: async () => {
      if (!isSocialMedia) return [];
      const res = await getSMClients();
      return res.data || [];
    },
    enabled: isSocialMedia
  });

  // Fetch tasks assigned to employee
  const { data: allTasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await getTasks();
      return res.data || [];
    }
  });

  const employeeTasks = allTasks.filter((tk: any) => tk.assigneeId === user?.id && tk.status !== 'DONE');

  const attendanceMutation = useMutation({
    mutationFn: (action: 'IN' | 'OUT') => selfAttendance(action),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['self-attendance'] });
        toast.success(isRtl ? 'تم تسجيل حضورك' : 'Attendance recorded');
      } else {
        toast.error(res.error || 'Operation failed');
      }
    }
  });

  const isWriter = ['CONTENT_WRITER', 'WRITER', 'كاتب محتوى'].includes(user?.position || '');
  const isCreative = ['DESIGNER', 'EDITOR', 'VIDEOGRAPHER', 'مصمم', 'مونتير', 'CREATIVE_DESIGNER'].includes(user?.position || '');

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="space-y-8 pb-20">
      <DashboardAnnouncement stats={stats} isRtl={isRtl} />

      {/* Welcome Banner */}
      <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand to-indigo-600 p-10 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
            {isRtl ? `مرحباً بك، ${user?.firstName} 👋` : `Welcome back, ${user?.firstName} 👋`}
          </h1>
          <p className="text-xs font-semibold opacity-90 max-w-xl leading-relaxed">
            {isRtl
              ? `لوحة التحكم الخاصة بك كـ ${user?.position || 'موظف'} في قسم ${user?.department || 'الشركة'}. تتبع حضورك اليومي ومهامك المجدولة.`
              : `Your personalized hub as a ${user?.position || 'Employee'} in ${user?.department || 'Company'} Dept. Track your presence and active tasks.`}
          </p>
        </div>
      </motion.div>

      {/* Main Grid: HR attendance + Department Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* HR & Daily Attendance Card */}
        <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} className="lg:col-span-6 glass-card bg-white border-slate-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                  {isRtl ? 'الحضور والدوام اليومي' : 'Daily Shift & Attendance'}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">HR Pulse</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-6 space-y-4">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>{isRtl ? 'حالة الحضور اليوم:' : 'Presence Status Today:'}</span>
              <span className={clsx(
                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                attendanceRecord ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
              )}>
                {attendanceRecord ? (isRtl ? 'حاضر (مسجل)' : 'PRESENT') : (isRtl ? 'غير مسجل بعد' : 'ABSENT / NOT CHECKED IN')}
              </span>
            </div>

            {attendanceRecord?.checkIn && (
              <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span>Check-In Time:</span>
                <span className="font-mono text-slate-900">{new Date(attendanceRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
            {attendanceRecord?.checkOut && (
              <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span>Check-Out Time:</span>
                <span className="font-mono text-slate-900">{new Date(attendanceRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => attendanceMutation.mutate('IN')}
              disabled={attendanceMutation.isPending || !!attendanceRecord?.checkIn}
              className="flex-1 py-3.5 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isRtl ? 'تسجيل الدخول (حضور)' : 'Check In'}
            </button>
            <button
              onClick={() => attendanceMutation.mutate('OUT')}
              disabled={attendanceMutation.isPending || !attendanceRecord?.checkIn || !!attendanceRecord?.checkOut}
              className="flex-1 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isRtl ? 'تسجيل الخروج (انصراف)' : 'Check Out'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link href="/hr" className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline">
              {isRtl ? 'انتقل إلى شؤون الموظفين وطلب الإجازات ←' : 'Go to HR & Request Leave ←'}
            </Link>
          </div>
        </motion.div>

        {/* Tailored Section: Social Media or General */}
        <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} className="lg:col-span-6 glass-card bg-white border-slate-100 p-8 shadow-sm">
          {isSocialMedia ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-500">
                  <LayoutDashboard size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    {isRtl ? 'مؤشرات السوشيال ميديا' : 'Social Media Matrix'}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Campaign Analytics</p>
                </div>
              </div>

              {isWriter && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">
                    {isRtl
                      ? 'مساحة كتابة المحتوى الخاصة بك. اكتب المرفقات واحفظ التعديلات للعملاء.'
                      : 'Your content writing hub. Add assets and save copy references.'}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-pink-50/50 border border-pink-100/50 rounded-2xl p-4 text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Clients</p>
                      <p className="text-2xl font-black text-pink-600">{clients.length}</p>
                    </div>
                    <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-4 text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Drafts Ready</p>
                      <p className="text-2xl font-black text-indigo-600">
                        {clients.filter((c: any) => c.smDetails?.content).length}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/content-writer')}
                    className="w-full py-3 rounded-xl bg-pink-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg shadow-pink-500/10"
                  >
                    {isRtl ? 'افتح مساحة الكاتب ←' : 'Open Content Workspace ←'}
                  </button>
                </div>
              )}

              {isCreative && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">
                    {isRtl
                      ? 'مرسم الإبداع الرقمي. استقبل المهام الإبداعية من مصممي ومنتجي الفيديو.'
                      : 'Creative design & production workspace. View briefs and upload assets.'}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50/50 border border-purple-100/50 rounded-2xl p-4 text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Designs</p>
                      <p className="text-2xl font-black text-purple-600">
                        {clients.reduce((acc: number, c: any) => acc + (c.smDetails?.targetDesigns || 0), 0)}
                      </p>
                    </div>
                    <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-4 text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Videos</p>
                      <p className="text-2xl font-black text-blue-600">
                        {clients.reduce((acc: number, c: any) => acc + (c.smDetails?.targetVideos || 0), 0)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/creative-studio')}
                    className="w-full py-3 rounded-xl bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 transition-all shadow-lg shadow-purple-500/10"
                  >
                    {isRtl ? 'افتح مرسم الإبداع ←' : 'Open Creative Studio ←'}
                  </button>
                </div>
              )}

              {!isWriter && !isCreative && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-600">
                    Quickly monitor social media clients and current targets.
                  </p>
                  <button
                    onClick={() => router.push('/social-media')}
                    className="w-full py-3 rounded-xl bg-pink-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-pink-600 transition-all"
                  >
                    {isRtl ? 'مساحة عمل السوشيال ميديا ←' : 'Open Social Media Dept ←'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
                  <CheckSquare size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    {isRtl ? 'مهامي النشطة' : 'My Active Tasks'}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Pending Deliverables</p>
                </div>
              </div>

              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2 no-scrollbar">
                {employeeTasks.slice(0, 3).map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{task.title}</span>
                    <span className={clsx(
                      "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                      task.priority === 'HIGH' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-100 text-slate-500 border-slate-200"
                    )}>
                      {task.priority}
                    </span>
                  </div>
                ))}
                {employeeTasks.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-6 text-center">
                    {isRtl ? 'لا توجد مهام نشطة حالياً' : 'All caught up! No active tasks.'}
                  </p>
                )}
              </div>

              <button
                onClick={() => router.push('/tasks')}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/10"
              >
                {isRtl ? 'عرض كل مهامي ←' : 'View All Tasks ←'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
