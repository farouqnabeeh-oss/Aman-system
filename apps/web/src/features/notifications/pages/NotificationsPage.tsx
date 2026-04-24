import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, ExternalLink, Inbox, User, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import api from '../../../lib/axios';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '../../../store/auth.store';
import { PageHeader, EmptyState } from '../../../components/ui/States';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import { Input, Select, Textarea } from '../../../components/ui/Input';
import toast from 'react-hot-toast';

const TRANSLATIONS = {
  ar: {
    title: 'مركز التنبيهات',
    unread: 'رسائل غير مقروءة',
    allRead: 'تم قراءة الكل',
    markAll: 'تحديد الكل كمقروء',
    empty: 'صندوق الوارد فارغ',
    emptySub: 'أنت على اطلاع دائم بكل شيء!',
    delete: 'حذف',
    read: 'مقروء',
  },
  en: {
    title: 'Notification Inbox',
    unread: 'unread messages',
    allRead: 'All Caught Up',
    markAll: 'Mark All Read',
    empty: 'Inbox is Empty',
    emptySub: 'You are all caught up on your enterprise alerts.',
    delete: 'Delete',
    read: 'Read',
  }
};

export function NotificationsPage() {
  const qc = useQueryClient();
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const t = TRANSLATIONS[language];

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<any>('/notifications').then(r => r.data.data),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['notifications'] }); qc.invalidateQueries({ queryKey:['notifications','unread-count'] }); },
  });

  const markAllRead = useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['notifications'] }); qc.invalidateQueries({ queryKey:['notifications','unread-count'] }); toast.success('All read'); },
  });

  const deleteNotif = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); },
  });

  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [bForm, setBForm] = useState({ title: '', message: '', userId: '' });
  const user = useAuthStore(s => s.user);
  const { data: users } = useQuery({ 
    queryKey:['users-minimal'], 
    queryFn:()=>api.get<any>('/users',{params:{limit:100}}).then(r=>r.data.data.items), 
    enabled: !!(user?.role !== 'EMPLOYEE') 
  });

  const broadcastMutation = useMutation({
    mutationFn: () => api.post('/notifications/broadcast', null, { params: bForm }),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey:['notifications'] }); 
      setBroadcastOpen(false); 
      setBForm({ title: '', message: '', userId: '' });
      toast.success(isRtl ? 'تم إرسال الرسالة بنجاح' : 'Broadcast Deployed'); 
    },
  });

  const isManager = user?.role && ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(user.role);

  const items = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <PageHeader
        title={t.title}
        description={unreadCount > 0 ? `${unreadCount} ${t.unread}` : t.allRead}
        action={
          <div className="flex gap-4">
             {isManager && (
               <button onClick={() => setBroadcastOpen(true)} className="clean-btn-secondary h-12 gap-2 text-xs uppercase tracking-widest px-6 border-sky-500/20"><Bell size={16} /> {isRtl ? 'إرسال تعميم' : 'Send Broadcast'}</button>
             )}
             {unreadCount > 0 && (
               <button onClick={() => markAllRead.mutate()} className="clean-btn-primary h-12 gap-2 text-xs uppercase tracking-widest px-6 bg-sky-500 shadow-sky-500/20"><CheckCheck size={16} /> {t.markAll}</button>
             )}
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-3xl" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={<Inbox size={32}/>} title={t.empty} description={t.emptySub} />
      ) : (
        <div className="space-y-3">
           <AnimatePresence>
             {items.map((n: any) => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={clsx(
                    'clean-card !p-6 flex gap-6 transition-all border-l-4',
                    n.isRead ? 'border-transparent opacity-60' : 'border-white'
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 shrink-0">
                     <Bell size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between gap-4 mb-2">
                        <h4 className={clsx("text-sm font-bold truncate transition-colors", n.isRead ? "text-slate-400" : "text-white")}>{n.title}</h4>
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest shrink-0">{new Date(n.createdAt).toLocaleTimeString(language, {hour:'2-digit', minute:'2-digit'})}</span>
                     </div>
                     <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">{n.message}</p>
                     
                     {n.actionUrl && (
                        <Link to={n.actionUrl} className="inline-flex items-center gap-2 mt-4 text-[10px] font-black text-white uppercase tracking-[0.2em] hover:text-indigo-400 transition-colors">
                           View Details <ExternalLink size={10} />
                        </Link>
                     )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                     {!n.isRead && (
                       <button onClick={() => markRead.mutate(n.id)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-600 hover:text-white transition-all"><Check size={14}/></button>
                     )}
                     <button onClick={() => deleteNotif.mutate(n.id)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-600 hover:text-rose-500 transition-all"><Trash2 size={14}/></button>
                  </div>
                </motion.div>
             ))}
           </AnimatePresence>
        </div>
      )}
      <Modal open={broadcastOpen} onClose={() => setBroadcastOpen(false)} title={isRtl ? 'إرسال تعميم جديد' : 'Strategic Broadcast'}>
         <div className="space-y-8 pt-4">
            <Select 
               label={isRtl ? 'المستلم (اختياري - الكل إذا كان فارغاً)' : 'Target Operator (Optional)'} 
               icon={User} 
               value={bForm.userId} 
               options={[{value:'', label: isRtl ? 'الكل' : 'All Personnel'}, ...(users ?? []).map((u: any)=>({value:u.id, label:`${u.firstName} ${u.lastName}`}))]} 
               onChange={(e: any) => setBForm(f => ({...f, userId: e.target.value}))} 
            />
            <Input label={isRtl ? 'عنوان الرسالة' : 'Broadcast Title'} icon={Bell} value={bForm.title} onChange={(e: any) => setBForm(f => ({...f, title: e.target.value}))} />
            <Textarea label={isRtl ? 'محتوى التعميم' : 'Operational Message'} icon={Layers} value={bForm.message} onChange={(e: any) => setBForm(f => ({...f, message: e.target.value}))} />
            
            <div className="flex justify-end gap-4 mt-12 py-6 border-t border-white/5">
               <button className="clean-btn-secondary px-10" onClick={() => setBroadcastOpen(false)}>{language === 'ar' ? 'إلغاء' : 'Abort'}</button>
               <button 
                  className="clean-btn-primary px-10 bg-sky-500" 
                  onClick={() => broadcastMutation.mutate()}
                  disabled={broadcastMutation.isPending}
               >
                  {broadcastMutation.isPending ? '...' : (language === 'ar' ? 'إرسال الآن' : 'Deploy Now')}
               </button>
            </div>
         </div>
      </Modal>
    </div>
  );
}
