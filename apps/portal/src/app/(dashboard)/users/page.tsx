'use client';

import { useState } from 'react';
import { UserPlus, Trash2, Search, LayoutGrid, List, Zap, MoreHorizontal, Edit2, Shield, UserCircle, ExternalLink } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/actions/users';
import { getEntityLogs } from '@/lib/actions/audit';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const T = {
  ar: {
    users: 'إدارة الكوادر البشرية',
    usersSub: 'التحكم في صلاحيات الفريق ومراقبة مستويات الأداء',
    addUser: 'إضافة عضو جديد',
    search: 'البحث عن موظف...',
    allRoles: 'كل الصلاحيات',
    allStatus: 'كل الحالات',
    totalTeam: 'إجمالي الفريق',
    activeNow: 'نشط حالياً',
    departments: 'الأقسام النشطة',
    edit: 'تعديل البيانات',
    delete: 'حذف الحساب',
    save: 'حفظ التغييرات',
    cancel: 'تراجع',
    firstName: 'الاسم الأول',
    lastName: 'الاسم الأخير',
    role: 'المستوى الوظيفي',
    dept: 'القسم',
    status: 'الحالة التشغيلية',
    email: 'البريد الإلكتروني',
    employeeNumber: 'الرقم الوظيفي',
    nationalId: 'رقم الهوية',
    password: 'كلمة المرور',
    tasks: 'المهام',
    projects: 'المشاريع',
    noUsers: 'لا يوجد مستخدمون مطابقون للبحث',
    other: 'أخرى',
    enterDept: 'أدخل اسم القسم',
    deleteConfirm: 'هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع عن هذه العملية.',
  },
  en: {
    users: 'Human Capital',
    usersSub: 'Strategic oversight of team permissions and operational velocity',
    addUser: 'Deploy Member',
    search: 'Search personnel...',
    allRoles: 'All Protocols',
    allStatus: 'All Statuses',
    totalTeam: 'Total Personnel',
    activeNow: 'Active Operators',
    departments: 'Functional Depts',
    edit: 'Edit Profile',
    delete: 'Revoke Access',
    save: 'Commit Changes',
    cancel: 'Cancel',
    firstName: 'First Name',
    lastName: 'Last Name',
    role: 'Access Protocol',
    dept: 'Department',
    status: 'Operational Status',
    email: 'Command Email',
    employeeNumber: 'Employee ID',
    nationalId: 'National ID',
    password: 'Access Cipher',
    tasks: 'Tasks',
    projects: 'Projects',
    noUsers: 'No operators found matching search',
    other: 'Other',
    enterDept: 'Enter Dept Name',
    deleteConfirm: 'Are you sure you want to revoke access? This operation is permanent.',
  }
};

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'];
const DEPARTMENTS = ['MANAGEMENT', 'MARKETING', 'ENGINEERING', 'SOCIAL_MEDIA', 'PROGRAMMING', 'PROJECTS', 'HR', 'FINANCE', 'OPERATIONS'];

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.05 } } };

