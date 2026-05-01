'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, CheckCircle2, AlertCircle, 
    MessageSquare, Send, Users, Target, 
    ArrowUpRight, BarChart3, Clock, 
    PenTool, ImageIcon, Video, Plus
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { getSMClients, updateSMDetails, createSMTask } from '@/lib/actions/social-media';
import { updateBrandGuideline } from '@/lib/actions/client';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';

const T = {
    ar: {
        title: 'مساحة عمل مدير الصفحات',
        subtitle: 'إدارة العملاء، اعتماد المحتوى، وتوزيع المهام',
        clients: 'قائمة العملاء',
        approvals: 'بانتظار الاعتماد',
        assignTask: 'إسناد مهمة',
        approve: 'اعتماد المحتوى',
        reject: 'طلب تعديل',
        stats: 'إحصائيات الإنجاز',
        active: 'نشط',
        pending: 'قيد الانتظار',
    },
    en: {
        title: 'Page Manager Workspace',
        subtitle: 'Client management, content approval, and task delegation',
        clients: 'Client List',
        approvals: 'Pending Approvals',
        assignTask: 'Assign Task',
        approve: 'Approve Content',
        reject: 'Request Edit',
        stats: 'Performance Stats',
        active: 'Active',
        pending: 'Pending',
    }
};

