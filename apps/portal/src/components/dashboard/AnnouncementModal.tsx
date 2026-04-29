'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Users, User, AlertCircle, Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/lib/actions/users';
import { createAnnouncement } from '@/lib/actions/announcements';
import { toast } from 'react-hot-toast';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

export function AnnouncementModal({ isOpen, onClose, language }: AnnouncementModalProps) {
  const isRtl = language === 'ar';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState<'ALL' | 'INDIVIDUAL'>('ALL');
  const [targetId, setTargetId] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [isSending, setIsSending] = useState(false);

  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      const res = await getUsers({});
      return res.data || [];
    },
    enabled: targetType === 'INDIVIDUAL'
  });

  const handleSend = async () => {
    if (!title || !content) return;
    setIsSending(true);
    
    try {
      const res = await createAnnouncement({
        title,
        content,
        targetType,
        targetId,
        priority
      });

      if (res.success) {
        toast.success(isRtl ? 'تم إرسال الإعلان بنجاح' : 'Announcement sent successfully');
        onClose();
        setTitle('');
        setContent('');
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error(isRtl ? 'حدث خطأ أثناء الإرسال' : 'Failed to send announcement');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                <Bell size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {isRtl ? 'إرسال إعلان جديد' : 'New Announcement'}
                </h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {isRtl ? 'بث رسالة للنظام' : 'Broadcast system message'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-8 space-y-6">
            {/* Target Selection */}
            <div className="flex gap-4 p-1 bg-slate-50 rounded-2xl border border-slate-100">
              <button 
                onClick={() => setTargetType('ALL')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${targetType === 'ALL' ? 'bg-white text-brand shadow-sm border border-slate-100' : 'text-slate-400'}`}
              >
                <Users size={14} />
                {isRtl ? 'الكل' : 'All Users'}
              </button>
              <button 
                onClick={() => setTargetType('INDIVIDUAL')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${targetType === 'INDIVIDUAL' ? 'bg-white text-brand shadow-sm border border-slate-100' : 'text-slate-400'}`}
              >
                <User size={14} />
                {isRtl ? 'موظف محدد' : 'Specific User'}
              </button>
            </div>

            {targetType === 'INDIVIDUAL' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  {isRtl ? 'اختر الموظف' : 'Select Employee'}
                </label>
                <select 
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-tight outline-none focus:border-brand/40 transition-all"
                >
                  <option value="">{isRtl ? 'اختر من القائمة...' : 'Select from list...'}</option>
                  {(Array.isArray(users) ? users : (users as any)?.items || [])?.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Title & Content */}
            <div className="space-y-4">
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isRtl ? 'عنوان الإعلان...' : 'Announcement title...'}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-tight outline-none focus:border-brand/40 transition-all placeholder:text-slate-300"
              />
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isRtl ? 'اكتب المحتوى هنا...' : 'Write content here...'}
                rows={4}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-tight outline-none focus:border-brand/40 transition-all resize-none placeholder:text-slate-300"
              />
            </div>

            {/* Priority & Submit */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPriority(priority === 'URGENT' ? 'NORMAL' : 'URGENT')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${priority === 'URGENT' ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                >
                  <AlertCircle size={12} />
                  {isRtl ? 'عاجل' : 'Urgent'}
                </button>
              </div>
              
              <button 
                onClick={handleSend}
                disabled={isSending || !title || !content || (targetType === 'INDIVIDUAL' && !targetId)}
                className="flex items-center gap-3 px-8 py-4 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-brand/20 hover:bg-brand/90 transition-all disabled:opacity-50 disabled:grayscale disabled:shadow-none active:scale-95"
              >
                {isSending ? (
                  <Bell className="animate-bounce" size={18} />
                ) : (
                  <Send size={18} />
                )}
                {isRtl ? 'إرسال الآن' : 'Broadcast Now'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