export default function UsersPage() {
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const t = T[language as keyof typeof T] || T.en;
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editOpen, setEditOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', employeeNumber: '', nationalId: '', password: '',
    role: 'EMPLOYEE' as string, department: '' as string, position: '', customDept: ''
  });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', search, roleFilter],
    queryFn: async () => {
      const res = await getUsers({
        search: search || undefined,
        role: (roleFilter || undefined) as any,
        sortBy: 'createdAt', sortOrder: 'desc',
      });
      return res.data;
    }
  });

  const users = usersData?.items || [];
  const total = usersData?.total || 0;

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingId) {
        return updateUser(editingId, data);
      }
      return createUser(data);
    },
    onSuccess: (res) => {
      if (res.success) {
        const msg = editingId 
          ? 'Personnel updated successfully' 
          : `Personnel deployed. Employee ID: ${res.data?.employeeNumber || 'Unknown'}`;
        toast.success(msg, { duration: 6000 });
        setEditOpen(false);
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      } else {
        toast.error(res.error || 'Operation failed');
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Access revoked');
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      }
    }
  });

  const handleSave = () => {
    const { customDept, ...formData } = form;
    const finalDept = formData.department === 'OTHER' ? customDept : formData.department;
    
    const payload = {
      ...formData,
      department: finalDept || null,
    };

    if (editingId && !form.password) {
        delete (payload as any).password;
    }

    mutation.mutate(payload);
  };

  const handleDelete = (id: string) => {
    if (confirm(t.deleteConfirm)) deleteMutation.mutate(id);
  };

  const handleEdit = (u: any) => {
    setEditingId(u.id);
    setForm({
      firstName: u.firstName, lastName: u.lastName, email: u.email, 
      employeeNumber: u.employeeNumber, nationalId: u.nationalId || '', password: '',
      role: u.role, department: DEPARTMENTS.includes(u.department) ? u.department : (u.department ? 'OTHER' : ''),
      position: u.position || '', customDept: DEPARTMENTS.includes(u.department) ? '' : (u.department || '')
    });
    setEditOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ 
      firstName: '', lastName: '', email: '', employeeNumber: '', nationalId: '', password: '', 
      role: 'EMPLOYEE', department: '', position: '', customDept: '' 
    });
    setEditOpen(true);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader
        title={t.users}
        description={t.usersSub}
        action={
          <button onClick={openNew} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand/90 transition-all shadow-lg shadow-brand/20">
            <UserPlus size={14} /> {t.addUser}
          </button>
        }
      />

      <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label={t.totalTeam} value={total} icon={<Shield size={18} />} />
        <StatCard label={t.activeNow} value={users.filter((u:any) => u.status === 'ACTIVE').length} icon={<Zap size={18} />} delta="Live" trend="up" />
        <StatCard label={t.departments} value={new Set(users.map((u:any) => u.department).filter(Boolean)).size} icon={<LayoutGrid size={18} />} />
      </motion.div>

      <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[280px] flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus-within:border-brand/40 transition-all shadow-sm">
          <Search size={18} className="text-slate-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search} className="bg-transparent text-sm text-slate-900 outline-none w-full font-medium placeholder:text-slate-400" />
        </div>

        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-[10px] font-black text-slate-500 outline-none uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-all shadow-sm">
          <option value="">{t.allRoles}</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <div className="flex bg-slate-50 rounded-xl border border-slate-200 p-1 shadow-sm">
          <button onClick={() => setViewMode('grid')} className={clsx('p-2.5 rounded-lg transition-all', viewMode === 'grid' ? 'bg-brand text-white shadow-lg shadow-brand/10' : 'text-slate-400 hover:text-slate-900')}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setViewMode('list')} className={clsx('p-2.5 rounded-lg transition-all', viewMode === 'list' ? 'bg-brand text-white shadow-lg shadow-brand/10' : 'text-slate-400 hover:text-slate-900')}>
            <List size={16} />
          </button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="glass-card h-64 animate-pulse bg-slate-50 border-slate-100" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="py-32 text-center glass-card border-dashed border-slate-200 bg-white">
            <UserCircle size={48} className="mx-auto text-slate-100 mb-4" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.noUsers}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((u: any) => (
            <motion.div key={u.id} variants={fadeIn} className="glass-card group !p-8 flex flex-col items-center text-center border-slate-100 bg-white hover:bg-slate-50 hover:border-brand/20 transition-all relative overflow-hidden shadow-sm">
              <div className="relative mb-6" onClick={() => { setSelectedUser(u); setDetailModalOpen(true); }}>
                <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-center font-black text-2xl shadow-sm group-hover:scale-110 transition-transform cursor-pointer">
                  {u.firstName?.[0] || '?'}
                </div>
                <div className={clsx(
                  'absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white',
                  u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'
                )} />
              </div>

              <h4 className="text-sm font-black text-slate-900 mb-1 uppercase tracking-tight cursor-pointer hover:text-brand transition-colors" onClick={() => { setSelectedUser(u); setDetailModalOpen(true); }}>{u.firstName} {u.lastName}</h4>
              <p className="text-[9px] font-black text-brand uppercase tracking-[0.2em] mb-4">{u.role}</p>
              
              <div className="flex flex-col gap-2 mb-8">
                  {u.department && (
                    <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-lg uppercase tracking-widest border border-slate-100">{u.department}</span>
                  )}
              </div>

              <div className="flex gap-2 w-full mt-auto opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                <button onClick={() => handleEdit(u)} className="flex-1 py-3 rounded-xl bg-slate-50 border border-slate-200 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 hover:text-brand transition-all">
                  {t.edit}
                </button>
                <button onClick={() => { setSelectedUser(u); setDetailModalOpen(true); }} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-brand transition-all"><ExternalLink size={14} /></button>
                <button onClick={() => handleDelete(u.id)} className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeIn} className="glass-card !p-0 overflow-hidden border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-8 py-5 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.firstName}</th>
                  <th className="px-8 py-5 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.role}</th>
                  <th className="px-8 py-5 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.dept}</th>
                  <th className="px-8 py-5 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.status}</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setSelectedUser(u); setDetailModalOpen(true); }}>
                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 flex items-center justify-center font-black text-sm">{u.firstName?.[0]}</div>
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{u.firstName} {u.lastName}</p>
                          <p className="text-[10px] font-bold text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5"><span className="text-[9px] font-black text-brand bg-brand/5 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-brand/10">{u.role}</span></td>
                    <td className="px-8 py-5"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{u.department || 'GENERAL'}</span></td>
                    <td className="px-8 py-5">
                      <span className={clsx(
                        'text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border',
                        u.status === 'ACTIVE' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-slate-400 bg-slate-50 border-slate-200'
                      )}>{u.status}</span>
                    </td>
                    <td className="px-8 py-5 text-end">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => handleEdit(u)} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-brand border border-slate-200 transition-all"><Edit2 size={14} /></button>
                            <button onClick={() => { setSelectedUser(u); setDetailModalOpen(true); }} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-brand border border-slate-200 transition-all"><ExternalLink size={14} /></button>
                            <button onClick={() => handleDelete(u.id)} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-500 border border-slate-200 transition-all"><Trash2 size={14} /></button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={editingId ? t.edit : t.addUser}>
        <div className="space-y-6 pt-2">
            <div className="grid grid-cols-2 gap-4">
                <Input label={t.firstName} value={form.firstName} onChange={(e: any) => setForm(f => ({...f, firstName: e.target.value}))} />
                <Input label={t.lastName} value={form.lastName} onChange={(e: any) => setForm(f => ({...f, lastName: e.target.value}))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Input label={t.email} type="email" value={form.email} onChange={(e: any) => setForm(f => ({...f, email: e.target.value}))} disabled={!!editingId} />
                <Input label={t.nationalId} value={form.nationalId} onChange={(e: any) => setForm(f => ({...f, nationalId: e.target.value}))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Input label={t.password} type="password" placeholder={editingId ? '••••••••' : 'Access Cipher'} value={form.password} onChange={(e: any) => setForm(f => ({...f, password: e.target.value}))} />
                <Select label={t.role} value={form.role} options={ROLES.map(r => ({ value: r, label: r }))} onChange={(e: any) => setForm(f => ({...f, role: e.target.value}))} />
            </div>
            <Select label={t.dept} value={form.department} options={[...DEPARTMENTS.map(d => ({ value: d, label: d })), { value: 'OTHER', label: t.other }]} onChange={(e: any) => setForm(f => ({...f, department: e.target.value}))} />
            {form.department === 'OTHER' && <Input label={t.enterDept} value={form.customDept} onChange={(e: any) => setForm(f => ({...f, customDept: e.target.value}))} />}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                <button className="px-8 py-3 rounded-xl bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition-all" onClick={() => setEditOpen(false)}>{t.cancel}</button>
                <button className="px-10 py-3 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 disabled:opacity-50" onClick={handleSave} disabled={mutation.isPending}>{mutation.isPending ? 'Processing...' : t.save}</button>
            </div>
        </div>
      </Modal>

      <Modal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="Personnel Intelligence & History">
        <UserDetailView user={selectedUser} isRtl={isRtl} t={t} onClose={() => setDetailModalOpen(false)} />
      </Modal>
    </motion.div>
  );
}

