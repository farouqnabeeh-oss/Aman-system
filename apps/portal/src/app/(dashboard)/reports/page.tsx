'use client';

import { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, Star, CheckCircle,
    Calendar, Users, ArrowUpRight, Download, PieChart as PieChartIcon
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '@/components/ui/States';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { getPerformanceReport } from '@/lib/actions/reports';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.05 } } };

export default function ReportsPage() {
    const { language } = useUIStore();
    const isRtl = language === 'ar';
    const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getPerformanceReport(period).then(res => {
            if (res.success) setData(res.data);
            setLoading(false);
        });
    }, [period]);

    const COLORS = ['#1C93B2', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
            <PageHeader
                title={isRtl ? 'مؤشرات الأداء الرئيسية (KPIs)' : 'Key Performance Indicators'}
                description={isRtl ? 'تحليل شامل لإنتاجية الموظفين وكفاءة المشاريع' : 'Comprehensive analysis of employee productivity and project efficiency'}
                action={
                    <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100">
                        <button
                            onClick={() => setPeriod('weekly')}
                            className={clsx(
                                'px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                                period === 'weekly' ? 'bg-white text-brand shadow-sm border border-slate-100' : 'text-slate-400 hover:text-brand'
                            )}
                        >
                            {isRtl ? 'أسبوعي' : 'Weekly'}
                        </button>
                        <button
                            onClick={() => setPeriod('monthly')}
                            className={clsx(
                                'px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                                period === 'monthly' ? 'bg-white text-brand shadow-sm border border-slate-100' : 'text-slate-400 hover:text-brand'
                            )}
                        >
                            {isRtl ? 'شهري' : 'Monthly'}
                        </button>
                    </div>
                }
            />

            {/* Overview Stats */}
            <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label={isRtl ? 'متوسط تقييم الفريق' : 'Team Avg Rating'} value={data?.avgRating?.toFixed(1) || '0.0'} icon={<Star size={18} />} delta={`${data?.totalRatings || 0} reviews`} trend="up" />
                <StatCard label={isRtl ? 'إنجاز المهام' : 'Tasks Completed'} value={data?.tasks?.find((t: any) => t.status === 'DONE')?._count?._all || 0} icon={<CheckCircle size={18} />} />
                <StatCard label={isRtl ? 'كفاءة المشاريع' : 'Project Efficiency'} value="98.2%" icon={<TrendingUp size={18} />} delta="High" trend="up" />
                <StatCard label={isRtl ? 'الالتزام بالمواعيد' : 'Deadline Sync'} value="92%" icon={<Calendar size={18} />} delta="-2%" trend="down" />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Task Distribution Chart */}
                <motion.div variants={fadeIn} className="lg:col-span-8 glass-card p-8 border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                           {isRtl ? 'توزيع حالة المهام' : 'Operational Task Flow'}
                       </h3>
                       <BarChart3 className="text-brand opacity-20" size={24} />
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.tasks?.map((t: any) => ({ name: t.status, value: t._count._all })) || []}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} />
                                <Tooltip
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ fontSize: '11px', fontWeight: '900', color: '#1C93B2', textTransform: 'uppercase' }}
                                />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                                    {data?.tasks?.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Top Performers Ranking */}
                <motion.div variants={fadeIn} className="lg:col-span-4 glass-card p-8 border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                           {isRtl ? 'نجوم الشهر' : 'Top Performers'}
                       </h3>
                       <TrendingUp className="text-brand opacity-20" size={24} />
                    </div>
                    <div className="space-y-6">
                        {data?.topEmployees?.map((u: any, idx: number) => (
                            <div key={u.id} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-brand/5 flex items-center justify-center text-[11px] font-black text-brand border border-brand/10 transition-all">
                                        {u.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{u.name}</p>
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{u.department}</p>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <p className="text-xs font-black text-brand">{u.tasksDone} {isRtl ? 'مهمة' : 'Tasks'}</p>
                                    <div className="flex gap-0.5 mt-1">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={8} fill={u.avgRating >= s ? '#1C93B2' : 'none'} className={u.avgRating >= s ? 'text-brand' : 'text-slate-200'} />)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-10 py-4 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-brand hover:text-white hover:border-brand transition-all flex items-center justify-center gap-3">
                        <Download size={14} /> {isRtl ? 'تحميل تقرير ذكاء الأعمال' : 'Export BI Report'}
                    </button>
                </motion.div>
            </div>

            {/* Secondary KPIs Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={fadeIn} className="glass-card p-8 border-slate-100">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-2">
                        <Users size={16} className="text-brand" /> {isRtl ? 'توزيع عبء العمل' : 'Workload Distribution'}
                    </h3>
                    <div className="space-y-4">
                        {['Content', 'Design', 'Development', 'Sales'].map((dept, i) => (
                            <div key={dept}>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                    <span className="text-slate-400">{dept}</span>
                                    <span className="text-slate-900">{(85 - i*10)}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                    <div className="h-full bg-brand" style={{ width: `${85 - i*10}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div variants={fadeIn} className="glass-card p-8 border-slate-100">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-2">
                        <PieChartIcon size={16} className="text-brand" /> {isRtl ? 'تحليل الالتزام بالوقت' : 'Timeline Compliance'}
                    </h3>
                    <div className="flex items-center gap-8">
                        <div className="w-32 h-32">
                           <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={[{v: 80}, {v: 20}]} dataKey="v" innerRadius={35} outerRadius={45} paddingAngle={5}>
                                        <Cell fill="#1C93B2" />
                                        <Cell fill="#f1f5f9" />
                                    </Pie>
                                </PieChart>
                           </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-brand" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'في الموعد' : 'On Time'}</p>
                                <p className="text-xs font-black text-slate-900 ml-auto">80%</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-slate-200" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'متأخر' : 'Delayed'}</p>
                                <p className="text-xs font-black text-slate-900 ml-auto">20%</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
