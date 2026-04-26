'use client';

import { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, Star, CheckCircle,
    Calendar, Users, ArrowUpRight, Download
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '@/components/ui/States';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { getPerformanceReport } from '@/lib/actions/reports';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
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

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
            <PageHeader
                title={isRtl ? 'تقارير الأداء' : 'Performance Insights'}
                description={isRtl ? 'تحليل ذكاء الأعمال والإنتاجية' : 'Business intelligence and productivity analysis'}
                action={
                    <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                        <button
                            onClick={() => setPeriod('weekly')}
                            className={clsx(
                                'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                                period === 'weekly' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'
                            )}
                        >
                            {isRtl ? 'أسبوعي' : 'Weekly'}
                        </button>
                        <button
                            onClick={() => setPeriod('monthly')}
                            className={clsx(
                                'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                                period === 'monthly' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'
                            )}
                        >
                            {isRtl ? 'شهري' : 'Monthly'}
                        </button>
                    </div>
                }
            />

            {/* Overview Stats */}
            <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label={isRtl ? 'متوسط التقييم' : 'Avg Rating'} value={data?.avgRating?.toFixed(1) || '0.0'} icon={<Star size={18} />} delta={`${data?.totalRatings || 0} reviews`} trend="up" />
                <StatCard label={isRtl ? 'المهام المنجزة' : 'Tasks Completed'} value={data?.tasks?.find((t: any) => t.status === 'DONE')?._count?._all || 0} icon={<CheckCircle size={18} />} />
                <StatCard label={isRtl ? 'نسبة الالتزام' : 'Compliance Rate'} value="94%" icon={<TrendingUp size={18} />} delta="High" trend="up" />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Chart */}
                <motion.div variants={fadeIn} className="lg:col-span-8 glass-card p-8">
                    <h3 className="text-sm font-black text-white uppercase tracking-tight mb-8">
                        {isRtl ? 'حالة المهام خلال الفترة' : 'Task Distribution Status'}
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.tasks?.map((t: any) => ({ name: t.status, value: t._count._all })) || []}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {data?.tasks?.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Top Performers */}
                <motion.div variants={fadeIn} className="lg:col-span-4 glass-card p-8">
                    <h3 className="text-sm font-black text-white uppercase tracking-tight mb-8">
                        {isRtl ? 'الأكثر إنجازاً' : 'Top Performers'}
                    </h3>
                    <div className="space-y-5">
                        {data?.topEmployees?.map((u: any, idx: number) => (
                            <div key={u.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black text-white border border-white/5 group-hover:border-white/20 transition-all">
                                        {u.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white">{u.name}</p>
                                        <p className="text-[9px] text-slate-600 font-black uppercase">{u.department}</p>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <p className="text-xs font-black text-blue-400">{u.tasksDone}</p>
                                    <div className="flex gap-0.5 mt-0.5">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={7} fill={u.avgRating >= s ? '#3b82f6' : 'none'} className={u.avgRating >= s ? 'text-blue-500' : 'text-slate-700'} />)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-10 py-3 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2">
                        <Download size={14} /> {isRtl ? 'تحميل التقرير الكامل' : 'Download PDF Report'}
                    </button>
                </motion.div>
            </div>
        </motion.div>
    );
}