function UserDetailView({ user, isRtl, t, onClose }: any) {
    const [tab, setTab] = useState<'info' | 'activity'>('info');
    const { data: logs = [], isLoading } = useQuery({
        queryKey: ['entity-logs', 'User', user?.id],
        queryFn: async () => { const res = await getEntityLogs('User', user.id); return res.data || []; },
        enabled: !!user && tab === 'activity'
    });

    if (!user) return null;

    return (
        <div className="space-y-8 pt-4">
            <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
                <button onClick={() => setTab('info')} className={clsx('flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all', tab === 'info' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600')}>Profile Overview</button>
                <button onClick={() => setTab('activity')} className={clsx('flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all', tab === 'activity' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600')}>Audit Log</button>
            </div>
            <AnimatePresence mode="wait">
                {tab === 'info' ? (
                    <motion.div key="info" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-2xl text-slate-900 shadow-sm">{user.firstName?.[0]}</div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{user.firstName} {user.lastName}</h3>
                                <p className="text-[10px] font-black text-brand uppercase tracking-widest">{user.role}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.email}</p>
                                <p className="text-xs font-black text-slate-900">{user.email}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.dept}</p>
                                <p className="text-xs font-black text-slate-900">{user.department || 'GENERAL'}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.employeeNumber}</p>
                                <p className="text-xs font-black text-slate-900">#{user.employeeNumber}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">{user.status}</p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="activity" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                        {isLoading ? Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />) : logs.length === 0 ? (
                            <div className="py-20 text-center text-slate-300 uppercase tracking-[0.3em] text-[10px] font-black">No Audit Data Found</div>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                                {logs.map((log: any) => (
                                    <div key={log.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:text-brand transition-colors">{log.user?.[0]}</div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{log.user} <span className="text-slate-400 font-normal">{log.action.toLowerCase()}</span> account</p>
                                                <p className="text-[9px] font-bold text-slate-400">{new Date(log.time).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-brand transition-colors" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="flex justify-end pt-4 border-t border-slate-100">
                <button className="px-8 py-3 rounded-xl bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-200 transition-all" onClick={onClose}>{isRtl ? 'إغلاق' : 'Dismiss'}</button>
            </div>
        </div>
    );
}
