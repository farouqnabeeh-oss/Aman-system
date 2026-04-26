import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Shield } from 'lucide-react';
import api from '../../../lib/axios';
import { useUIStore } from '@/store/ui.store';
import { PageHeader } from '../../../components/ui/States';
import { Table, Pagination } from '../../../components/ui/Table';
import { SkeletonTable } from '../../../components/ui/Skeleton';
import { clsx } from 'clsx';

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
  const limit = 15;

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, entity, action],
    queryFn: () => api.get<any>('/audit-logs', { 
      params: { 
        page, 
        limit, 
        entity: entity || undefined, 
        action: action || undefined 
      } 
    }).then(r => r.data.data),
    staleTime: 0,
  });

  const cols = [
    { key: 'user', label: t.user, render: (l: any) => l.user ? (
       <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-[10px] font-bold text-brand">{l.user.firstName[0]}</div>
          <span className="text-sm font-bold text-[var(--text-1)]">{l.user.firstName} {l.user.lastName}</span>
       </div>
    ) : <span className="text-[10px] font-black text-brand uppercase tracking-widest bg-brand/5 px-2 py-1 rounded-lg">System</span> },
    { key: 'action', label: t.action, render: (l: any) => (
       <span className={clsx(
         "text-[10px] font-black font-mono uppercase tracking-widest px-2.5 py-1 rounded-lg border",
         l.action === 'DELETE' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
         l.action === 'CREATE' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
         l.action === 'LOGIN' ? "bg-sky-500/10 text-sky-500 border-sky-500/20" :
         "bg-slate-500/10 text-slate-500 border-slate-500/20"
       )}>
          {l.action}
       </span>
    )},
    { key: 'entity', label: t.entity, render: (l: any) => <span className="text-sm font-medium text-[var(--text-2)]">{l.entity}</span> },
    { key: 'ip', label: 'IP', render: (l: any) => <span className="text-[10px] font-mono text-[var(--text-3)]">{l.ipAddress || '—'}</span> },
    { key: 'time', label: t.time, render: (l: any) => <span className="text-[11px] font-bold text-[var(--text-2)]">{new Date(l.createdAt).toLocaleString(language)}</span> },
  ];

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      <PageHeader title={t.title} description={t.subtitle} />

      <div className="flex flex-wrap items-center gap-4">
         <div className="flex-1 min-w-[280px] flex items-center gap-4 bg-[var(--bg-glass)] border border-[var(--border)] rounded-2xl px-5 py-3 focus-within:border-brand/40 transition-all">
            <Search size={16} className="text-[var(--text-3)]" />
            <input 
              value={entity} 
              onChange={(e: any) => {setEntity(e.target.value); setPage(1);}} 
              placeholder={t.search} 
              className="bg-transparent text-sm text-[var(--text-1)] outline-none w-full font-medium placeholder:text-[var(--text-4)]" 
            />
         </div>
         
         <select 
            value={action} 
            onChange={(e: any) => {setAction(e.target.value); setPage(1);}} 
            className="bg-[var(--bg-glass)] border border-[var(--border)] rounded-2xl px-5 py-3 text-xs font-bold text-[var(--text-2)] outline-none cursor-pointer hover:border-brand/30 transition-colors"
         >
            <option value="">{t.allActions}</option>
            {['CREATE','UPDATE','DELETE','LOGIN','UPLOAD'].map(a => <option key={a} value={a}>{a}</option>)}
         </select>

         <div className="flex items-center gap-2 px-6 py-3 bg-brand/5 border border-brand/10 rounded-2xl">
            <Shield size={14} className="text-brand" />
            <span className="text-[10px] font-black text-brand uppercase tracking-widest">Active Surveillance</span>
         </div>
      </div>

      <div className="clean-card !p-0 overflow-hidden shadow-xl shadow-brand/5">
         {isLoading ? <SkeletonTable rows={10} cols={5} /> : (
            <>
              <Table columns={cols} data={data?.items || []} keyFn={(l: any) => l.id} />
              {data && data.total > 0 && (
                <div className="p-6 border-t border-[var(--border)] bg-[var(--bg-surface)]/50">
                   <Pagination 
                      page={page} 
                      totalPages={totalPages} 
                      total={data.total} 
                      limit={limit} 
                      onPage={setPage} 
                   />
                </div>
              )}
            </>
         )}
      </div>
    </div>
  );
}
