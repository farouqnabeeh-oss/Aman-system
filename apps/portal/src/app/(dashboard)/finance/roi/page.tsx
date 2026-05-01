'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    DollarSign, TrendingUp, BarChart3, 
    Briefcase, Target, ArrowUpRight,
    ArrowDownRight, PieChart, Activity
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { getFinanceROI } from '@/lib/actions/finance';

export default function FinanceROIPage() {
    const { language } = useUIStore();
    const isRtl = language === 'ar';
    
    const { data: roiData, isLoading } = useQuery({
        queryKey: ['finance-roi'],
        queryFn: () => getFinanceROI()
    });

    if (isLoading) return <div>Loading...</div>;

    const stats = roiData?.data || [];

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                    <TrendingUp size={26} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Finance ROI Analytics</h1>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Analyzing client profitability and package performance</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Avg ROI', value: '72%', icon: Activity, color: 'text-emerald-500' },
                    { label: 'High Perf Clients', value: '12', icon: Target, color: 'text-blue-500' },
                    { label: 'Pending Collections', value: '$4.2k', icon: DollarSign, color: 'text-amber-500' },
                    { label: 'Efficiency Score', value: '8.4/10', icon: BarChart3, color: 'text-purple-500' }
                ].map((s, i) => (
                    <div key={i} className="glass-card bg-white p-6 border-slate-100 shadow-sm">
                        <s.icon className={clsx("mb-4", s.color)} size={20} />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <h4 className="text-xl font-black text-slate-900">{s.value}</h4>
                    </div>
                ))}
            </div>

            <div className="glass-card bg-white border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Client Profitability Matrix</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-start">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-start">Client</th>
                                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-start">Package Price</th>
                                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-start">Tasks Done</th>
                                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-start">ROI Index</th>
                                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-start">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.map((row: any) => (
                                <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                                    <td className="px-8 py-5 text-xs font-bold text-slate-900 uppercase">{row.name}</td>
                                    <td className="px-8 py-5 text-xs font-black text-slate-700">${row.price}</td>
                                    <td className="px-8 py-5 text-xs font-bold text-slate-500">{row.tasksCount}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${row.roi}%` }} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-700">{row.roi}%</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={clsx(
                                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                            row.roi > 70 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                                        )}>
                                            {row.roi > 70 ? 'High Profit' : 'Balanced'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
