'use client';

import { useQuery } from '@tanstack/react-query';
import { getNotifications, markAsRead } from '@/lib/actions/system';
import { PageHeader } from '@/components/ui/States';
import { Bell, Check, Info, AlertTriangle, ShieldAlert } from 'lucide-react';
import { clsx } from 'clsx';

export default function NotificationsPage() {
  const { data: notifications, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => { const r = await getNotifications(); return r.data || []; },
  });

  const handleRead = async (id: string) => {
    await markAsRead(id);
    refetch();
  };

  const icons: Record<string, any> = {
    INFO: <Info size={16} className="text-blue-400" />,
    WARNING: <AlertTriangle size={16} className="text-amber-400" />,
    ALERT: <ShieldAlert size={16} className="text-rose-400" />,
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Notifications Center" description="Stay updated with system alerts and personal messages." />

      <div className="space-y-3">
        {(notifications || []).map((n: any) => (
          <div key={n.id} className={clsx('glass-card p-5 flex items-start gap-4 transition-all', !n.isRead && 'border-blue-500/30 bg-blue-500/5')}>
            <div className="mt-1">{icons[n.type] || <Bell size={16} className="text-slate-400" />}</div>
            <div className="flex-1">
              <h4 className={clsx('text-sm mb-1', n.isRead ? 'font-medium text-slate-300' : 'font-bold text-white')}>{n.title}</h4>
              <p className="text-xs text-slate-500">{n.message}</p>
              <span className="text-[10px] font-mono text-slate-600 mt-2 block">{new Date(n.createdAt).toLocaleString()}</span>
            </div>
            {!n.isRead && (
              <button onClick={() => handleRead(n.id)} className="p-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-400 transition-colors" title="Mark as read">
                <Check size={14} />
              </button>
            )}
          </div>
        ))}
        {notifications?.length === 0 && (
          <div className="glass-card p-12 text-center text-slate-500">No notifications caught yet.</div>
        )}
      </div>
    </div>
  );
}
