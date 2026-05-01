'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PenTool, FileText, Send, History, 
    Type, Languages, Hash, Sparkles,
    CheckCircle2, Clock, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { getSMClients, updateSMDetails } from '@/lib/actions/social-media';
import { processAIContent } from '@/lib/actions/ai';

const T = {
    ar: {
        title: 'مساحة عمل كاتب المحتوى',
        subtitle: 'أدوات احترافية لصناعة المحتوى الرقمي',
        editor: 'محرر النصوص الذكي',
        history: 'سجل المسودات',
        selectClient: 'اختر العميل',
        tone: 'نبرة الصوت',
        submit: 'إرسال للمراجعة',
        characters: 'عدد الحروف',
        words: 'عدد الكلمات',
        friendly: 'ودي / لطيف',
        professional: 'رسمي / احترافي',
        creative: 'إبداعي / خارج الصندوق',
        aiHelper: 'مساعد الذكاء الاصطناعي',
        generateHook: 'إنشاء مقدمة جذابة',
        expandContent: 'توسيع المحتوى',
        fixGrammar: 'تصحيح لغوي',
    },
    en: {
        title: 'Content Writer Workspace',
        subtitle: 'Professional tools for digital content creation',
        editor: 'Smart Text Editor',
        history: 'Draft History',
        selectClient: 'Select Client',
        tone: 'Tone of Voice',
        submit: 'Submit for Review',
        characters: 'Characters',
        words: 'Words',
        friendly: 'Friendly',
        professional: 'Professional',
        creative: 'Creative',
        aiHelper: 'AI Assistant',
        generateHook: 'Generate Hook',
        expandContent: 'Expand Content',
        fixGrammar: 'Fix Grammar',
    }
};

export default function ContentWriterPage() {
    const { language } = useUIStore();
    const isRtl = language === 'ar';
    const t = T[language as keyof typeof T] || T.en;
    
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [content, setContent] = useState('');
    const [tone, setTone] = useState('professional');
    const [isAIProcessing, setIsAIProcessing] = useState(false);
    const queryClient = useQueryClient();

    const { data: clients = [] } = useQuery({
        queryKey: ['sm-clients'],
        queryFn: async () => {
            const res = await getSMClients();
            return res.data || [];
        }
    });

    const submitMutation = useMutation({
        mutationFn: () => updateSMDetails(selectedClient.id, { content, contentStatus: 'PENDING' }),
        onSuccess: () => {
            toast.success(isRtl ? 'تم إرسال المحتوى للمراجعة' : 'Content submitted for review');
            queryClient.invalidateQueries({ queryKey: ['sm-clients'] });
        }
    });

    const handleAIAction = async (action: 'HOOK' | 'EXPAND' | 'REWRITE') => {
        if (!content) return toast.error('Please enter content first');
        setIsAIProcessing(true);
        const res = await processAIContent(content, action);
        setIsAIProcessing(false);
        if (res.success && res.data) {
            setContent(res.data);
            toast.success('AI magic applied!');
        }
    };

    const stats = {
        chars: content.length,
        words: content.trim() ? content.trim().split(/\s+/).length : 0
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500 shadow-inner">
                    <PenTool size={26} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t.title}</h1>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">{t.subtitle}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar: Clients & Tone */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card bg-white border-slate-100 p-8 space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">{t.selectClient}</label>
                            <div className="space-y-2">
                                {clients.map((c: any) => (
                                    <button
                                        key={c.id}
                                        onClick={() => {
                                            setSelectedClient(c);
                                            setContent(c.smDetails?.content || '');
                                        }}
                                        className={clsx(
                                            "w-full text-start px-5 py-4 rounded-xl border transition-all flex flex-col gap-1",
                                            selectedClient?.id === c.id 
                                                ? "bg-pink-500 border-pink-600 text-white shadow-lg shadow-pink-500/20" 
                                                : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
                                        )}
                                    >
                                        <span className="text-xs font-black uppercase tracking-tight">{c.name}</span>
                                        <span className={clsx(
                                            "text-[8px] font-black uppercase tracking-widest",
                                            selectedClient?.id === c.id ? "text-white/60" : "text-slate-400"
                                        )}>{c.smDetails?.contentStatus || 'NO CONTENT'}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">{t.tone}</label>
                            <div className="grid grid-cols-1 gap-2">
                                {['professional', 'friendly', 'creative'].map(tn => (
                                    <button
                                        key={tn}
                                        onClick={() => setTone(tn)}
                                        className={clsx(
                                            "px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all text-start flex items-center gap-3",
                                            tone === tn ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                                        )}
                                    >
                                        <div className={clsx("w-1.5 h-1.5 rounded-full", tone === tn ? "bg-pink-400" : "bg-slate-200")} />
                                        {t[tn as keyof typeof t]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="glass-card bg-white border-slate-100 p-8">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Sparkles size={12} className="text-pink-500" /> {t.aiHelper}
                        </h4>
                        <div className="space-y-3">
                            <button 
                                onClick={() => handleAIAction('HOOK')}
                                disabled={isAIProcessing}
                                className="w-full text-start p-4 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-600 hover:bg-pink-50 hover:border-pink-200 transition-all flex items-center justify-between group"
                            >
                                {t.generateHook}
                                <ArrowUpRight size={14} className="text-slate-300 group-hover:text-pink-500 transition-all" />
                            </button>
                            <button 
                                onClick={() => handleAIAction('EXPAND')}
                                disabled={isAIProcessing}
                                className="w-full text-start p-4 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-600 hover:bg-pink-50 hover:border-pink-200 transition-all flex items-center justify-between group"
                            >
                                {t.expandContent}
                                <ArrowUpRight size={14} className="text-slate-300 group-hover:text-pink-500 transition-all" />
                            </button>
                        </div>
                    </div>
                </div>


                {/* Main: Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card bg-white border-slate-100 !p-0 overflow-hidden flex flex-col min-h-[600px] shadow-sm">
                        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <FileText size={18} className="text-slate-400" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedClient ? selectedClient.name : t.editor}</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    {t.words}: <span className="text-slate-900">{stats.words}</span>
                                </div>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    {t.characters}: <span className="text-slate-900">{stats.chars}</span>
                                </div>
                            </div>
                        </div>

                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Start writing your masterpiece..."
                            dir={isRtl ? 'rtl' : 'ltr'}
                            className="flex-1 p-10 text-base font-medium text-slate-700 placeholder:text-slate-200 outline-none resize-none leading-relaxed"
                        />

                        <div className="px-8 py-6 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/30">
                            <button className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">
                                {isRtl ? 'حفظ كمسودة' : 'Save as Draft'}
                            </button>
                            <button 
                                onClick={() => submitMutation.mutate()}
                                disabled={!selectedClient || !content.trim() || submitMutation.isPending}
                                className="px-10 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                <Send size={14} /> {t.submit}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