export default function PageManagerPage() {
    const { language } = useUIStore();
    const isRtl = language === 'ar';
    const t = T[language as keyof typeof T] || T.en;
    
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [taskModal, setTaskModal] = useState(false);
    const [taskForm, setTaskForm] = useState({ title: '', type: 'DESIGN', priority: 'MEDIUM' });
    const [assetModal, setAssetModal] = useState(false);
    const [assetForm, setAssetForm] = useState({ colors: '', fonts: '', driveLink: '' });
    const queryClient = useQueryClient();

    const { data: clients = [], isLoading } = useQuery({
        queryKey: ['sm-clients'],
        queryFn: async () => {
            const res = await getSMClients();
            return res.data || [];
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: any) => updateSMDetails(id, { contentStatus: status }),
        onSuccess: () => {
            toast.success('Status updated');
            queryClient.invalidateQueries({ queryKey: ['sm-clients'] });
        }
    });

    const taskMutation = useMutation({
        mutationFn: () => createSMTask(selectedClient.id, taskForm as any),
        onSuccess: () => {
            toast.success('Task Assigned');
            setTaskModal(false);
            queryClient.invalidateQueries({ queryKey: ['sm-clients'] });
        }
    });

    const assetMutation = useMutation({
        mutationFn: () => updateBrandGuideline(selectedClient.id, assetForm),
        onSuccess: () => {
            toast.success('Assets Updated');
            setAssetModal(false);
            queryClient.invalidateQueries({ queryKey: ['sm-clients'] });
        }
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-inner">
                    <LayoutDashboard size={26} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t.title}</h1>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">{t.subtitle}</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card bg-white border-slate-100 p-6">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Clients</p>
                    <h4 className="text-xl font-black text-slate-900">{clients.length}</h4>
                </div>
                <div className="glass-card bg-white border-slate-100 p-6">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Content</p>
                    <h4 className="text-xl font-black text-slate-900">{clients.filter((c: any) => c.smDetails?.contentStatus === 'PENDING').length}</h4>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Client List */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t.clients}</h3>
                    <div className="space-y-3">
                        {clients.map((c: any) => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedClient(c)}
                                className={clsx(
                                    "w-full p-6 rounded-2xl border transition-all text-start group",
                                    selectedClient?.id === c.id 
                                        ? "bg-white border-indigo-500 shadow-xl shadow-indigo-500/5" 
                                        : "bg-white border-slate-100 hover:border-indigo-200"
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{c.name}</h4>
                                    <div className={clsx(
                                        "w-2 h-2 rounded-full",
                                        c.smDetails?.contentStatus === 'APPROVED' ? "bg-emerald-500" :
                                        c.smDetails?.contentStatus === 'PENDING' ? "bg-amber-500" : "bg-slate-200"
                                    )} />
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        {c.smDetails?.doneDesigns || 0}/{c.smDetails?.targetDesigns || 0} Designs
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Details & Actions */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {selectedClient ? (
                            <motion.div
                                key={selectedClient.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {/* Content Card */}
                                <div className="glass-card bg-white border-slate-100 p-8">
                                    <div className="flex justify-between items-center mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <PenTool size={18} />
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Content Preview</h4>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => updateStatusMutation.mutate({ id: selectedClient.id, status: 'REWRITE' })}
                                                className="px-5 py-2.5 rounded-xl bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-100 transition-all"
                                            >
                                                {t.reject}
                                            </button>
                                            <button 
                                                onClick={() => updateStatusMutation.mutate({ id: selectedClient.id, status: 'APPROVED' })}
                                                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                                            >
                                                {t.approve}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 min-h-[150px]">
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed italic" dir={isRtl ? 'rtl' : 'ltr'}>
                                            {selectedClient.smDetails?.content || 'No content submitted yet.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Delegation Card */}
                                <div className="glass-card bg-white border-slate-100 p-8">
                                    <div className="flex justify-between items-center mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <Target size={18} />
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Task Delegation</h4>
                                        </div>
                                        <button 
                                            onClick={() => setTaskModal(true)}
                                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-all"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {selectedClient.projects?.[0]?.tasks?.map((task: any) => (
                                            <div key={task.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    {task.title.includes('DESIGN') ? <ImageIcon size={14} className="text-blue-500" /> : <Video size={14} className="text-purple-500" />}
                                                    <span className="text-xs font-bold text-slate-700">{task.title}</span>
                                                </div>
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{task.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Asset Library Card */}
                                <div className="glass-card bg-white border-slate-100 p-8">
                                    <div className="flex justify-between items-center mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <ImageIcon size={18} />
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Asset Library (Brand Guidelines)</h4>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setAssetForm({
                                                    colors: selectedClient.brandGuideline?.colors || '',
                                                    fonts: selectedClient.brandGuideline?.fonts || '',
                                                    driveLink: selectedClient.brandGuideline?.driveLink || ''
                                                });
                                                setAssetModal(true);
                                            }}
                                            className="px-4 py-2 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-xl border border-indigo-100"
                                        >
                                            Update Assets
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Main Colors</p>
                                            <p className="text-xs font-bold text-slate-700">{selectedClient.brandGuideline?.colors || 'Not set'}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fonts</p>
                                            <p className="text-xs font-bold text-slate-700">{selectedClient.brandGuideline?.fonts || 'Not set'}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="glass-card bg-white border-dashed border-slate-200 py-32 text-center">
                                <LayoutDashboard size={48} className="mx-auto text-slate-100 mb-6" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{isRtl ? 'اختر عميلاً لمتابعة العمل' : 'Select a client to manage'}</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Task Modal */}
            <Modal open={taskModal} onClose={() => setTaskModal(false)} title={t.assignTask}>
                <div className="space-y-5 pt-2">
                    <Input label="Task Title" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
                    <Select 
                        label="Type" 
                        value={taskForm.type} 
                        onChange={e => setTaskForm({...taskForm, type: e.target.value})}
                        options={[
                            { value: 'DESIGN', label: 'Design' },
                            { value: 'VIDEO', label: 'Video' },
                        ]}
                    />
                    <Select 
                        label="Priority" 
                        value={taskForm.priority} 
                        onChange={e => setTaskForm({...taskForm, priority: e.target.value})}
                        options={[
                            { value: 'LOW', label: 'Low' },
                            { value: 'MEDIUM', label: 'Medium' },
                            { value: 'HIGH', label: 'High' },
                            { value: 'CRITICAL', label: 'Critical' },
                        ]}
                    />
                    <button 
                        onClick={() => taskMutation.mutate()}
                        className="w-full py-4 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/20 mt-4"
                    >
                        Assign Task
                    </button>
                </div>
            </Modal>

            {/* Asset Modal */}
            <Modal open={assetModal} onClose={() => setAssetModal(false)} title="Update Brand Assets">
                <div className="space-y-5 pt-2">
                    <Input label="Colors (e.g. #FF0000, #00FF00)" value={assetForm.colors} onChange={e => setAssetForm({...assetForm, colors: e.target.value})} />
                    <Input label="Fonts" value={assetForm.fonts} onChange={e => setAssetForm({...assetForm, fonts: e.target.value})} />
                    <Input label="Drive Link" value={assetForm.driveLink} onChange={e => setAssetForm({...assetForm, driveLink: e.target.value})} />
                    <button 
                        onClick={() => assetMutation.mutate()}
                        className="w-full py-4 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/20 mt-4"
                    >
                        Save Assets
                    </button>
                </div>
            </Modal>
        </div>
    );
}
