import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Shield } from 'lucide-react';
import api from '../../../lib/axios';
import { useUIStore } from '@/store/ui.store';
import { PageHeader } from '../../../components/ui/States';
import { Table, Pagination } from '../../../components/ui/Table';
import { SkeletonTable } from '../../../components/ui/Skeleton';

const TRANSLATIONS = {
  ar: {
    title: 'سجل المراجعة',
    subtitle: 'سجل تتبع كامل لجميع العمليات والأنشطة داخل النظام',
    user: 'المستخدم',
    action: 'الإجراء',
    entity: 'الكيان',
    time: 'الوقت',
    search: 'بحث بالكيان...',
    allActions: 'كل الإجراءات',
  },
  en: {
    title: 'Intel Logs',
    subtitle: 'Comprehensive audit trail of all system-wide operations',
    user: 'Operator',
    action: 'Action',
    entity: 'Entity',
    time: 'Timestamp',
    search: 'Filter by entity...',
    allActions: 'All Protocols',
  }
};

export function AuditLogPage() {
  const { language } = useUIStore();
  const t = TRANSLATIONS[language];
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState('');
  const [action, setAction] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, entity, action],
    queryFn: () => api.get<any>('/audit-logs', { params: { page, limit: 20, entity: entity || undefined, action: action || undefined } }).then(r => r.data.data),
  });

  const cols = [
    { key: 'user', label: t.user, render: (l: any) => l.user ? (
       <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-bold text-white/40">{l.user.firstName[0]}</div>
          <span className="text-sm font-bold text-white">{l.user.firstName} {l.user.lastName}</span>
       </div>
    ) : <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">System</span> },
    { key: 'action', label: t.action, render: (l: any) => (
       <span className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest border border-white/5 px-2 py-1 rounded-lg">
          {l.action}
       </span>
    )},
    { key: 'entity', label: t.entity, render: (l: any) => <span className="text-sm font-medium text-slate-400">{l.entity}</span> },
    { key: 'ip', label: 'IP', render: (l: any) => <span className="text-[10px] font-mono text-slate-600">{l.ipAddress || '—'}</span> },
    { key: 'time', label: t.time, render: (l: any) => <span className="text-[11px] font-bold text-slate-500">{new Date(l.createdAt).toLocaleString(language)}</span> },
  ];

  return (
    <div className="space-y-12">
      <PageHeader title={t.title} description={t.subtitle} />

      <div className="flex flex-wrap items-center gap-4">
         <div className="flex-1 min-w-[240px] flex items-center gap-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl px-5 py-3 focus-within:border-white/20 transition-all">
            <Search size={16} className="text-slate-600" />
            <input value={entity} onChange={(e: any) => {setEntity(e.target.value); setPage(1);}} placeholder={t.search} className="bg-transparent text-sm text-white outline-none w-full font-medium" />
         </div>
         
         <select value={action} onChange={(e: any) => {setAction(e.target.value); setPage(1);}} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-400 outline-none">
            <option value="">{t.allActions}</option>
            {['CREATE','UPDATE','DELETE','LOGIN','UPLOAD'].map(a => <option key={a} value={a}>{a}</option>)}
         </select>

         <div className="flex items-center gap-2 px-6 py-2 bg-indigo-600/5 border border-indigo-500/10 rounded-2xl">
            <Shield size={14} className="text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Encrypted Stream</span>
         </div>
      </div>

      <div className="clean-card !p-0 overflow-hidden">
         {isLoading ? <SkeletonTable rows={10} cols={5} /> : (
            <Table columns={cols} data={data?.items || []} keyFn={(l: any) => l.id} />
         )}
         {data?.meta && <Pagination page={page} totalPages={data.meta.totalPages} total={data.meta.total} limit={data.meta.limit} onPage={setPage} />}
      </div>
    </div>
  );
}
