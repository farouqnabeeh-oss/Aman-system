'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '@/lib/actions/system';
import { PageHeader, StatCard } from '@/components/ui/States';
import { Shield, Activity, Database, Search, Download, Filter, Clock, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/ui.store';
import { clsx } from 'clsx';

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.05 } } };

export default function AuditPage() {
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const [search, setSearch] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit'],
    queryFn: async () => { const r = await getAuditLogs(); return r.data || []; },
  });

  const filtered = logs.filter((log: any) => 
    log.userName.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.entity.toLowerCase().includes(search.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Time', 'Agent', 'Action', 'Entity', 'ID'];
    const rows = filtered.map((l: any) => [
        new Date(l.createdAt).toLocaleString(),
        l.userName,
        l.action,
        l.entity,
        l.entityId
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader 
        title={isRtl ? 'سجل المراجعة' : 'Security Audit Trail'} 
        description={isRtl ? 'تتبع كافة العمليات والتحركات داخل النظام' : 'Comprehensive ledger of all system operations and security events'}
        action={
            <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-lg shadow-white/5"
            >
                <Download size={14} /> {isRtl ? 'تصدير إكسل' : 'Export Data'}
            </button>
        }
      />

      <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label={isRtl ? 'إجمالي العمليات' : 'Total Events'} value={logs.length} icon={<Activity size={18} />} />
          <StatCard label={isRtl ? 'عمليات اليوم' : 'Events Today'} value={logs.filter((l:any) => new Date(l.createdAt).toDateString() === new Date().toDateString()).length} icon={<Clock size={18} />} delta="Live" trend="up" />
          <StatCard label={isRtl ? 'حالة المراقبة' : 'Monitor Status'} value="ACTIVE" icon={<Shield size={18} />} />
      </motion.div>

      <motion.div variants={fadeIn} className="flex items-center gap-4">
        <div className="flex-1 flex items-center gap-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-3.5 focus-within:border-brand/40 transition-all">
          <Search size={18} className="text-slate-600" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder={isRtl ? 'بحث في السجلات...' : 'Search trails (Agent, Action, Entity)...'} 
            className="bg-transparent text-sm text-white outline-none w-full font-medium placeholder:text-slate-700" 
          />
        </div>
      </motion.div>

      <motion.div variants={fadeIn} className="glass-card !p-0 overflow-hidden border-white/5 bg-white/[0.01]">
        <div className="overflow-x-auto">
            <table className="w-full">
            <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-8 py-5 text-start text-[9px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'الوقت' : 'Timestamp'}</th>
                <th className="px-8 py-5 text-start text-[9px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'العضو' : 'Agent'}</th>
                <th className="px-8 py-5 text-start text-[9px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'الإجراء' : 'Operation'}</th>
                <th className="px-8 py-5 text-start text-[9px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'الهدف' : 'Resource'}</th>
                </tr>
            </thead>
            <tbody>
                <AnimatePresence>
                    {isLoading ? (
                        Array(8).fill(0).map((_, i) => (
                            <tr key={i} className="border-b border-white/[0.02]">
                                <td colSpan={4} className="px-8 py-6"><div className="h-4 bg-white/5 rounded-lg animate-pulse" /></td>
                            </tr>
                        ))
                    ) : filtered.length === 0 ? (
                        <tr><td colSpan={4} className="p-32 text-center text-slate-700 uppercase tracking-[0.3em] text-[10px] font-black">No Records Found</td></tr>
                    ) : filtered.map((log: any) => (
                    <motion.tr 
                        key={log.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-all group"
                    >
                        <td className="px-8 py-5 text-[10px] font-mono text-slate-500 group-hover:text-slate-300 transition-colors">
                            {new Date(log.createdAt).toLocaleString(isRtl ? 'ar-EG' : 'en-US')}
                        </td>
                        <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:text-brand transition-all">
                                    {log.userName[0]}
                                </div>
                                <span className="text-xs font-black text-white uppercase tracking-tight group-hover:text-white transition-colors">{log.userName}</span>
                            </div>
                        </td>
                        <td className="px-8 py-5">
                        <span className={clsx(
                            "text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border transition-all",
                            log.action.includes('DELETE') ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                            log.action.includes('CREATE') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            'bg-white/5 text-slate-400 border-white/10'
                        )}>
                            {log.action}
                        </span>
                        </td>
                        <td className="px-8 py-5">
                        <div className="flex items-center gap-3 text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
                            <Terminal size={13} className="text-slate-700 group-hover:text-brand transition-colors" />
                            <span className="font-black uppercase tracking-tight">{log.entity}</span>
                            <span className="text-[10px] text-slate-800 font-mono">#{log.entityId?.slice(0, 8)}</span>
                        </div>
                        </td>
                    </motion.tr>
                    ))}
                </AnimatePresence>
            </tbody>
            </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
