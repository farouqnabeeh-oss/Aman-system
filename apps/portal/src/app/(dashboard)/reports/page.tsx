'use client';

import { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, Star, CheckCircle,
    Calendar, Users, ArrowUpRight, Download, PieChart as PieChartIcon, Activity
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '@/components/ui/States';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { getPerformanceReport } from '@/lib/actions/reports';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { useQuery } from '@tanstack/react-query';

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.05 } } };

export default function ReportsPage() {
    const { language } = useUIStore();
    const isRtl = language === 'ar';
    const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

    const { data, isLoading } = useQuery({
        queryKey: ['performance-report', period],
        queryFn: async () => {
            const res = await getPerformanceReport(period);
            return res.data;
        }
    });

    const COLORS = ['#1C93B2', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
            <PageHeader
                title={isRtl ? 'مؤشرات الأداء الرئيسية (KPIs)' : 'Command Insights'}
                description={isRtl ? 'تحليل شامل لإنتاجية الموظفين وكفاءة المشاريع' : 'Comprehensive analysis of personnel velocity and mission efficiency'}
                action={
                    <div className="flex bg-slate-50 rounded-2xl p-1 border border-slate-100">
                        <button
                            onClick={() => setPeriod('weekly')}
                            className={clsx(
                                'px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                                period === 'weekly' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-slate-500 hover:text-brand hover:bg-white'
                            )}
                        >
                            {isRtl ? 'أسبوعي' : 'Weekly'}
                        </button>
                        <button
                            onClick={() => setPeriod('monthly')}
                            className={clsx(
                                'px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                                period === 'monthly' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-slate-500 hover:text-brand hover:bg-white'
                            )}
                        >
                            {isRtl ? 'شهري' : 'Monthly'}
                        </button>
                    </div>
                }
            />

            {/* Overview Stats */}
            <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label={isRtl ? 'متوسط تقييم الفريق' : 'Team Rating'} value={data?.avgRating?.toFixed(1) || '0.0'} icon={<Star size={18} />} delta={`${data?.totalRatings || 0} feeds`} trend="up" />
                <StatCard label={isRtl ? 'إنجاز المهام' : 'Tasks Done'} value={data?.tasks?.find((t: any) => t.status === 'DONE')?._count?._all || 0} icon={<CheckCircle size={18} />} />
                <StatCard label={isRtl ? 'كفاءة المشاريع' : 'Mission Velocity'} value="98.2%" icon={<TrendingUp size={18} />} delta="Optimal" trend="up" />
                <StatCard label={isRtl ? 'الالتزام بالمواعيد' : 'Deadline Sync'} value="92%" icon={<Calendar size={18} />} delta="-2%" trend="down" />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Task Distribution Chart */}
                <motion.div variants={fadeIn} className="lg:col-span-8 glass-card !p-10 border-slate-100 bg-white">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">
                                {isRtl ? 'توزيع حالة المهام' : 'Operational Status Flow'}
                            </h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time status distribution across all projects</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                            <BarChart3 size={20} />
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.tasks?.map((t: any) => ({ name: t.status, value: t._count._all })) || []}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9, fontWeight: '900' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9, fontWeight: '900' }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ fontSize: '10px', fontWeight: '900', color: '#1C93B2' }}
                                    labelStyle={{ fontSize: '10px', fontWeight: '900', color: '#0f172a', marginBottom: '4px' }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                                    {data?.tasks?.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Top Performers Ranking */}
                <motion.div variants={fadeIn} className="lg:col-span-4 glass-card !p-10 border-slate-100 bg-white">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">
                                {isRtl ? 'نجوم الفريق' : 'High Achievers'}
                            </h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Top contributors this period</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="space-y-6">
                        {data?.topEmployees?.map((u: any, idx: number) => (
                            <div key={u.id} className="flex items-center justify-between group p-4 rounded-2xl bg-slate-50 hover:bg-white transition-all border border-slate-100 hover:border-brand/30 hover:shadow-xl hover:shadow-brand/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-[11px] font-black text-brand border border-brand/20 transition-all group-hover:scale-110">
                                        {u.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{u.name}</p>
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{u.department}</p>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <p className="text-xs font-black text-brand">{u.tasksDone} {isRtl ? 'مهمة' : 'Tasks'}</p>
                                    <div className="flex gap-0.5 mt-1 justify-end">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={9} fill={u.avgRating >= s ? '#1C93B2' : 'none'} className={u.avgRating >= s ? 'text-brand' : 'text-slate-200'} />)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-10 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:bg-brand hover:text-white hover:border-brand transition-all flex items-center justify-center gap-3">
                        <Download size={14} /> {isRtl ? 'تحميل البيانات' : 'Export Insights'}
                    </button>
                </motion.div>
            </div>

            {/* Secondary KPIs Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={fadeIn} className="glass-card !p-10 border-slate-100 bg-white">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-10 flex items-center gap-3">
                        <Users size={18} className="text-brand" /> {isRtl ? 'توزيع عبء العمل' : 'Departmental Load'}
                    </h3>
                    <div className="space-y-6">
                        {data?.deptLoad?.map((d: any, i: number) => (
                            <div key={d.department}>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                                    <span className="text-slate-400">{d.department}</span>
                                    <span className="text-slate-900">{d.count} {isRtl ? 'مهمة نشطة' : 'Active'}</span>
                                </div>
                                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((d.count / 20) * 100, 100)}%` }}
                                        className="h-full bg-brand"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div variants={fadeIn} className="glass-card !p-10 border-slate-100 bg-white">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-10 flex items-center gap-3">
                        <Activity size={18} className="text-brand" /> {isRtl ? 'تحليل الالتزام بالوقت' : 'Timeline Fidelity'}
                    </h3>
                    <div className="flex items-center gap-12">
                        <div className="w-40 h-40 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={[{ v: data?.fidelity || 0 }, { v: 100 - (data?.fidelity || 0) }]} dataKey="v" innerRadius={50} outerRadius={65} paddingAngle={8} stroke="none">
                                        <Cell fill="#0f172a" fillOpacity={0.8} />
                                        <Cell fill="#e2e8f0" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <p className="text-xl font-black text-slate-900">{Math.round(data?.fidelity || 0)}%</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Target</p>
                            </div>
                        </div>
                        <div className="flex-1 space-y-4">
                             <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{isRtl ? 'في الموعد' : 'On Schedule'}</p>
                                    <p className="text-xs font-black text-slate-900">{Math.round(data?.fidelity || 0)}% Accurate</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-100" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{isRtl ? 'متأخر' : 'Deviation'}</p>
                                    <p className="text-xs font-black text-slate-900">{100 - Math.round(data?.fidelity || 0)}% Lag</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
            
            {/* Performance Detail Table */}
            <motion.div variants={fadeIn} className="glass-card !p-0 overflow-hidden border-slate-100 bg-white shadow-sm">
                <div className="p-8 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{isRtl ? 'تفاصيل أداء الموظفين' : 'Personnel Performance Breakdown'}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'الموظف' : 'Employee'}</th>
                                <th className="px-8 py-5 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'القسم' : 'Dept'}</th>
                                <th className="px-8 py-5 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'المهام المنجزة' : 'Tasks Done'}</th>
                                <th className="px-8 py-5 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'متوسط التقييم' : 'Avg Rating'}</th>
                                <th className="px-8 py-5 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'الالتزام' : 'Fidelity'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data?.topEmployees?.map((u: any) => (
                                <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-brand/5 flex items-center justify-center text-brand font-black text-[10px]">
                                                {u.name[0]}
                                            </div>
                                            <span className="text-xs font-bold text-slate-900">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{u.department}</td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs font-black text-slate-900">{u.tasksDone}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex gap-0.5 text-amber-500">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} fill={u.avgRating >= s ? 'currentColor' : 'none'} className={u.avgRating >= s ? '' : 'text-slate-200'} />)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1 bg-slate-100 rounded-full w-20 overflow-hidden">
                                                <div className="h-full bg-brand" style={{ width: `${Math.random() * 40 + 60}%` }} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-900">High</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}
