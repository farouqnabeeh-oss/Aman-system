'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuditLogs, clearAuditLogs } from '@/lib/actions/system';
import { PageHeader, StatCard } from '@/components/ui/States';
import { Shield, Activity, Search, Download, Clock, Terminal, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/ui.store';
import { clsx } from 'clsx';

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.05 } } };

const actionColors: Record<string, string> = {
  DELETE: 'bg-rose-50 text-rose-600 border-rose-100',
  CREATE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  UPDATE: 'bg-blue-50 text-blue-600 border-blue-100',
  LOGIN: 'bg-brand/5 text-brand border-brand/20',
};

export default function AuditPage() {
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [showClearMenu, setShowClearMenu] = useState(false);

  const queryClient = useQueryClient();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit'],
    queryFn: async () => { const r = await getAuditLogs(); return r.data || []; },
    refetchInterval: 30000, // auto-refresh every 30s
  });

  const clearMutation = useMutation({
    mutationFn: async (period: 'week' | 'month' | 'all') => {
      const res = await clearAuditLogs(period);
      if (!res.success) throw new Error(res.message);
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['audit'] });
      alert(isRtl ? `تم حذف ${data.count} من السجلات بنجاح` : `Successfully cleared ${data.count} logs`);
    },
    onError: (err: any) => {
      alert(isRtl ? `فشل حذف السجلات: ${err.message}` : `Failed to clear logs: ${err.message}`);
    }
  });


  const filtered = logs.filter((log: any) =>
    (log.userName?.toLowerCase()?.includes(search.toLowerCase()) ||
      log.action?.toLowerCase()?.includes(search.toLowerCase()) ||
      log.entity?.toLowerCase()?.includes(search.toLowerCase())) &&
    (actionFilter ? log.action === actionFilter : true)
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

  const todayCount = logs.filter((l: any) => new Date(l.createdAt).toDateString() === new Date().toDateString()).length;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader
        title={isRtl ? 'سجل المراجعة' : 'Security Audit Trail'}
        description={isRtl ? 'تتبع كافة العمليات والتحركات داخل النظام' : 'Comprehensive ledger of all system operations and security events'}
        action={
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowClearMenu(!showClearMenu)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
              >
                <Trash2 size={14} /> {isRtl ? 'مسح السجلات' : 'Clear Logs'}
              </button>
              {showClearMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      if (confirm(isRtl ? 'هل أنت متأكد من حذف سجلات الأسبوع الماضي؟' : 'Are you sure you want to delete logs older than a week?')) {
                        clearMutation.mutate('week');
                      }
                      setShowClearMenu(false);
                    }}
                    className="w-full text-left rtl:text-right px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100"
                  >
                    {isRtl ? 'الأقدم من أسبوع' : 'Older than 1 week'}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(isRtl ? 'هل أنت متأكد من حذف سجلات الشهر الماضي؟' : 'Are you sure you want to delete logs older than a month?')) {
                        clearMutation.mutate('month');
                      }
                      setShowClearMenu(false);
                    }}
                    className="w-full text-left rtl:text-right px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100"
                  >
                    {isRtl ? 'الأقدم من شهر' : 'Older than 1 month'}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(isRtl ? 'هل أنت متأكد من حذف جميع السجلات؟' : 'Are you sure you want to delete all logs?')) {
                        clearMutation.mutate('all');
                      }
                      setShowClearMenu(false);
                    }}
                    className="w-full text-left rtl:text-right px-4 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    {isRtl ? 'حذف الكل' : 'Clear All Logs'}
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand/90 transition-all shadow-lg shadow-brand/20"
            >
              <Download size={14} /> {isRtl ? 'تصدير إكسل' : 'Export CSV'}
            </button>
          </div>
        }
      />

      <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label={isRtl ? 'إجمالي العمليات' : 'Total Events'} value={logs.length} icon={<Activity size={18} />} />
        <StatCard label={isRtl ? 'عمليات اليوم' : 'Events Today'} value={todayCount} icon={<Clock size={18} />} delta="Live" trend="up" />
        <StatCard label={isRtl ? 'حالة المراقبة' : 'Monitor Status'} value="ACTIVE" icon={<Shield size={18} />} />
      </motion.div>

      <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[280px] flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus-within:border-brand/30 transition-all">
          <Search size={18} className="text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isRtl ? 'بحث في السجلات...' : 'Search by agent, action, entity...'}
            className="bg-transparent text-sm text-slate-900 outline-none w-full font-medium placeholder:text-slate-400"
          />
        </div>
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-[10px] font-black text-slate-500 outline-none uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-all"
        >
          <option value="">{isRtl ? 'كل الإجراءات' : 'All Actions'}</option>
          {['CREATE', 'UPDATE', 'DELETE', 'LOGIN'].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </motion.div>

      <motion.div variants={fadeIn} className="glass-card !p-0 overflow-hidden border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-8 py-5 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'الوقت' : 'Timestamp'}</th>
                <th className="px-8 py-5 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'العضو' : 'Agent'}</th>
                <th className="px-8 py-5 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'الإجراء' : 'Operation'}</th>
                <th className="px-8 py-5 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'الهدف' : 'Resource'}</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {isLoading ? (
                  Array(8).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td colSpan={4} className="px-8 py-6">
                        <div className="h-4 bg-slate-100 rounded-lg animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-24 text-center text-slate-400 uppercase tracking-[0.3em] text-[10px] font-black">
                      {isRtl ? 'لا توجد سجلات مطابقة' : 'No records found'}
                    </td>
                  </tr>
                ) : filtered.map((log: any) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-all group"
                  >
                    <td className="px-8 py-5 text-[10px] font-mono text-slate-500">
                      {new Date(log.createdAt).toLocaleString(isRtl ? 'ar-SA' : 'en-US')}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-brand/5 border border-brand/10 flex items-center justify-center text-[10px] font-black text-brand">
                          {log.userName?.[0] || 'S'}
                        </div>
                        <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{log.userName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={clsx(
                        "text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border",
                        actionColors[log.action] || 'bg-slate-50 text-slate-400 border-slate-100'
                      )}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <Terminal size={13} className="text-slate-300 group-hover:text-brand transition-colors" />
                        <span className="font-black uppercase tracking-tight text-slate-700">{log.entity}</span>
                        <span className="text-[10px] text-slate-300 font-mono">#{log.entityId?.slice(0, 8)}</span>
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
