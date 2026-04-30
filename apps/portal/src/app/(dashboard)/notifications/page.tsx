'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAsRead, markAllNotificationsRead } from '@/lib/actions/system';
import { PageHeader } from '@/components/ui/States';
import { Bell, Check, Info, AlertTriangle, ShieldAlert, CheckCheck, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/ui.store';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useEffect } from 'react';

const fadeIn = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.05 } } };

const typeConfig: Record<string, { icon: any; colors: string; badge: string }> = {
  INFO:    { icon: Info,         colors: 'bg-blue-50 border-blue-100',    badge: 'bg-blue-500' },
  WARNING: { icon: AlertTriangle, colors: 'bg-amber-50 border-amber-100', badge: 'bg-amber-500' },
  ALERT:   { icon: ShieldAlert,  colors: 'bg-rose-50 border-rose-100',    badge: 'bg-rose-500' },
};

export default function NotificationsPage() {
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => { const r = await getNotifications(); return r.data || []; },
    refetchInterval: 15000,
  });

  // Auto-mark all as read when page opens
  useEffect(() => {
    const autoMarkRead = async () => {
      await markAllNotificationsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
      queryClient.invalidateQueries({ queryKey: ['global-notifications-check'] });
    };
    autoMarkRead();
  }, []);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = async () => {
    await markAllNotificationsRead();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    queryClient.invalidateQueries({ queryKey: ['global-notifications-check'] });
    toast.success(isRtl ? 'تم تحديد الكل كمقروء' : 'All marked as read');
  };

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;
  
  const grouped = {
    unread: notifications.filter((n: any) => !n.isRead),
    read: notifications.filter((n: any) => n.isRead),
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader
        title={isRtl ? 'مركز الإشعارات' : 'Notification Center'}
        description={isRtl ? 'ابقَ على اطلاع بكل ما يحدث في النظام' : 'Stay updated with real-time system alerts and personal messages'}
        action={
          unreadCount > 0 ? (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand/90 shadow-lg shadow-brand/20 transition-all"
            >
              <CheckCheck size={14} /> {isRtl ? 'تحديد الكل كمقروء' : 'Mark All Read'}
            </button>
          ) : undefined
        }
      />

      {/* Stats strip */}
      <motion.div variants={fadeIn} className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3 px-5 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center text-brand"><Bell size={16} /></div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'إجمالي' : 'Total'}</p>
            <p className="text-lg font-black text-slate-900 leading-none">{notifications.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 py-3.5 bg-brand/5 border border-brand/20 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-brand/20 flex items-center justify-center text-brand"><Clock size={16} /></div>
          <div>
            <p className="text-[9px] font-black text-brand uppercase tracking-widest">{isRtl ? 'غير مقروءة' : 'Unread'}</p>
            <p className="text-lg font-black text-brand leading-none">{unreadCount}</p>
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <motion.div variants={fadeIn} className="glass-card p-24 text-center bg-white border-slate-100">
          <Bell size={48} className="mx-auto text-slate-200 mb-6" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            {isRtl ? 'لا توجد إشعارات حتى الآن' : 'No notifications yet'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Unread */}
          {grouped.unread.length > 0 && (
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-1">
                {isRtl ? 'غير مقروءة' : 'Unread'} ({grouped.unread.length})
              </p>
              <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
                {grouped.unread.map((n: any) => (
                  <NotificationCard key={n.id} n={n} isRtl={isRtl} onMarkRead={() => markReadMutation.mutate(n.id)} />
                ))}
              </motion.div>
            </div>
          )}

          {/* Read */}
          {grouped.read.length > 0 && (
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-1">
                {isRtl ? 'تمت القراءة' : 'Earlier'} ({grouped.read.length})
              </p>
              <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2 opacity-60">
                {grouped.read.map((n: any) => (
                  <NotificationCard key={n.id} n={n} isRtl={isRtl} onMarkRead={undefined} />
                ))}
              </motion.div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function NotificationCard({ n, isRtl, onMarkRead }: { n: any; isRtl: boolean; onMarkRead?: () => void }) {
  const cfg = typeConfig[n.type] || typeConfig.INFO;
  const Icon = cfg.icon;

  return (
    <motion.div
      variants={fadeIn}
      className={clsx(
        'flex items-start gap-4 p-5 rounded-2xl border transition-all group',
        !n.isRead ? `${cfg.colors} shadow-sm` : 'bg-white border-slate-100'
      )}
    >
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', !n.isRead ? 'bg-white shadow-sm' : 'bg-slate-100')}>
        <Icon size={18} className={!n.isRead ? (n.type === 'WARNING' ? 'text-amber-500' : n.type === 'ALERT' ? 'text-rose-500' : 'text-blue-500') : 'text-slate-400'} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={clsx('text-sm font-black uppercase tracking-tight', !n.isRead ? 'text-slate-900' : 'text-slate-500')}>
            {n.title}
          </h4>
          {!n.isRead && <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', cfg.badge)} />}
        </div>
        <p className={clsx('text-xs leading-relaxed', !n.isRead ? 'text-slate-600' : 'text-slate-400')}>
          {n.message}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[10px] font-mono text-slate-400">
            {new Date(n.createdAt).toLocaleString(isRtl ? 'ar-SA' : 'en-US')}
          </span>
          {n.actionUrl && (
            <Link
              href={n.actionUrl}
              className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline"
            >
              {isRtl ? 'عرض التفاصيل' : 'View →'}
            </Link>
          )}
        </div>
      </div>

      {onMarkRead && (
        <button
          onClick={onMarkRead}
          className="opacity-0 group-hover:opacity-100 p-2 rounded-xl bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-500 text-slate-400 transition-all flex-shrink-0"
          title={isRtl ? 'تحديد كمقروء' : 'Mark as read'}
        >
          <Check size={14} />
        </button>
      )}
    </motion.div>
  );
}
