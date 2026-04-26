'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Users, LayoutDashboard, PenTool, Image as ImageIcon,
    Video, Star, MessageSquare, CheckCircle, AlertCircle,
    Plus, Calendar, Target, TrendingUp, Search, Clock
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { PageHeader, StatCard } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { getSMClients, updateSMDetails, rateEmployee, getPeerRatings, getDeptMembers, getSMStats } from '@/lib/actions/social-media';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const T = {
    ar: {
        title: 'قسم السوشيال ميديا',
        subtitle: 'إدارة المحتوى، التصاميم، والمونتاج لعملاء الشركة',
        manager: 'مدير القسم',
        writer: 'كاتب المحتوى',
        creative: 'المصممون والمونتير',
        clients: 'المصالح (العملاء)',
        team: 'تقييم الفريق',
        target: 'الهدف المطلوب',
        done: 'المنجز',
        content: 'المحتوى',
        approve: 'اعتماد',
        rewrite: 'طلب تعديل',
        designs: 'تصاميم',
        videos: 'فيديوهات',
        stars: 'التقييم',
        comment: 'تعليق',
        submit: 'إرسال التقييم',
        achievement: 'نسبة الإنجاز',
    },
    en: {
        title: 'Social Media Dept',
        subtitle: 'Managing content, designs, and video editing for clients',
        manager: 'Manager',
        writer: 'Content Writer',
        creative: 'Designers & Editors',
        clients: 'Clients (Shared)',
        team: 'Team Ratings',
        target: 'Target',
        done: 'Done',
        content: 'Content',
        approve: 'Approve',
        rewrite: 'Rewrite Req',
        designs: 'Designs',
        videos: 'Videos',
        stars: 'Stars',
        comment: 'Comment',
        submit: 'Submit Rating',
        achievement: 'Achievement',
    }
};

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.05 } } };

