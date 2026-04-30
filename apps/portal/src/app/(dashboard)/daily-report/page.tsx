'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, CheckCircle2, AlertCircle, Zap, Calendar, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { submitDailyReport, getMyDailyReports, getTodayMyReport } from '@/lib/actions/daily-reports';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const T = {
  ar: {
    title: 'تقرير نهاية اليوم',
    sub: 'أخبر مديرتك بما أنجزته اليوم',
    done: 'ماذا أنجزت اليوم؟',
    donePlaceholder: 'اذكر كل ما قمت بإنجازه اليوم بالتفصيل...',
    plan: 'خطة الغد',
    planPlaceholder: 'ما الذي تخطط للعمل عليه غداً؟',
    blocks: 'عقبات أو ملاحظات',
    blocksPlaceholder: 'هل هناك أي مشاكل أو أشياء تحتاج للدعم فيها؟ (اختياري)',
    submit: 'إرسال التقرير',
    submitted: 'تم الإرسال ✓',
    history: 'تقاريري السابقة',
    noHistory: 'لا توجد تقارير سابقة بعد',
    alreadySubmitted: 'لقد أرسلت تقرير اليوم مسبقاً. يمكنك تعديله.',
    update: 'تحديث التقرير',
    required: 'يرجى ملء حقلي الإنجاز والخطة',
  },
  en: {
    title: "End of Day Report",
    sub: "Tell your manager what you accomplished today",
    done: "What did you accomplish today?",
    donePlaceholder: "Describe everything you completed today in detail...",
    plan: "Tomorrow's Plan",
    planPlaceholder: "What are you planning to work on tomorrow?",
    blocks: "Blockers / Notes",
    blocksPlaceholder: "Any issues or things you need support with? (Optional)",
    submit: "Submit Report",
    submitted: "Submitted ✓",
    history: "My Previous Reports",
    noHistory: "No previous reports yet",
    alreadySubmitted: "You already submitted today's report. You can update it.",
    update: "Update Report",
    required: "Please fill in both accomplishments and plan fields",
  }
};

export default function DailyReportPage() {
  const { language } = useUIStore();
  const user = useAuthStore(s => s.user);
  const t = T[language as keyof typeof T] || T.en;
  const isRtl = language === 'ar';
  const queryClient = useQueryClient();
  const [showHistory, setShowHistory] = useState(false);

  const [form, setForm] = useState({ done: '', plan: '', blocks: '' });

  const { data: todayReport } = useQuery({
    queryKey: ['today-report'],
    queryFn: async () => {
      const res = await getTodayMyReport();
      return res.data;
    }
  });

  const { data: history = [] } = useQuery({
    queryKey: ['my-reports'],
    queryFn: async () => {
      const res = await getMyDailyReports();
      return res.data || [];
    }
  });

  useEffect(() => {
    if (todayReport) {
      setForm({
        done: todayReport.done || '',
        plan: todayReport.plan || '',
        blocks: todayReport.blocks || '',
      });
    }
  }, [todayReport]);

  const mutation = useMutation({
    mutationFn: () => submitDailyReport(form),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(isRtl ? 'تم إرسال التقرير بنجاح!' : 'Report submitted successfully!');
        queryClient.invalidateQueries({ queryKey: ['today-report'] });
        queryClient.invalidateQueries({ queryKey: ['my-reports'] });
      } else {
        toast.error(res.message || 'Error');
      }
    }
  });

  const handleSubmit = () => {
    if (!form.done.trim() || !form.plan.trim()) return toast.error(t.required);
    mutation.mutate();
  };

  const today = new Date().toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shadow-inner">
          <ClipboardList size={26} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t.title}</h1>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
            <Calendar size={12} /> {today}
          </p>
        </div>
      </div>

      {/* Already submitted banner */}
      <AnimatePresence>
        {todayReport && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700"
          >
            <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
            <p className="text-xs font-black uppercase tracking-wide">{t.alreadySubmitted}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Card */}
      <div className="glass-card bg-white border-slate-100 shadow-sm space-y-6 !p-10">
        {/* Done */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <CheckCircle2 size={13} className="text-emerald-500" /> {t.done}
          </label>
          <textarea
            value={form.done}
            onChange={e => setForm({ ...form, done: e.target.value })}
            placeholder={t.donePlaceholder}
            rows={5}
            dir={isRtl ? 'rtl' : 'ltr'}
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-medium placeholder:text-slate-400 outline-none focus:border-brand/50 focus:ring-4 focus:ring-brand/5 transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Plan */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Zap size={13} className="text-brand" /> {t.plan}
          </label>
          <textarea
            value={form.plan}
            onChange={e => setForm({ ...form, plan: e.target.value })}
            placeholder={t.planPlaceholder}
            rows={4}
            dir={isRtl ? 'rtl' : 'ltr'}
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-medium placeholder:text-slate-400 outline-none focus:border-brand/50 focus:ring-4 focus:ring-brand/5 transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Blocks */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <AlertCircle size={13} className="text-amber-500" /> {t.blocks}
          </label>
          <textarea
            value={form.blocks}
            onChange={e => setForm({ ...form, blocks: e.target.value })}
            placeholder={t.blocksPlaceholder}
            rows={3}
            dir={isRtl ? 'rtl' : 'ltr'}
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-medium placeholder:text-slate-400 outline-none focus:border-amber-400/50 focus:ring-4 focus:ring-amber-500/5 transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={mutation.isPending}
          className="w-full py-4 rounded-2xl bg-brand text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-brand/20 hover:bg-brand/90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-3"
        >
          {mutation.isPending ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <ClipboardList size={18} />
          )}
          {todayReport ? t.update : t.submit}
        </button>
      </div>

      {/* History */}
      <div className="glass-card bg-white border-slate-100 shadow-sm !p-0 overflow-hidden">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between px-8 py-6 hover:bg-slate-50 transition-all"
        >
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
            <Clock size={14} className="text-slate-400" /> {t.history}
            <span className="px-2.5 py-1 rounded-full bg-brand/10 text-brand text-[9px] font-black">{history.length}</span>
          </span>
          {showHistory ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-slate-100"
            >
              {history.length === 0 ? (
                <p className="text-center py-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.noHistory}</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {history.map((r: any) => (
                    <div key={r.id} className="px-8 py-6 hover:bg-slate-50 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-black text-brand uppercase tracking-widest px-3 py-1 rounded-full bg-brand/10">
                          {new Date(r.date).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed line-clamp-3" dir={isRtl ? 'rtl' : 'ltr'}>{r.done}</p>
                      {r.blocks && (
                        <p className="text-[10px] font-black text-amber-600 mt-2 flex items-center gap-2">
                          <AlertCircle size={10} /> {r.blocks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
