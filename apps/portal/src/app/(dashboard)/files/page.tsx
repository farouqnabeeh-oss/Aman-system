'use client';

import { useState } from 'react';
import { 
    File as FileIcon, Upload, Search, Trash2, 
    Download, ExternalLink, Filter, Folder,
    FileText, FileImage, FileVideo, FileCode, MoreVertical
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFiles, deleteFile, uploadFileMetadata } from '@/lib/actions/files';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const T = {
  ar: {
    title: 'إدارة الملفات', sub: 'نظام تخزين مركزي للملفات والوثائق',
    search: 'بحث في الملفات...', upload: 'رفع ملف جديد',
    total: 'إجمالي الملفات', storage: 'المساحة المستخدمة',
    name: 'اسم الملف', type: 'النوع', size: 'الحجم',
    uploadedBy: 'تم الرفع بواسطة', date: 'التاريخ',
    noFiles: 'لا يوجد ملفات حالياً', deleteConfirm: 'هل أنت متأكد من الحذف؟',
  },
  en: {
    title: 'File Manager', sub: 'Centralized file and document storage system',
    search: 'Search files...', upload: 'Upload New File',
    total: 'Total Files', storage: 'Storage Used',
    name: 'File Name', type: 'Type', size: 'Size',
    uploadedBy: 'Uploaded By', date: 'Date',
    noFiles: 'No files found', deleteConfirm: 'Are you sure you want to delete this?',
  }
};

const getFileIcon = (type: string) => {
    if (type.includes('image')) return <FileImage className="text-emerald-400" size={24} />;
    if (type.includes('video')) return <FileVideo className="text-amber-400" size={24} />;
    if (type.includes('pdf') || type.includes('word')) return <FileText className="text-blue-400" size={24} />;
    if (type.includes('code') || type.includes('javascript') || type.includes('json')) return <FileCode className="text-purple-400" size={24} />;
    return <FileIcon className="text-slate-400" size={24} />;
};

const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.04 } } };

export default function FilesPage() {
    const { language } = useUIStore();
    const t = T[language as keyof typeof T] || T.en;
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: files = [], isLoading } = useQuery({
        queryKey: ['files'],
        queryFn: async () => {
            const res = await getFiles();
            return res.data || [];
        }
    });

    const handleDelete = async (id: string) => {
        if (!confirm(t.deleteConfirm)) return;
        const res = await deleteFile(id);
        if (res.success) {
            toast.success('File removed');
            queryClient.invalidateQueries({ queryKey: ['files'] });
        }
    };

    const filtered = files.filter((f: any) => 
        f.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
            <PageHeader 
                title={t.title} 
                description={t.sub}
                action={
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand/90 transition-all shadow-lg shadow-brand/10"
                    >
                        <Upload size={14} /> {t.upload}
                    </button>
                }
            />

            <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label={t.total} value={files.length} icon={<Folder size={18} />} />
                <StatCard label={t.storage} value="4.2 GB" icon={<Upload size={18} />} trend="up" delta="Live" />
                <StatCard label="Recent Uploads" value={files.filter((f:any) => new Date(f.createdAt).toDateString() === new Date().toDateString()).length} icon={<FileIcon size={18} />} />
            </motion.div>

            <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[280px] flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus-within:border-brand/40 transition-all shadow-sm">
                    <Search size={18} className="text-slate-400" />
                    <input 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        placeholder={t.search} 
                        className="bg-transparent text-sm text-slate-900 outline-none w-full font-medium placeholder:text-slate-400" 
                    />
                </div>
            </motion.div>

            <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {isLoading ? (
                    Array(8).fill(0).map((_, i) => (
                        <div key={i} className="glass-card h-40 animate-pulse bg-slate-50 border-slate-100" />
                    ))
                ) : filtered.length === 0 ? (
                    <div className="col-span-full py-20 text-center glass-card border-dashed border-slate-200 bg-white shadow-sm">
                        <FileIcon size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.noFiles}</p>
                    </div>
                ) : filtered.map((file: any) => (
                    <motion.div 
                        key={file.id} 
                        variants={fadeIn} 
                        className="glass-card group !p-5 border-slate-100 bg-white hover:bg-slate-50 hover:border-brand/20 transition-all relative overflow-hidden shadow-sm"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-600">
                                {getFileIcon(file.mimeType)}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <a href={file.publicUrl || '#'} target="_blank" className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:text-brand hover:bg-brand/5 border border-slate-200">
                                    <Download size={14} />
                                </a>
                                <button onClick={() => handleDelete(file.id)} className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-200">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <p className="text-sm font-black text-slate-900 truncate pr-6 uppercase tracking-tight" title={file.name}>{file.name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {formatSize(file.sizeBytes)} · {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                            </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md bg-brand/10 text-brand border border-brand/20 flex items-center justify-center text-[8px] font-black">
                                    {file.uploadedBy?.firstName?.[0]}
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight truncate max-w-[100px]">
                                    {file.uploadedBy?.firstName} {file.uploadedBy?.lastName}
                                </span>
                            </div>
                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                                {new Date(file.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={t.upload}>
                <div className="space-y-5 pt-2">
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50 group hover:border-brand/30 hover:bg-brand/5 transition-all cursor-pointer">
                        <Upload size={32} className="text-slate-300 group-hover:text-brand mb-4 transition-colors" />
                        <p className="text-[10px] font-black text-slate-400 group-hover:text-brand uppercase tracking-widest text-center transition-colors">
                            Click or drag to deploy assets
                        </p>
                    </div>
                    <Input label={t.name} placeholder="File name override" />
                    <Select 
                        label="Link to Project" 
                        options={[]} 
                        placeholder="Select project (Optional)"
                    />
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                        <button className="px-6 py-3 rounded-xl bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="px-10 py-3 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand/90 transition-all shadow-lg shadow-brand/20">
                            Confirm Upload
                        </button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}
