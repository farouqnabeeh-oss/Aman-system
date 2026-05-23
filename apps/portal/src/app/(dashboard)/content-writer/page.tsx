'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    PenTool, Sparkles, CheckSquare, Save, Upload, Download, FileText, Image as ImageIcon, Trash2, Loader2
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { getSMClients, updateSMDetails } from '@/lib/actions/social-media';
import { getFiles, deleteFile } from '@/lib/actions/files';
import { processAIContent } from '@/lib/actions/ai';
import { RestrictedAccess } from '@/components/ui/RestrictedAccess';

const T = {
    ar: {
        title: 'مساحة الكاتب',
        subtitle: 'إدارة وتطوير المحتوى للمصالح التجارية',
        clientName: 'اسم المصلحة',
        content: 'المحتوى',
        status: 'الحالة',
        aiHelper: 'مساعد الذكاء الاصطناعي',
        save: 'حفظ التعديلات',
        saving: 'جاري الحفظ...',
        statusOptions: {
            PENDING: 'قيد المراجعة',
            DONE: 'تم التنفيذ',
            NEEDS_EDIT: 'يحتاج تعديل',
            USED: 'تم استخدامه'
        },
        aiOptions: {
            HOOK: 'مقدمة جذابة',
            EXPAND: 'توسيع المحتوى',
            REWRITE: 'تصحيح لغوي'
        }
    },
    en: {
        title: 'Content Workspace',
        subtitle: 'Manage and develop content for businesses',
        clientName: 'Business Name',
        content: 'Content',
        status: 'Status',
        aiHelper: 'AI Assistant',
        save: 'Save Changes',
        saving: 'Saving...',
        statusOptions: {
            PENDING: 'Pending Review',
            DONE: 'Done / Implemented',
            NEEDS_EDIT: 'Needs Edit',
            USED: 'Used'
        },
        aiOptions: {
            HOOK: 'Gen Hook',
            EXPAND: 'Expand',
            REWRITE: 'Fix Grammar'
        }
    }
};

