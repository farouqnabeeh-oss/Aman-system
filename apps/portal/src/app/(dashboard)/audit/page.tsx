'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '@/lib/actions/system';
import { PageHeader } from '@/components/ui/States';
import { Shield, Activity, Database } from 'lucide-react';

export default function AuditPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit'],
    queryFn: async () => { const r = await getAuditLogs(); return r.data || []; },
  });

  return (
    <div className="space-y-8">
      <PageHeader title="Audit Log" description="System-level security trails and operation history" />

      <div className="glass-card !p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className="px-5 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Time</th>
              <th className="px-5 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Agent</th>
              <th className="px-5 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Action</th>
              <th className="px-5 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Entity</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-500">Loading trails...</td></tr>
            ) : (logs || []).map((log: any) => (
              <tr key={log.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="px-5 py-4 text-xs font-mono text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-5 py-4 text-sm font-bold text-white">{log.userName}</td>
                <td className="px-5 py-4">
                  <span className="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest bg-white/5 text-slate-300">
                    {log.action}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Database size={14} />
                    {log.entity} <span className="text-slate-600">#{log.entityId?.slice(0, 8)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
