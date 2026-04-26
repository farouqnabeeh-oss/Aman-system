'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '@/lib/actions/system';
import { PageHeader, StatCard } from '@/components/ui/States';
import { Shield, Activity, Database, Search, Download, Filter, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/ui.store';

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.05 } } };

export default function AuditPage() {
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const [search, setSearch] = useState('');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit'],
    queryFn: async () => { const r = await getAuditLogs(); return r.data || []; },
  });

  const filtered = (logs || []).filter((log: any) => 
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
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
                <Download size={14} /> {isRtl ? 'تصدير إكسل' : 'Export Excel (CSV)'}
            </button>
        }
      />

      <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label={isRtl ? 'إجمالي العمليات' : 'Total Events'} value={logs?.length || 0} icon={<Activity size={18} />} />
          <StatCard label={isRtl ? 'عمليات اليوم' : 'Events Today'} value={logs?.filter((l:any) => new Date(l.createdAt).toDateString() === new Date().toDateString()).length || 0} icon={<Clock size={18} />} delta="Live" trend="up" />
          <StatCard label={isRtl ? 'مستوى الأمان' : 'Security Level'} value="HIGH" icon={<Shield size={18} />} />
      </motion.div>

      <motion.div variants={fadeIn} className="flex items-center gap-4">
        <div className="flex-1 flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 focus-within:border-white/20 transition-all">
          <Search size={16} className="text-slate-600" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder={isRtl ? 'بحث في السجلات...' : 'Search trails...'} 
            className="bg-transparent text-sm text-white outline-none w-full font-medium placeholder:text-slate-600" 
          />
        </div>
      </motion.div>

      <motion.div variants={fadeIn} className="glass-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full">
            <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                <th className="px-5 py-5 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'الوقت' : 'Timestamp'}</th>
                <th className="px-5 py-5 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'العضو' : 'Agent'}</th>
                <th className="px-5 py-5 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'الإجراء' : 'Operation'}</th>
                <th className="px-5 py-5 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'الهدف' : 'Resource'}</th>
                </tr>
            </thead>
            <tbody>
                <AnimatePresence>
                    {isLoading ? (
                    <tr><td colSpan={4} className="p-20 text-center text-slate-600 uppercase tracking-[0.3em] text-[10px] font-black">Decrypting Trails...</td></tr>
                    ) : filtered.length === 0 ? (
                        <tr><td colSpan={4} className="p-20 text-center text-slate-600 uppercase tracking-[0.3em] text-[10px] font-black">No Records Found</td></tr>
                    ) : filtered.map((log: any) => (
                    <motion.tr 
                        key={log.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
                    >
                        <td className="px-5 py-4 text-[10px] font-mono text-slate-500 group-hover:text-slate-300 transition-colors">
                            {new Date(log.createdAt).toLocaleString(isRtl ? 'ar-EG' : 'en-US')}
                        </td>
                        <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:text-white transition-colors">
                                    {log.userName[0]}
                                </div>
                                <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{log.userName}</span>
                            </div>
                        </td>
                        <td className="px-5 py-4">
                        <span className="text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest bg-white/5 text-slate-400 border border-white/5 group-hover:border-white/20 transition-all">
                            {log.action}
                        </span>
                        </td>
                        <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
                            <Database size={13} className="text-slate-700" />
                            <span className="font-bold">{log.entity}</span>
                            <span className="text-[10px] text-slate-700 font-mono">#{log.entityId?.slice(0, 8)}</span>
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