export default function ContentWriterPage() {
    const { language } = useUIStore();
    const isRtl = language === 'ar';
    const t = T[language as keyof typeof T] || T.en;
    const user = useAuthStore(s => s.user);
    
    // Who can edit content
    const isManagerOrAdmin = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user?.role || '');
    const isWriterOrPageManager = ['CONTENT_WRITER', 'WRITER', 'كاتب محتوى', 'PAGE_MANAGER', 'MODERATOR', 'مدير صفحات'].includes(user?.position || '');
    const canEditContent = isManagerOrAdmin || isWriterOrPageManager;

    const queryClient = useQueryClient();
    const [localContent, setLocalContent] = useState<Record<string, string>>({});
    const [processingAI, setProcessingAI] = useState<string | null>(null);
    const [uploadingId, setUploadingId] = useState<string | null>(null);

    const { data: clients = [], isLoading } = useQuery({
        queryKey: ['sm-clients'],
        queryFn: async () => {
            const res = await getSMClients();
            return res.data || [];
        }
    });

    const { data: allFiles = [] } = useQuery({
        queryKey: ['files'],
        queryFn: async () => {
            const res = await getFiles();
            return res.data || [];
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => updateSMDetails(id, data),
        onSuccess: () => {
            toast.success(isRtl ? 'تم الحفظ بنجاح' : 'Saved successfully');
            queryClient.invalidateQueries({ queryKey: ['sm-clients'] });
        }
    });

    const handleContentChange = (clientId: string, value: string) => {
        setLocalContent(prev => ({ ...prev, [clientId]: value }));
    };

    const handleSaveContent = (client: any) => {
        const contentToSave = localContent[client.id] !== undefined ? localContent[client.id] : (client.smDetails?.content || '');
        updateMutation.mutate({ id: client.id, data: { content: contentToSave } });
    };

    const handleStatusChange = (client: any, newStatus: string) => {
        updateMutation.mutate({ id: client.id, data: { contentStatus: newStatus } });
    };

    const handleAIAction = async (client: any, action: 'HOOK' | 'EXPAND' | 'REWRITE') => {
        const currentContent = localContent[client.id] !== undefined ? localContent[client.id] : (client.smDetails?.content || '');
        if (!currentContent) return toast.error(isRtl ? 'يرجى إدخال نص أولاً' : 'Please enter content first');
        
        setProcessingAI(client.id);
        try {
            const res = await processAIContent(currentContent, action, 'professional');
            if (res.success && res.data) {
                setLocalContent(prev => ({ ...prev, [client.id]: res.data }));
                toast.success(isRtl ? 'تم تطبيق سحر الذكاء الاصطناعي!' : 'AI magic applied!');
            } else {
                toast.error(res.message || 'AI processing failed');
            }
        } catch (err) {
            toast.error('AI processing failed');
        } finally {
            setProcessingAI(null);
        }
    };

    const handleUploadAsset = async (clientId: string, file: File) => {
        setUploadingId(clientId);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('entityType', 'CLIENT');
            fd.append('entityId', clientId);
            fd.append('visibility', 'PUBLIC');

            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            const json = await res.json();
            if (json.success) {
                toast.success(isRtl ? 'تم رفع الملف بنجاح' : 'Asset uploaded');
                queryClient.invalidateQueries({ queryKey: ['files'] });
            } else {
                toast.error(json.message || 'Upload failed');
            }
        } catch (err) {
            toast.error('Upload failed');
        } finally {
            setUploadingId(null);
        }
    };

    const handleDeleteAsset = async (fileId: string) => {
        if (!confirm(isRtl ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?')) return;
        const res = await deleteFile(fileId);
        if (res.success) {
            toast.success('Asset deleted');
            queryClient.invalidateQueries({ queryKey: ['files'] });
        } else {
            toast.error('Delete failed');
        }
    };

    const statusColors: Record<string, string> = {
        PENDING: 'bg-amber-50 text-amber-600 border-amber-200',
        DONE: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        NEEDS_EDIT: 'bg-rose-50 text-rose-600 border-rose-200',
        USED: 'bg-blue-50 text-blue-600 border-blue-200'
    };

    return (
        <RestrictedAccess positions={['CONTENT_WRITER', 'WRITER', 'كاتب محتوى']}>
        <div className="space-y-8">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500 shadow-inner">
                    <PenTool size={26} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t.title}</h1>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">{t.subtitle}</p>
                </div>
            </div>

            <div className="glass-card !p-0 overflow-hidden border-slate-100 bg-white shadow-sm">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/4" style={{textAlign: isRtl ? 'right' : 'left'}}>{t.clientName}</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/2" style={{textAlign: isRtl ? 'right' : 'left'}}>{t.content}</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/4" style={{textAlign: isRtl ? 'right' : 'left'}}>{t.status}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={3} className="px-6 py-6"><div className="h-20 bg-slate-50 rounded-xl animate-pulse" /></td></tr>)
                            ) : clients.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-20 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">No Clients Found</td>
                                </tr>
                            ) : clients.map((c: any) => {
                                const status = c.smDetails?.contentStatus || 'PENDING';
                                const contentValue = localContent[c.id] !== undefined ? localContent[c.id] : (c.smDetails?.content || '');
                                
                                return (
                                    <tr key={c.id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-6 py-6 align-top">
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{c.name}</p>
                                        </td>
                                        
                                        <td className="px-6 py-6">
                                            <div className="space-y-3">
                                                <textarea
                                                    value={contentValue}
                                                    onChange={e => handleContentChange(c.id, e.target.value)}
                                                    disabled={!canEditContent}
                                                    placeholder={isRtl ? 'اكتب المحتوى هنا...' : 'Write content here...'}
                                                    dir={isRtl ? 'rtl' : 'ltr'}
                                                    className="w-full min-h-[140px] p-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand/40 focus:ring-4 focus:ring-brand/5 resize-y transition-all disabled:opacity-70 disabled:bg-slate-50 leading-relaxed shadow-inner"
                                                />
                                                
                                                {canEditContent && (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="relative group/ai">
                                                                <button disabled={processingAI === c.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-50 border border-pink-100 text-[10px] font-black text-pink-600 hover:bg-pink-100 transition-all shadow-sm">
                                                                    <Sparkles size={12} /> {processingAI === c.id ? '...' : 'AI'}
                                                                </button>
                                                                
                                                                <div className="absolute top-full mt-2 left-0 w-32 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover/ai:opacity-100 group-hover/ai:visible transition-all z-10 flex flex-col overflow-hidden">
                                                                    <button onClick={() => handleAIAction(c, 'HOOK')} className="px-3 py-2 text-start text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:text-pink-600">{t.aiOptions.HOOK}</button>
                                                                    <button onClick={() => handleAIAction(c, 'EXPAND')} className="px-3 py-2 text-start text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:text-pink-600 border-t border-slate-50">{t.aiOptions.EXPAND}</button>
                                                                    <button onClick={() => handleAIAction(c, 'REWRITE')} className="px-3 py-2 text-start text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:text-pink-600 border-t border-slate-50">{t.aiOptions.REWRITE}</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <button
                                                            onClick={() => handleSaveContent(c)}
                                                            disabled={updateMutation.isPending || contentValue === (c.smDetails?.content || '')}
                                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md disabled:opacity-50 disabled:pointer-events-none"
                                                        >
                                                            <Save size={12} /> {t.save}
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Assets Section */}
                                                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            {isRtl ? 'ملفات ومرفقات المصلحة' : 'Client Assets & Drafts'}
                                                        </span>
                                                        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-50 border border-pink-100 text-[9px] font-black text-pink-600 hover:bg-pink-100 transition-all shadow-sm cursor-pointer">
                                                            {uploadingId === c.id ? (
                                                                <Loader2 size={12} className="animate-spin" />
                                                            ) : (
                                                                <Upload size={12} />
                                                            )}
                                                            {isRtl ? 'رفع ملف' : 'Upload File'}
                                                            <input 
                                                                type="file" 
                                                                className="hidden" 
                                                                disabled={uploadingId === c.id}
                                                                onChange={(e) => {
                                                                    if (e.target.files?.[0]) {
                                                                        handleUploadAsset(c.id, e.target.files[0]);
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                    </div>
                                                    
                                                    {/* Files list */}
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {allFiles.filter((f: any) => f.entityType === 'CLIENT' && f.entityId === c.id).map((file: any) => (
                                                            <div key={file.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 group/file">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    {file.mimeType?.startsWith('image/') ? (
                                                                        <ImageIcon size={14} className="text-pink-400 flex-shrink-0" />
                                                                    ) : (
                                                                        <FileText size={14} className="text-slate-400 flex-shrink-0" />
                                                                    )}
                                                                    <span className="text-[10px] font-bold text-slate-700 truncate" title={file.name}>
                                                                        {file.name}
                                                                    </span>
                                                                </div>
                                                                <div className="flex gap-1 opacity-0 group-hover/file:opacity-100 transition-opacity">
                                                                    {file.publicUrl && (
                                                                        <a href={file.publicUrl} download target="_blank" className="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:text-brand">
                                                                            <Download size={10} />
                                                                        </a>
                                                                    )}
                                                                    <button onClick={() => handleDeleteAsset(file.id)} className="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:text-rose-500">
                                                                        <Trash2 size={10} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {allFiles.filter((f: any) => f.entityType === 'CLIENT' && f.entityId === c.id).length === 0 && (
                                                            <p className="text-[9px] text-slate-300 italic col-span-2">
                                                                {isRtl ? 'لا توجد ملفات مرفقة' : 'No attached assets'}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-6 align-top">
                                            <div className="space-y-2">
                                                {Object.entries(t.statusOptions).map(([val, label]) => (
                                                    <label key={val} className={clsx(
                                                        "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                                        status === val ? statusColors[val] : "bg-white border-slate-200 hover:bg-slate-50 text-slate-500"
                                                    )}>
                                                        <input 
                                                            type="radio" 
                                                            name={`status-${c.id}`} 
                                                            value={val} 
                                                            checked={status === val}
                                                            onChange={() => handleStatusChange(c, val)}
                                                            className="hidden"
                                                        />
                                                        <div className={clsx(
                                                            "w-4 h-4 rounded flex items-center justify-center border transition-all",
                                                            status === val ? "bg-current border-transparent text-white" : "border-slate-300"
                                                        )}>
                                                            {status === val && <CheckSquare size={10} className="text-white" />}
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </RestrictedAccess>
    );
}

