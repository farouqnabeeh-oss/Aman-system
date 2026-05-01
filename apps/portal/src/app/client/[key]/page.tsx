'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, ImageIcon, CheckCircle2, 
    FileText, Download, Palette, Type, 
    ExternalLink, Share2, ShieldCheck, 
    MessageCircle, Calendar, BarChart3, Video
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { getClientPortalData } from '@/lib/actions/client';

export default function ClientPortalPage({ params }: { params: { key: string } }) {
    const { language } = useUIStore();
    const isRtl = language === 'ar';
    
    const { data: portalData, isLoading, error } = useQuery({
        queryKey: ['client-portal', params.key],
        queryFn: () => getClientPortalData(params.key)
    });

    if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
    if (error || !portalData?.success) return <div className="h-screen flex items-center justify-center text-rose-500">Invalid or Expired Access Link</div>;

    const data = portalData?.data;
    if (!data) return <div className="h-screen flex items-center justify-center">No Data Available</div>;
    const { client, stats, activeTasks, guideline } = data;

    const shareProgress = () => {
        const text = `Sahab Digital - Project Progress for ${client.name}\n- Designs: ${stats.doneDesigns}/${stats.targetDesigns}\n- Videos: ${stats.doneVideos}/${stats.targetVideos}\n- Status: ${client.smDetails?.contentStatus}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Nav */}
            <nav className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black">S</div>
                    <span className="text-sm font-black uppercase tracking-widest text-slate-900">Sahab Client Portal</span>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={shareProgress}
                        className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 flex items-center gap-2 hover:bg-emerald-100 transition-all"
                    >
                        <Share2 size={14} /> Share Progress
                    </button>
                    <span className="px-4 py-2 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-100 flex items-center gap-2">
                        <ShieldCheck size={14} /> Active Project
                    </span>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-8 space-y-8">
                {/* Hero */}
                <div className="glass-card bg-slate-900 p-12 text-white relative overflow-hidden">
                    <div className="relative z-10 space-y-4">
                        <h1 className="text-3xl font-black uppercase tracking-tight">Welcome back, {client.name}</h1>
                        <p className="text-slate-400 text-sm font-medium max-w-lg">
                            Track your project progress, download assets, and review content status in real-time.
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                        <BarChart3 size={300} className="-mr-20 -mt-20" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { label: 'Completed Designs', value: stats.doneDesigns, icon: ImageIcon, color: 'text-blue-500' },
                                { label: 'Completed Videos', value: stats.doneVideos, icon: Video, color: 'text-purple-500' },
                                { label: 'Content Status', value: client.smDetails?.contentStatus || 'PENDING', icon: FileText, color: 'text-amber-500' }
                            ].map((s, i) => (
                                <div key={i} className="glass-card bg-white p-6 border-slate-100">
                                    <s.icon className={clsx("mb-4", s.color)} size={20} />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                                    <h4 className="text-xl font-black text-slate-900 uppercase">{s.value}</h4>
                                </div>
                            ))}
                        </div>

                        {/* Recent Work */}
                        <div className="glass-card bg-white p-8 border-slate-100 space-y-6">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Tasks & Progress</h3>
                            <div className="space-y-4">
                                {activeTasks.map((t: any) => (
                                    <div key={t.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-200">
                                                {t.title.includes('DESIGN') ? <ImageIcon size={18} /> : <Video size={18} />}
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-700 uppercase">{t.title}</h4>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t.status}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button className="p-2 hover:bg-slate-200 rounded-lg transition-all"><Download size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Assets & Info */}
                    <div className="space-y-8">
                        {/* Brand Assets */}
                        <div className="glass-card bg-white p-8 border-slate-100 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Brand Assets</h3>
                                <Palette size={18} className="text-slate-400" />
                            </div>
                            
                            {guideline ? (
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Color Palette</p>
                                        <div className="flex gap-2">
                                            {JSON.parse(guideline.colors || '[]').map((c: string) => (
                                                <div key={c} className="w-8 h-8 rounded-lg shadow-inner" style={{ backgroundColor: c }} title={c} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Main Drive Link</p>
                                        <a href={guideline.driveLink || '#'} target="_blank" className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
                                            Open Assets <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-[10px] font-bold text-slate-400 italic">No assets uploaded yet.</p>
                            )}
                        </div>

                        {/* Quick Action */}
                        <div className="glass-card bg-indigo-500 p-8 text-white space-y-6 shadow-xl shadow-indigo-500/20">
                            <MessageCircle size={32} />
                            <h4 className="text-lg font-black uppercase tracking-tight">Need help?</h4>
                            <p className="text-indigo-100 text-[10px] font-medium leading-relaxed">
                                Reach out to your project manager directly for any urgent requests or changes.
                            </p>
                            <button className="w-full py-4 bg-white text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-xl">
                                Contact Sahab Team
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