export default function SocialMediaPage() {
    const { language } = useUIStore();
    const user = useAuthStore((s) => s.user);
    const isRtl = language === 'ar';
    const t = T[language as keyof typeof T] || T.en;
    const queryClient = useQueryClient();

    const [tab, setTab] = useState<'clients' | 'writer' | 'creative' | 'team'>('clients');

    const { data: clients = [], isLoading } = useQuery({
        queryKey: ['sm-clients'],
        queryFn: async () => {
            const res = await getSMClients();
            return res.data || [];
        }
    });

    const { data: stats } = useQuery({
        queryKey: ['sm-stats'],
        queryFn: async () => {
            const res = await getSMStats();
            return res.data || {};
        }
    });

    const tabs = [
        { key: 'clients' as const, label: t.clients, icon: LayoutDashboard },
        { key: 'writer' as const, label: t.writer, icon: PenTool },
        { key: 'creative' as const, label: t.creative, icon: ImageIcon },
        { key: 'team' as const, label: t.team, icon: Star },
    ];

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
            <PageHeader title={t.title} description={t.subtitle} />

            {/* Stats Bar */}
            <motion.div variants={fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label={isRtl ? 'إجمالي العملاء' : 'Total Clients'} value={(stats as any)?.totalClients || 0} icon={<Users size={18} />} />
                <StatCard label={isRtl ? 'محتوى معتمد' : 'Approved Content'} value={(stats as any)?.approvedContent || 0} icon={<CheckCircle size={18} />} trend="up" />
                <StatCard label={isRtl ? 'تصاميم منجزة' : 'Designs Done'} value={(stats as any)?.doneDesigns || 0} icon={<ImageIcon size={18} />} delta={`/${(stats as any)?.totalDesigns || 0}`} />
                <StatCard label={isRtl ? 'فيديوهات منجزة' : 'Videos Done'} value={(stats as any)?.doneVideos || 0} icon={<Video size={18} />} delta={`/${(stats as any)?.totalVideos || 0}`} />
            </motion.div>

            {/* Role Indicator */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                    <Users size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{isRtl ? 'صلاحياتك الحالية' : 'Current Role Access'}</p>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{user?.role?.replace('_', ' ')} · {user?.position || 'Team Member'}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {tabs.map(tb => (
                    <button key={tb.key} onClick={() => setTab(tb.key)} className={clsx(
                        'flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap',
                        tab === tb.key ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-slate-500 hover:text-brand hover:bg-slate-50 border border-transparent hover:border-slate-100'
                    )}>
                        <tb.icon size={14} /> {tb.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {tab === 'clients' && <ClientsTab key="clients" clients={clients} t={t} isRtl={isRtl} user={user} />}
                {tab === 'writer' && <WriterTab key="writer" clients={clients} t={t} isRtl={isRtl} />}
                {tab === 'creative' && <CreativeTab key="creative" clients={clients} t={t} isRtl={isRtl} />}
                {tab === 'team' && <TeamTab key="team" t={t} isRtl={isRtl} />}
            </AnimatePresence>
        </motion.div>
    );
}

// --- SUB-COMPONENTS ---

function ClientsTab({ clients, t, isRtl, user }: any) {
    const [editing, setEditing] = useState<any>(null);
    const queryClient = useQueryClient();

    const handleApprove = async (clientId: string, status: string) => {
        const res = await updateSMDetails(clientId, { contentStatus: status });
        if (res.success) {
            toast.success('Status updated');
            queryClient.invalidateQueries({ queryKey: ['sm-clients'] });
        }
    };

    return (
        <motion.div variants={fadeIn} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {clients.length === 0 && <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest py-10">No clients agreed yet.</p>}
            {clients.map((c: any) => (
                <div key={c.id} className="glass-card group p-8 border-slate-100 bg-white hover:bg-slate-50 transition-all shadow-sm">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h4 className="text-lg font-black text-slate-900 mb-1 uppercase tracking-tight">{c.name}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {new Date(c.smDetails?.startDate || c.createdAt).toLocaleDateString()} - {new Date(c.smDetails?.endDate || Date.now()).toLocaleDateString()}
                            </p>
                        </div>
                        <div className={clsx(
                            'px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm',
                            c.smDetails?.contentStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                c.smDetails?.contentStatus === 'REWRITE' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                        )}>
                            {c.smDetails?.contentStatus || 'PENDING'}
                        </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-6 mb-8">
                        <div>
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-3">
                                <span className="text-slate-400">{t.designs} ({c.smDetails?.doneDesigns || 0}/{c.smDetails?.targetDesigns || 0})</span>
                                <span className="text-brand">{Math.round(((c.smDetails?.doneDesigns || 0) / (c.smDetails?.targetDesigns || 1)) * 100)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, ((c.smDetails?.doneDesigns || 0) / (c.smDetails?.targetDesigns || 1)) * 100)}%` }}
                                    className="h-full bg-brand"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-3">
                                <span className="text-slate-400">{t.videos} ({c.smDetails?.doneVideos || 0}/{c.smDetails?.targetVideos || 0})</span>
                                <span className="text-slate-900">{Math.round(((c.smDetails?.doneVideos || 0) / (c.smDetails?.targetVideos || 1)) * 100)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, ((c.smDetails?.doneVideos || 0) / (c.smDetails?.targetVideos || 1)) * 100)}%` }}
                                    className="h-full bg-slate-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content Preview */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{t.content}</p>
                        <p className="text-xs text-slate-600 leading-relaxed italic font-medium">
                            {c.smDetails?.content || (isRtl ? 'لا يوجد محتوى مكتوب بعد...' : 'No content written yet...')}
                        </p>
                    </div>

                    {/* Actions for Manager */}
                    {user?.role !== 'EMPLOYEE' && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleApprove(c.id, 'APPROVED')}
                                className="flex-1 py-3.5 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand/90 transition-all shadow-lg"
                            >
                                <CheckCircle size={14} className="inline mb-0.5 mr-2" /> {t.approve}
                            </button>
                            <button
                                onClick={() => handleApprove(c.id, 'REWRITE')}
                                className="flex-1 py-3.5 rounded-xl bg-slate-50 text-rose-600 border border-rose-100 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all"
                            >
                                <AlertCircle size={14} className="inline mb-0.5 mr-2" /> {t.rewrite}
                            </button>
                            <button
                                onClick={() => setEditing(c)}
                                className="p-3.5 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 hover:text-brand hover:border-brand/30 transition-all shadow-sm"
                            >
                                <Target size={16} />
                            </button>
                        </div>
                    )}
                </div>
            ))}

            {/* Target Modal */}
            <Modal open={!!editing} onClose={() => setEditing(null)} title="Update Targets & Stats">
                <div className="space-y-6 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Target Designs" type="number" value={editing?.smDetails?.targetDesigns || 0} onChange={(e: any) => setEditing({ ...editing, smDetails: { ...editing.smDetails, targetDesigns: parseInt(e.target.value) } })} />
                        <Input label="Target Videos" type="number" value={editing?.smDetails?.targetVideos || 0} onChange={(e: any) => setEditing({ ...editing, smDetails: { ...editing.smDetails, targetVideos: parseInt(e.target.value) } })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Done Designs" type="number" value={editing?.smDetails?.doneDesigns || 0} onChange={(e: any) => setEditing({ ...editing, smDetails: { ...editing.smDetails, doneDesigns: parseInt(e.target.value) } })} />
                        <Input label="Done Videos" type="number" value={editing?.smDetails?.doneVideos || 0} onChange={(e: any) => setEditing({ ...editing, smDetails: { ...editing.smDetails, doneVideos: parseInt(e.target.value) } })} />
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                        <button className="px-6 py-3 rounded-xl bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100" onClick={() => setEditing(null)}>Cancel</button>
                        <button
                            className="px-10 py-3 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20"
                            onClick={async () => {
                                const res = await updateSMDetails(editing.id, {
                                    targetDesigns: editing.smDetails.targetDesigns,
                                    targetVideos: editing.smDetails.targetVideos,
                                    doneDesigns: editing.smDetails.doneDesigns,
                                    doneVideos: editing.smDetails.doneVideos,
                                });
                                if (res.success) {
                                    toast.success('Updated');
                                    setEditing(null);
                                    queryClient.invalidateQueries({ queryKey: ['sm-clients'] });
                                }
                            }}
                        >
                            Save Targets
                        </button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}

function WriterTab({ clients, t, isRtl }: any) {
    const [selected, setSelected] = useState<any>(null);
    const [text, setText] = useState('');
    const queryClient = useQueryClient();

    const handleSave = async () => {
        if (!selected) return;
        const res = await updateSMDetails(selected.id, { content: text, contentStatus: 'PENDING' });
        if (res.success) {
            toast.success('Content Submitted');
            queryClient.invalidateQueries({ queryKey: ['sm-clients'] });
            setSelected(null);
        }
    };

    return (
        <motion.div variants={fadeIn} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-2">
                {clients.map((c: any) => (
                    <button
                        key={c.id}
                        onClick={() => { setSelected(c); setText(c.smDetails?.content || ''); }}
                        className={clsx(
                            'w-full text-start p-5 rounded-2xl border transition-all flex flex-col gap-1 shadow-sm',
                            selected?.id === c.id ? 'bg-brand border-brand text-white shadow-lg shadow-brand/20' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                        )}
                    >
                        <span className="text-sm font-black uppercase tracking-tight">{c.name}</span>
                        <span className={clsx(
                            "text-[9px] font-black uppercase tracking-widest",
                            selected?.id === c.id ? 'text-white/60' : 'text-slate-400'
                        )}>Status: {c.smDetails?.contentStatus || 'NONE'}</span>
                    </button>
                ))}
            </div>
            <div className="md:col-span-2">
                {selected ? (
                    <div className="glass-card !p-8 h-full flex flex-col border-slate-100 bg-white shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{selected.name}</h4>
                            {selected.smDetails?.contentStatus === 'REWRITE' && (
                                <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 shadow-sm">
                                    <AlertCircle size={14} /> {t.rewrite}
                                </div>
                            )}
                        </div>
                        <textarea
                            value={text}
                            onChange={e => setText(e.target.value)}
                            placeholder={isRtl ? 'اكتب المحتوى هنا...' : 'Write content here...'}
                            className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm text-slate-900 outline-none focus:bg-white focus:border-brand/40 transition-all min-h-[400px] leading-relaxed resize-none font-medium placeholder:text-slate-300 shadow-inner"
                        />
                        <button
                            onClick={handleSave}
                            className="w-full py-4 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] mt-8 hover:bg-brand/90 transition-all shadow-lg shadow-brand/20"
                        >
                            {t.submit}
                        </button>
                    </div>
                ) : (
                    <div className="glass-card flex flex-col items-center justify-center py-40 text-slate-300 border-dashed border-slate-100 bg-white">
                        <PenTool size={48} className="mb-6 opacity-20 text-brand" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">{isRtl ? 'اختر مصلحة للبدء في الكتابة' : 'Select a client to start writing'}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function CreativeTab({ clients, t, isRtl }: any) {
    return (
        <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Daily Designs" value="4" icon={<ImageIcon size={18} />} delta="+1" trend="up" />
                <StatCard label="Daily Videos" value="2" icon={<Video size={18} />} />
                <StatCard label="Pending Approval" value="12" icon={<Clock size={18} />} trend="down" delta="3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map((c: any) => (
                    <div key={c.id} className="glass-card !p-6 border-slate-100 bg-white shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{c.name}</span>
                            <span className="text-[9px] font-black text-brand bg-brand/10 px-2 py-1 rounded-lg uppercase tracking-widest border border-brand/20">{t.target}</span>
                        </div>
                        <div className="flex items-center gap-8 mb-6">
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.designs}</p>
                                <p className="text-2xl font-black text-slate-900">{c.smDetails?.targetDesigns || 0}</p>
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.videos}</p>
                                <p className="text-2xl font-black text-slate-900">{c.smDetails?.targetVideos || 0}</p>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-slate-100">
                            <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                                <span>Deadline</span>
                                <span className="text-rose-500">48h remaining</span>
                            </div>
                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500 w-[60%]" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function TeamTab({ t, isRtl }: any) {
    const [rating, setRating] = useState({ stars: 5, comment: '', receiverId: '' });
    
    const { data: team = [] } = useQuery({
        queryKey: ['dept-members'],
        queryFn: async () => {
            const res = await getDeptMembers();
            return res.data || [];
        }
    });

    const { data: feed = [], refetch: refetchFeed } = useQuery({
        queryKey: ['peer-ratings'],
        queryFn: async () => {
            const res = await getPeerRatings('current');
            return res.data || [];
        }
    });

    const handleSubmit = async () => {
        if (!rating.receiverId) { toast.error(isRtl ? 'يرجى اختيار زميل' : 'Please select a colleague'); return; }
        const res = await rateEmployee(rating.receiverId, rating.stars, rating.comment);
        if (res.success) {
            toast.success(isRtl ? 'تم إرسال التقييم بنجاح! سيصل إشعار للزميل' : 'Rating submitted! Colleague notified.');
            setRating({ stars: 5, comment: '', receiverId: '' });
            refetchFeed();
        } else {
            toast.error(res.message || 'Failed to submit rating');
        }
    };

    return (
        <motion.div variants={fadeIn} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card !p-10 border-slate-100 bg-white shadow-sm">
                <h4 className="text-lg font-black text-slate-900 mb-10 uppercase tracking-tight">{isRtl ? 'تقييم أداء زميل' : 'Rate Peer Performance'}</h4>
                <div className="space-y-8">
                    <Select 
                        label="Select Colleague"
                        value={rating.receiverId}
                        onChange={e => setRating({ ...rating, receiverId: e.target.value })}
                        options={team.map((m: any) => ({ value: m.id, label: `${m.firstName} ${m.lastName} (${m.position})` }))}
                        placeholder="Choose colleague..."
                    />

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">{t.stars}</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setRating({ ...rating, stars: s })}
                                    className={clsx(
                                        'w-12 h-12 rounded-2xl flex items-center justify-center transition-all border',
                                        rating.stars >= s ? 'bg-amber-500 border-amber-600 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-50 border-slate-100 text-slate-300'
                                    )}
                                >
                                    <Star size={18} fill={rating.stars >= s ? 'currentColor' : 'none'} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <Input 
                        label={t.comment}
                        value={rating.comment}
                        onChange={e => setRating({ ...rating, comment: e.target.value })}
                        placeholder="Optional feedback..."
                    />

                    <button
                        onClick={handleSubmit}
                        className="w-full py-4 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 mt-4"
                    >
                        {t.submit}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 px-2">Recent Peer Feedbacks</h4>
                <div className="space-y-3">
                    {feed.length === 0 ? (
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-10 text-center">No feedbacks yet.</p>
                    ) : feed.map((f: any) => (
                        <div key={f.id} className="glass-card !p-6 border-slate-100 bg-white group hover:border-brand/20 transition-all shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-400 text-xs group-hover:text-brand group-hover:bg-brand/10 group-hover:border-brand/20 transition-all shadow-sm">
                                        {f.giver?.firstName?.[0]}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{f.giver?.firstName} {f.giver?.lastName}</p>
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{new Date(f.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-0.5 text-amber-500">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={11} fill={f.stars >= s ? 'currentColor' : 'none'} />)}
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed italic font-medium">"{f.comment}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
