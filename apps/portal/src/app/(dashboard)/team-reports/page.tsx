'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Users, Calendar, CheckCircle2, AlertCircle,
  Zap, ChevronDown, ChevronUp, Search, Filter, Sparkles, Share2
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { getAllDailyReports } from '@/lib/actions/daily-reports';
import { analyzePerformance } from '@/lib/actions/ai';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';

const DEPT_COLORS: Record<string, string> = {
  SOCIAL_MEDIA: 'bg-pink-100 text-pink-700 border-pink-200',
  HR: 'bg-rose-100 text-rose-700 border-rose-200',
  FINANCE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  MARKETING: 'bg-amber-100 text-amber-700 border-amber-200',
  OPERATIONS: 'bg-blue-100 text-blue-700 border-blue-200',
  IT: 'bg-violet-100 text-violet-700 border-violet-200',
};

export default function TeamReportsPage() {
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAIAnalyze = async (userId: string) => {
    setIsAnalyzing(true);
    const res = await analyzePerformance(userId);
    setIsAnalyzing(false);
    if (res.success && res.data) {
      setAiResult(res.data);
    }
  };

  const shareOnWhatsApp = (report: any) => {
    const text = `Report: ${report.user.firstName} ${report.user.lastName}\nDone: ${report.done}\nPlan: ${report.plan}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['team-reports', selectedDate],
    queryFn: async () => {
      const res = await getAllDailyReports(selectedDate);
      return res.data || [];
    }
  });

  const filtered = (reports as any[]).filter((r) => {
    const name = `${r.user?.firstName} ${r.user?.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase()) ||
      r.user?.department?.toLowerCase().includes(search.toLowerCase());
  });

  const dateLabel = new Date(selectedDate).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shadow-inner">
            <Users size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              {isRtl ? 'تقارير الفريق اليومية' : 'Team Daily Reports'}
            </h1>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
              <Calendar size={12} /> {dateLabel}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-brand/40 transition-all">
            <Search size={15} className="text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isRtl ? 'ابحث عن موظف...' : 'Search employee...'}
              className="bg-transparent text-sm text-slate-700 font-medium outline-none placeholder:text-slate-400 w-44"
            />
          </div>
          {/* Date picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-black text-slate-700 outline-none focus:border-brand/40 transition-all cursor-pointer"
          />
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="glass-card bg-white border-slate-100 !p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
            <ClipboardList size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{filtered.length}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {isRtl ? 'تقرير مُرسَل' : 'Reports Submitted'}
            </p>
          </div>
        </div>
        <div className="glass-card bg-white border-slate-100 !p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">
              {filtered.filter((r: any) => r.blocks).length}
            </p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {isRtl ? 'لديهم عقبات' : 'With Blockers'}
            </p>
          </div>
        </div>
        <div className="glass-card bg-white border-slate-100 !p-6 flex items-center gap-4 col-span-2 md:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">
              {filtered.filter((r: any) => !r.blocks).length}
            </p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {isRtl ? 'بدون عقبات' : 'No Blockers'}
            </p>
          </div>
        </div>
      </div>

      {/* Reports list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 glass-card bg-slate-50 border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card bg-white border-dashed border-slate-200 py-24 text-center">
          <ClipboardList size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {isRtl ? 'لا توجد تقارير لهذا اليوم بعد' : 'No reports submitted yet for this day'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r: any) => {
            const isExpanded = expandedId === r.id;
            const hasBlocker = !!r.blocks;
            const deptColor = DEPT_COLORS[r.user?.department] || 'bg-slate-100 text-slate-600 border-slate-200';

            return (
              <motion.div
                key={r.id}
                layout
                className={clsx(
                  'glass-card bg-white border-slate-100 shadow-sm overflow-hidden transition-all',
                  hasBlocker && 'border-l-4 border-l-amber-400'
                )}
              >
                {/* Card Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                  className="w-full flex items-center justify-between px-8 py-6 hover:bg-slate-50/70 transition-all"
                >
                  <div className="flex items-center gap-5">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-black text-sm">
                      {r.user?.firstName?.[0]}{r.user?.lastName?.[0]}
                    </div>
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                        {r.user?.firstName} {r.user?.lastName}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={clsx('text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest', deptColor)}>
                          {r.user?.department}
                        </span>
                        {r.user?.position && (
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            {r.user.position}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {hasBlocker && (
                      <span className="flex items-center gap-1.5 text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
                        <AlertCircle size={10} />
                        {isRtl ? 'عقبة' : 'Blocker'}
                      </span>
                    )}
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    {isExpanded
                      ? <ChevronUp size={16} className="text-slate-400" />
                      : <ChevronDown size={16} className="text-slate-400" />
                    }
                  </div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-8 space-y-6 border-t border-slate-100 pt-6">
                        <div className="flex justify-end gap-3 mb-4">
                          <button 
                            onClick={() => handleAIAnalyze(r.userId)}
                            disabled={isAnalyzing}
                            className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
                          >
                            <Sparkles size={12} /> {isRtl ? 'تحليل ذكي' : 'AI Analyze'}
                          </button>
                          <button 
                            onClick={() => shareOnWhatsApp(r)}
                            className="px-4 py-2 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 hover:scale-[1.02] transition-all"
                          >
                            <Share2 size={12} /> {isRtl ? 'مشاركة' : 'Share'}
                          </button>
                        </div>

                        {aiResult && expandedId === r.id && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl text-[11px] font-medium text-indigo-900 whitespace-pre-wrap shadow-inner mb-6"
                          >
                            {aiResult}
                          </motion.div>
                        )}
                        {/* Done */}
                        <div>
                          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <CheckCircle2 size={11} />
                            {isRtl ? 'ما تم إنجازه' : 'Accomplished'}
                          </p>
                          <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap" dir={isRtl ? 'rtl' : 'ltr'}>
                            {r.done}
                          </p>
                        </div>

                        {/* Plan */}
                        <div>
                          <p className="text-[9px] font-black text-brand uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Zap size={11} />
                            {isRtl ? 'خطة الغد' : "Tomorrow's Plan"}
                          </p>
                          <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap" dir={isRtl ? 'rtl' : 'ltr'}>
                            {r.plan}
                          </p>
                        </div>

                        {/* Blockers */}
                        {r.blocks && (
                          <div className="px-5 py-4 rounded-2xl bg-amber-50 border border-amber-100">
                            <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <AlertCircle size={11} />
                              {isRtl ? 'عقبات وملاحظات' : 'Blockers & Notes'}
                            </p>
                            <p className="text-sm text-amber-800 font-medium leading-relaxed whitespace-pre-wrap" dir={isRtl ? 'rtl' : 'ltr'}>
                              {r.blocks}
                            </p>
                          </div>
                        )}

                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {isRtl ? 'أُرسل في:' : 'Submitted:'}{' '}
                          {new Date(r.createdAt).toLocaleTimeString(isRtl ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
