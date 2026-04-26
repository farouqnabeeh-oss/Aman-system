import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Search, Folder, Trash2, FileText, Image, FileArchive, Film, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../../lib/axios';
import { useUIStore } from '@/store/ui.store';
import { PageHeader } from '../../../components/ui/States';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Pagination } from '../../../components/ui/Table';
import toast from 'react-hot-toast';

const TRANSLATIONS = {
  ar: {
    files: 'مستودع الوثائق',
    filesSub: 'تخزين وإدارة ملفات المؤسسة بأمان عالي',
    search: 'بحث في المستودع...',
    upload: 'رفع ملفات جديدة',
    folders: 'المجلدات الرئيسية',
    empty: 'لا توجد ملفات حالياً',
    delete: 'حذف النهائياً',
    view: 'عرض الملف',
  },
  en: {
    files: 'Document Hub',
    filesSub: 'Secure storage and management of enterprise assets',
    search: 'Search repository...',
    upload: 'Upload Assets',
    folders: 'Active Folders',
    empty: 'No assets found',
    delete: 'Terminate Asset',
    view: 'Preview',
  }
};

function fileIcon(mime: string) {
  if (mime.startsWith('image/')) return <Image className="w-5 h-5 text-indigo-400" />;
  if (mime.startsWith('video/')) return <Film className="w-5 h-5 text-amber-400" />;
  if (mime.includes('zip') || mime.includes('rar')) return <FileArchive className="w-5 h-5 text-teal-400" />;
  return <FileText className="w-5 h-5 text-slate-500" />;
}

function formatSize(bytes: number) {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

export function FilesPage() {
  const qc = useQueryClient();
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const t = TRANSLATIONS[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('/');

  const { data: foldersData } = useQuery({
    queryKey: ['file-folders'],
    queryFn: () => api.get<any>('/files/folders').then(r => r.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['files', page, search, folder],
    queryFn: () => api.get<any>('/files', { params: { page, limit: 12, search: search || undefined, folderPath: folder } }).then(r => r.data.data),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folderPath', folder);
      return api.post('/files/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['files'], refetchType: 'all' });
      qc.invalidateQueries({ queryKey: ['file-folders'], refetchType: 'all' });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['audit-logs'] });
      toast.dismiss('upload-toast');
      toast.success(isRtl ? 'تم رفع الملف بنجاح' : 'File Uploaded Successfully'); 
    },
    onError: (err: any) => {
      toast.dismiss('upload-toast');
      const msg = err.response?.data?.message || (isRtl ? 'فشل رفع الملف' : 'Upload Failed');
      toast.error(msg);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/files/${id}`),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['files'] }); 
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['audit-logs'] });
      toast.success(isRtl ? 'تم الحذف' : 'Terminated'); 
    },
  });

  const files = data?.items ?? [];
  const folders = foldersData ?? ['/'];

  return (
    <div className="space-y-12">
      <PageHeader
        title={t.files}
        description={t.filesSub}
        action={
          <>
            <input 
              ref={fileInputRef} 
              type="file" 
              multiple 
              className="hidden" 
              onChange={e => {
                const files = Array.from(e.target.files||[]);
                if(files.length > 0) {
                  toast.loading(isRtl ? 'جاري الرفع...' : 'Uploading Asset...', { id: 'upload-toast' });
                  files.forEach(f => uploadMutation.mutate(f));
                }
              }} 
            />
            <button onClick={() => fileInputRef.current?.click()} className="clean-btn-primary h-12 gap-2 text-xs uppercase tracking-widest bg-sky-500 shadow-sky-500/20"><Upload size={16} /> {t.upload}</button>
          </>
        }
      />

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Folders */}
        <div className="w-full lg:w-64 space-y-8">
           <h3 className="text-[10px] font-black text-sky-400 uppercase tracking-widest px-2">{t.folders}</h3>
           <div className="space-y-2">
              {folders.map((f:any) => (
                <button
                  key={f}
                  onClick={() => setFolder(f)}
                  className={clsx('flex items-center gap-4 w-full px-4 py-3 rounded-2xl text-sm font-bold transition-all', folder === f ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-500 hover:text-white hover:bg-sky-500/10')}
                >
                  <Folder size={16} className={folder === f ? 'text-white' : 'text-sky-500'} />
                  <span className="truncate">{f === '/' ? (isRtl ? 'الرئيسية' : 'Root') : f.replace('/','')}</span>
                </button>
              ))}
           </div>
        </div>

        {/* Main View */}
        <div className="flex-1 space-y-8">
           <div className="flex items-center gap-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl px-5 py-3 focus-within:border-sky-500/30 transition-all">
              <Search size={16} className="text-sky-500" />
              <input value={search} onChange={e => {setSearch(e.target.value); setPage(1);}} placeholder={t.search} className="bg-transparent text-sm text-white outline-none w-full font-medium" />
           </div>

           {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-40 rounded-3xl" />)}
              </div>
           ) : files.length === 0 ? (
              <div className="py-32 flex flex-col items-center gap-6">
                 <div className="w-20 h-20 rounded-[2.5rem] bg-sky-500/5 border border-sky-500/10 flex items-center justify-center text-sky-500"><Folder size={32} /></div>
                 <p className="text-xs font-black text-slate-600 uppercase tracking-widest">{t.empty}</p>
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                 {files.map((file: any) => (
                   <div key={file.id} className="clean-card group !p-6 hover:bg-sky-500/[0.02] border-sky-500/5 hover:border-sky-500/20">
                      <div className="flex justify-between items-start mb-6">
                         <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/10">{fileIcon(file.mimeType)}</div>
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a href={file.publicUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-sky-500/10 text-slate-500 hover:text-sky-400 transition-all"><ExternalLink size={14}/></a>
                            <button onClick={() => {if(confirm(isRtl ? 'هل أنت متأكد من الحذف؟' : 'Terminate Asset?')) deleteMutation.mutate(file.id)}} className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition-all"><Trash2 size={14}/></button>
                         </div>
                      </div>
                      <div className="min-w-0 mb-4">
                         <p className="text-sm font-bold text-white truncate" title={file.originalName}>{file.originalName}</p>
                         <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">{formatSize(file.sizeBytes)}</p>
                      </div>
                      <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                         <div className="w-5 h-5 rounded-lg bg-sky-500/10 flex items-center justify-center text-[8px] font-black text-sky-400">{file.uploadedBy?.firstName?.[0]}</div>
                         <span className="text-[10px] font-bold text-slate-500 truncate">{file.uploadedBy?.firstName}</span>
                         <span className="ml-auto text-[9px] font-black text-slate-700 uppercase">{new Date(file.createdAt).toLocaleDateString(language)}</span>
                      </div>
                   </div>
                 ))}
              </div>
           )}
           {data?.meta && data.meta.totalPages > 1 && <Pagination page={page} totalPages={data.meta.totalPages} total={data.meta.total} limit={data.meta.limit} onPage={setPage} />}
        </div>
      </div>
    </div>
  );
}
