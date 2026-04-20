import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/auth.store';
import { useUIStore } from '@/store/ui.store';
import api from '../../../lib/axios';
import { Mail, Phone, Shield, Building, Globe, Fingerprint, Calendar, Edit3, User, Briefcase, Key, Image as ImageIcon } from 'lucide-react';
import { PageHeader } from '../../../components/ui/States';
import { roleBadge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import toast from 'react-hot-toast';

const TRANSLATIONS = {
   ar: {
      title: 'الملف الشخصي الاستراتيجي',
      subtitle: 'إدارة الهوية الرقمية وصلاحيات النظام المتقدمة',
      email: 'البريد الإلكتروني للقيادة',
      phone: 'رقم الاتصال الآمن',
      dept: 'القسم العملياتي',
      role: 'مستوى الوصول',
      status: 'الحالة النظامية',
      verified: 'الهوية الموثقة',
      since: 'تاريخ الانتشار',
      notSet: 'غير مفعل',
      edit: 'تعديل البيانات الآمنة',
      save: 'تحديث السجلات',
      cancel: 'إلغاء',
      firstName: 'الاسم الأول',
      lastName: 'الاسم الأخير',
      position: 'المسمى الوظيفي',
      password: 'كلمة مرور جديدة (اتركه فارغاً للحفاظ على الحالية)',
      avatarUrl: 'رابط الصورة الشخصية',
   },
   en: {
      title: 'Strategic Profile',
      subtitle: 'Manage digital identity and high-level system protocols',
      email: 'Command Email',
      phone: 'Secure Contact',
      dept: 'Operational Division',
      role: 'Access Protocol',
      status: 'System State',
      verified: 'Identity Logic',
      since: 'Deployment Date',
      notSet: 'Not Initialized',
      edit: 'Modify Secure Identity',
      save: 'Update Record',
      cancel: 'Abort',
      firstName: 'First Name',
      lastName: 'Last Name',
      position: 'Operational Title',
      password: 'New Access Cipher (Empty to keep current)',
      avatarUrl: 'Avatar Resource URL',
   }
};

export function ProfilePage() {
   const user = useAuthStore((s) => s.user);
   const updateUser = useAuthStore((s) => s.updateUser);
   const { language } = useUIStore();
   const qc = useQueryClient();
   const isRtl = language === 'ar';
   const t = TRANSLATIONS[language];

   const [editOpen, setEditOpen] = useState(false);
   const [form, setForm] = useState({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      position: user?.position || '',
      password: '',
      avatarUrl: user?.avatarUrl || '',
   });

   const { data, isLoading } = useQuery({
      queryKey: ['me'],
      queryFn: () => api.get<any>('/auth/me').then((r) => r.data.data),
   });

   const updateMutation = useMutation({
      mutationFn: (dto: any) => {
         // Don't send empty password
         const payload = { ...dto };
         if (!payload.password) delete payload.password;
         return api.patch(`/users/${user?.id}`, payload);
      },
      onSuccess: (res) => {
         const updatedUserData = res.data.data;
         updateUser(updatedUserData);
         qc.invalidateQueries({ queryKey: ['me'] });
         setEditOpen(false);
         setForm(f => ({ ...f, password: '' })); // Clear password
         toast.success(isRtl ? 'تم تحديث السجل بنجاح' : 'Identity Record Synchronized');
      },
      onError: () => {
         toast.error(isRtl ? 'فشل التحديث - تأكد من الصلاحيات' : 'Synchronization Failed');
      }
   });

   const profile = data ?? user;

   const infoGrid = [
      { icon: Mail, label: t.email, value: profile?.email },
      { icon: Phone, label: t.phone, value: profile?.phone ?? t.notSet },
      { icon: Building, label: t.dept, value: profile?.department ?? t.notSet },
      { icon: Shield, label: t.role, value: profile?.role?.replace('_', ' ') },
      { icon: Fingerprint, label: t.status, value: profile?.status },
      { icon: Globe, label: t.verified, value: profile?.emailVerified ? 'Encrypted' : 'Standard' },
   ];

   const handleOpenEdit = () => {
      setForm({
         firstName: profile?.firstName || '',
         lastName: profile?.lastName || '',
         phone: profile?.phone || '',
         position: profile?.position || '',
         password: '',
         avatarUrl: profile?.avatarUrl || '',
      });
      setEditOpen(true);
   };

   return (
      <div className="space-y-12 max-w-5xl">
         <PageHeader
            title={t.title}
            description={t.subtitle}
            action={
               <button
                  onClick={handleOpenEdit}
                  className="clean-btn-primary h-12 gap-2 text-[10px] uppercase tracking-widest"
               >
                  <Edit3 size={16} /> {t.edit}
               </button>
            }
         />

         {isLoading ? (
            <Skeleton className="h-[500px] rounded-[3rem]" />
         ) : (
            <div className="clean-card !p-12 relative overflow-hidden">
               <div className="flex flex-col md:flex-row items-center gap-10 mb-16 pb-16 border-b border-white/10">
                  <div className="relative group">
                     {profile?.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="Profile" className="w-32 h-32 rounded-[2.5rem] object-cover ring-1 ring-white/10" />
                     ) : (
                        <div className="w-32 h-32 rounded-[2.5rem] bg-white text-black flex items-center justify-center text-4xl font-black shadow-[0_20px_60px_rgba(255,255,255,0.15)]">
                           {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                        </div>
                     )}
                     <div onClick={handleOpenEdit} className="absolute inset-0 bg-black/60 rounded-[2.5rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm">
                        <Edit3 size={24} className="text-white" />
                     </div>
                     <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-[#0B0F1A] border border-white/10 flex items-center justify-center text-indigo-400">
                        <Fingerprint size={20} />
                     </div>
                  </div>

                  <div className="text-center md:text-left flex-1">
                     <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">{profile?.firstName} {profile?.lastName}</h2>
                     <p className="text-sm font-black text-indigo-400 uppercase tracking-[0.4em] mb-6">{profile?.position ?? 'Strategic Operator'}</p>
                     <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        {profile?.role && roleBadge(profile.role)}
                        <div className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                           <Calendar size={12} className="text-indigo-500" /> {t.since} {new Date(profile?.createdAt || Date.now()).getFullYear()}
                        </div>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {infoGrid.map((item) => (
                     <div key={item.label} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/20 transition-all group">
                        <div className="flex items-center gap-3 text-slate-600 mb-5 group-hover:text-indigo-400 transition-colors">
                           <item.icon size={16} />
                           <span className="text-[10px] font-black uppercase tracking-[0.25em]">{item.label}</span>
                        </div>
                        <p className="text-sm font-bold text-white tracking-wide truncate">{item.value}</p>
                     </div>
                  ))}
               </div>

               <div className="mt-16 pt-8 border-t border-white/5 flex justify-between items-center text-slate-700">
                  <p className="text-[9px] font-black uppercase tracking-[0.5em]">Identity Token: {profile?.id?.slice(0, 8)}-EMS-PRO</p>
                  <button className="text-[9px] font-black hover:text-white transition-colors uppercase tracking-[0.3em]">Access Security Logs</button>
               </div>
            </div>
         )}

         {/* Edit Modal */}
         <Modal open={editOpen} onClose={() => setEditOpen(false)} title={t.edit}>
            <div className="space-y-8 pt-4">
               <div className="grid grid-cols-2 gap-6">
                  <Input label={t.firstName} icon={User} value={form.firstName} onChange={(e: any) => setForm(f => ({ ...f, firstName: e.target.value }))} />
                  <Input label={t.lastName} icon={User} value={form.lastName} onChange={(e: any) => setForm(f => ({ ...f, lastName: e.target.value }))} />
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <Input label={t.phone} icon={Phone} type="tel" value={form.phone} onChange={(e: any) => setForm(f => ({ ...f, phone: e.target.value }))} />
                  <Input label={t.position} icon={Briefcase} value={form.position} onChange={(e: any) => setForm(f => ({ ...f, position: e.target.value }))} />
               </div>

               <Input label={t.avatarUrl} icon={ImageIcon} value={form.avatarUrl} onChange={(e: any) => setForm(f => ({ ...f, avatarUrl: e.target.value }))} />
               <Input label={t.password} icon={Key} type="password" value={form.password} onChange={(e: any) => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />

               <div className="flex justify-end gap-4 mt-12 py-6 border-t border-white/5">
                  <button className="clean-btn-secondary px-10 h-12 text-[10px] uppercase tracking-widest" onClick={() => setEditOpen(false)}>{t.cancel}</button>
                  <button
                     className="clean-btn-primary px-10 h-12 text-[10px] uppercase tracking-widest"
                     onClick={() => updateMutation.mutate(form)}
                     disabled={updateMutation.isPending}
                  >
                     {updateMutation.isPending ? '...' : t.save}
                  </button>
               </div>
            </div>
         </Modal>
      </div>
   );
}
