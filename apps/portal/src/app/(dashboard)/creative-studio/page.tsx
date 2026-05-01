'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ImageIcon, Video, Play, CheckCircle2, 
    Clock, AlertCircle, Filter, Search,
    Maximize2, Download, ExternalLink, Sparkles,
    Palette, Layers, Camera, Pencil
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { getSMClients, updateSMDetails } from '@/lib/actions/social-media';
import { updateTask } from '@/lib/actions/tasks';

const T = {
    ar: {
        title: 'مرسم الإبداع',
        subtitle: 'إدارة التصاميم، المونتاج، والإنتاج البصري',
        tasks: 'قائمة المهام الإبداعية',
        filter: 'تصفية حسب العميل',
        all: 'الكل',
        design: 'تصميم',
        video: 'فيديو',
        done: 'تم الإنجاز',
        working: 'قيد التنفيذ',
        pending: 'بانتظار البدء',
        guidelines: 'هوية العلامة التجارية',
    },
    en: {
        title: 'Creative Studio',
        subtitle: 'Design, editing, and visual production management',
        tasks: 'Creative Task List',
        filter: 'Filter by Client',
        all: 'All',
        design: 'Design',
        video: 'Video',
        done: 'Done',
        working: 'Working',
        pending: 'Pending',
        guidelines: 'Brand Identity',
    }
};

export default function CreativeStudioPage() {
    const { language } = useUIStore();
    const isRtl = language === 'ar';
    const t = T[language as keyof typeof T] || T.en;
    
    const [filter, setFilter] = useState('all');
    const queryClient = useQueryClient();

    const { data: clients = [] } = useQuery({
        queryKey: ['sm-clients'],
        queryFn: async () => {
            const res = await getSMClients();
            return res.data || [];
        }
    });

    // Flatten tasks from all clients
    const allTasks = clients.flatMap((c: any) => 
        (c.projects?.[0]?.tasks || []).map((task: any) => ({
            ...task,
            clientName: c.name,
            clientId: c.id
        }))
    ).filter((tk: any) => filter === 'all' || tk.clientId === filter);

    const updateMutation = useMutation({
        mutationFn: ({ id, status }: any) => updateTask(id, { status }),
        onSuccess: () => {
            toast.success('Task status updated');
            queryClient.invalidateQueries({ queryKey: ['sm-clients'] });
        }
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shadow-inner">
                        <Palette size={26} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t.title}</h1>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">{t.subtitle}</p>
                    </div>
                </div>

                {/* Client Filter */}
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar max-w-full">
                    <button 
                        onClick={() => setFilter('all')}
                        className={clsx(
                            "px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                            filter === 'all' ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {t.all}
                    </button>
                    {clients.map((c: any) => (
                        <button 
                            key={c.id}
                            onClick={() => setFilter(c.id)}
                            className={clsx(
                                "px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                filter === c.id ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allTasks.map((task: any) => (
                    <motion.div
                        layout
                        key={task.id}
                        className="glass-card bg-white border-slate-100 group hover:border-purple-200 transition-all flex flex-col overflow-hidden"
                    >
                        {/* Task Type Preview */}
                        <div className="h-32 bg-slate-50 flex items-center justify-center relative overflow-hidden group-hover:bg-purple-50/30 transition-all border-b border-slate-50">
                            {task.title.toUpperCase().includes('VIDEO') ? (
                                <Video size={40} className="text-purple-200 group-hover:text-purple-400 transition-all" />
                            ) : (
                                <ImageIcon size={40} className="text-blue-200 group-hover:text-blue-400 transition-all" />
                            )}
                            <div className="absolute top-4 left-4">
                                <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-slate-500 border border-slate-100 shadow-sm">
                                    {task.clientName}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2 group-hover:text-purple-600 transition-all">{task.title}</h4>
                            <p className="text-[10px] text-slate-400 font-medium line-clamp-2 mb-6">
                                {task.description || 'No description provided for this task.'}
                            </p>

                            <div className="mt-auto space-y-4">
                                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">Priority</span>
                                    <span className={clsx(
                                        task.priority === 'HIGH' ? 'text-rose-500' : 'text-amber-500'
                                    )}>{task.priority}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-50">
                                    {task.status !== 'DONE' ? (
                                        <>
                                            <button 
                                                onClick={() => updateMutation.mutate({ id: task.id, status: 'IN_PROGRESS' })}
                                                className={clsx(
                                                    "py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all",
                                                    task.status === 'IN_PROGRESS' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                                )}
                                            >
                                                Working
                                            </button>
                                            <button 
                                                onClick={() => updateMutation.mutate({ id: task.id, status: 'DONE' })}
                                                className="py-2.5 rounded-xl bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all"
                                            >
                                                Complete
                                            </button>
                                        </>
                                    ) : (
                                        <div className="col-span-2 py-2.5 rounded-xl bg-slate-50 text-emerald-500 text-[8px] font-black uppercase tracking-widest text-center border border-emerald-100 flex items-center justify-center gap-2">
                                            <CheckCircle2 size={12} /> Task Completed
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {allTasks.length === 0 && (
                    <div className="col-span-full py-40 text-center glass-card border-dashed border-slate-200">
                        <Pencil size={48} className="mx-auto text-slate-100 mb-6" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No creative tasks found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
