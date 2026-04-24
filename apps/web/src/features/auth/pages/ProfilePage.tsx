import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/auth.store';
import { useUIStore } from '@/store/ui.store';
import api from '../../../lib/axios';
import { 
  Mail, Phone, Building, Fingerprint, 
  Edit3, User, Briefcase, Key, Camera,
  CheckCircle2, Target, Zap, Clock, ShieldCheck, Lock
} from 'lucide-react';
import { PageHeader } from '../../../components/ui/States';
import { roleBadge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const TRANSLATIONS = {
   ar: {
      title: 'إدارة الهوية الرقمية',
      subtitle: 'الملف الاستراتيجي وصلاحيات الوصول المتقدمة',
      personal: 'البيانات الشخصية',
      stats: 'مؤشرات الأداء',
      security: 'الأمن والوصول',
      email: 'البريد المؤسسي',
      phone: 'الاتصال المؤمن',
      dept: 'القسم العملياتي',
      role: 'بروتوكول الوصول',
      pos: 'المسمى الوظيفي',
      tasks: 'مهام مكتملة',
      projects: 'مشاريع نشطة',
      efficiency: 'كفاءة الأداء',
      edit: 'تحديث الهوية',
      save: 'حفظ التغييرات',
      cancel: 'إلغاء',
      avatar: 'تغيير الصورة',
      notSet: 'غير محدد',
   },
   en: {
      title: 'Digital Identity',
      subtitle: 'Strategic profile and advanced access protocols',
      personal: 'Personal Intelligence',
      stats: 'Performance Metrics',
      security: 'Security & Access',
      email: 'Enterprise Email',
      phone: 'Secure Line',
      dept: 'Operational Dept',
      role: 'Access Protocol',
      pos: 'Strategic Title',
      tasks: 'Completed Assets',
      projects: 'Active Streams',
      efficiency: 'Execution Velocity',
      edit: 'Update Identity',
      save: 'Apply Changes',
      cancel: 'Abort',
      avatar: 'Update Avatar',
      notSet: 'Not Set',
   }
};

export function ProfilePage() {
   const user = useAuthStore((s) => s.user);
   const updateUser = useAuthStore((s) => s.updateUser);
   const { language } = useUIStore();
   const qc = useQueryClient();
   const isRtl = language === 'ar';
   const t = TRANSLATIONS[language];
   const fileInputRef = useRef<HTMLInputElement>(null);

   const [editOpen, setEditOpen] = useState(false);
   const [form, setForm] = useState({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      position: user?.position || '',
      password: '',
   });

   const { data: profile, isLoading } = useQuery({
      queryKey: ['me'],
      queryFn: () => api.get<any>('/auth/me').then((r) => r.data.data),
   });

   const updateMutation = useMutation({
      mutationFn: (dto: any) => {
         const payload = { ...dto };
         if (!payload.password) delete payload.password;
         return api.patch(`/users/${user?.id}`, payload);
      },
      onSuccess: (res) => {
         updateUser(res.data.data);
         qc.invalidateQueries({ queryKey: ['me'] });
         setEditOpen(false);
         toast.success(isRtl ? 'تم تحديث السجلات' : 'Identity Synced');
      }
   });

   const uploadAvatar = useMutation({
      mutationFn: async (file: File) => {
         const fd = new FormData();
         fd.append('file', file);
         return api.post('/files/upload', fd);
      },
      onSuccess: async (res) => {
         const url = res.data.data.url;
         await api.patch(`/users/${user?.id}`, { avatarUrl: url });
         qc.invalidateQueries({ queryKey: ['me'] });
         toast.success(isRtl ? 'تم تحديث الصورة' : 'Avatar Deployed');
      },
      onError: () => {
         toast.error(isRtl ? 'فشل رفع الصورة' : 'Upload Failed');
      }
   });

   const stats = [
      { label: t.tasks, value: '24', icon: CheckCircle2, color: 'text-emerald-400' },
      { label: t.projects, value: '06', icon: Target, color: 'text-blue-400' },
      { label: t.efficiency, value: '98%', icon: Zap, color: 'text-amber-400' },
   ];

   if (isLoading) return <div className="space-y-8"><Skeleton className="h-64 rounded-3xl" /><div className="grid grid-cols-3 gap-6"><Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /></div></div>;

   return (
      <div className="space-y-10 max-w-6xl pb-20">
         <PageHeader title={t.title} description={t.subtitle} />

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1 space-y-8">
               <div className="clean-card group overflow-hidden relative">
                  <div className="h-32 bg-gradient-to-br from-sky-500/20 via-blue-600/10 to-transparent absolute inset-x-0 top-0" />
                  <div className="relative pt-10 flex flex-col items-center text-center">
                     <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-slate-900 border-4 border-background shadow-2xl overflow-hidden">
                           {profile?.avatarUrl ? (
                              <img src={profile.avatarUrl} className="w-full h-full object-cover" />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl font-black bg-gradient-to-br from-sky-500 to-blue-600 text-white">
                                 {profile?.firstName[0]}{profile?.lastName[0]}
                              </div>
                           )}
                        </div>
                        <button 
                           onClick={() => fileInputRef.current?.click()}
                           className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-sky-500 text-white shadow-xl hover:scale-110 active:scale-95 transition-all"
                        >
                           <Camera size={16} />
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files?.[0] && uploadAvatar.mutate(e.target.files[0])} />
                     </div>

                     <h2 className="text-2xl font-black text-white">{profile?.firstName} {profile?.lastName}</h2>
                     <p className="text-xs font-black text-sky-400 uppercase tracking-widest mt-2">{profile?.position || t.pos}</p>
                     
                     <div className="mt-8 w-full space-y-3">
                        {roleBadge(profile?.role)}
                        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                           <Clock size={12} /> {isRtl ? 'منذ' : 'Member since'} {new Date(profile?.createdAt || Date.now()).getFullYear()}
                        </div>
                     </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-white/5 space-y-4">
                     <button onClick={() => setEditOpen(true)} className="w-full clean-btn-primary h-12 gap-2 text-[10px] uppercase tracking-widest">
                        <Edit3 size={14} /> {t.edit}
                     </button>
                  </div>
               </div>

               <div className="clean-card bg-sky-500/5 border-sky-500/10">
                  <h3 className="text-xs font-black text-sky-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                     <ShieldCheck size={14} /> {t.security}
                  </h3>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-3">
                           <Lock size={14} className="text-slate-500" />
                           <span className="text-[10px] font-bold text-white uppercase">{isRtl ? 'المصادقة الثنائية' : 'Two-Factor'}</span>
                        </div>
                        <div className="w-10 h-5 rounded-full bg-slate-800 relative cursor-pointer"><div className="w-3 h-3 rounded-full bg-slate-600 absolute left-1 top-1" /></div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Stats & Info */}
            <div className="lg:col-span-2 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stats.map(s => (
                     <div key={s.label} className="clean-card flex flex-col items-center justify-center text-center p-8 group hover:bg-sky-500/[0.02] transition-all">
                        <div className={clsx("p-4 rounded-2xl bg-white/5 mb-4 group-hover:scale-110 transition-transform", s.color)}>
                           <s.icon size={24} />
                        </div>
                        <span className="text-3xl font-black text-white mb-1">{s.value}</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</span>
                     </div>
                  ))}
               </div>

               <div className="clean-card !p-10">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10 pb-4 border-b border-white/5">
                     {t.personal}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><Mail size={12}/> {t.email}</label>
                        <p className="text-sm font-bold text-white truncate">{profile?.email}</p>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><Phone size={12}/> {t.phone}</label>
                        <p className="text-sm font-bold text-white">{profile?.phone || t.notSet}</p>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><Building size={12}/> {t.dept}</label>
                        <p className="text-sm font-bold text-white">{profile?.department || t.notSet}</p>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><Fingerprint size={12}/> ID Token</label>
                        <p className="text-[11px] font-mono text-slate-500 truncate">{profile?.id}</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <Modal open={editOpen} onClose={() => setEditOpen(false)} title={t.edit}>
            <div className="space-y-8 pt-4">
               <div className="grid grid-cols-2 gap-6">
                  <Input label={isRtl ? 'الاسم الأول' : 'First Name'} icon={User} value={form.firstName} onChange={(e: any) => setForm(f => ({ ...f, firstName: e.target.value }))} />
                  <Input label={isRtl ? 'الاسم الأخير' : 'Last Name'} icon={User} value={form.lastName} onChange={(e: any) => setForm(f => ({ ...f, lastName: e.target.value }))} />
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <Input label={t.phone} icon={Phone} value={form.phone} onChange={(e: any) => setForm(f => ({ ...f, phone: e.target.value }))} />
                  <Input label={t.pos} icon={Briefcase} value={form.position} onChange={(e: any) => setForm(f => ({ ...f, position: e.target.value }))} />
               </div>
               <Input label={isRtl ? 'كلمة المرور' : 'Cipher Access'} icon={Key} type="password" value={form.password} onChange={(e: any) => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
               
               <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
                  <button className="clean-btn-secondary px-10 h-12" onClick={() => setEditOpen(false)}>{t.cancel}</button>
                  <button className="clean-btn-primary px-10 h-12" onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending}>{t.save}</button>
               </div>
            </div>
         </Modal>
      </div>
   );
}
