'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Trash2, Search, Filter, Mail, LayoutGrid, List, ShieldCheck, Zap, Lock, MoreHorizontal, Edit2, Shield, UserCircle } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/actions/users';
import { motion, AnimatePresence } from 'framer-motion';
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
const DEPARTMENTS = ['SOCIAL_MEDIA', 'PROGRAMMING', 'PROJECTS', 'HR', 'FINANCE', 'OPERATIONS'];

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.05 } } };

export default function UsersPage() {
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const t = T[language as keyof typeof T] || T.en;

  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', employeeNumber: '', nationalId: '', password: '',
    role: 'EMPLOYEE' as string, department: '' as string, position: '', customDept: ''
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const res = await getUsers({
      search: search || undefined,
      role: (roleFilter || undefined) as any,
      sortBy: 'createdAt', sortOrder: 'desc',
    });
    if (res.success && res.data) {
      setUsers(res.data.items);
      setTotal(res.data.total);
    }
    setLoading(false);
  }, [search, roleFilter]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        const { password, email, ...updateData } = form;
        const res = await updateUser(editingId, {
          ...updateData,
          department: updateData.department === 'OTHER' ? updateData.customDept : (updateData.department || null),
          ...(password ? { password } : {}),
        } as any);
        if (res.success) {
          toast.success('System updated');
          setEditOpen(false);
          loadUsers();
        }
      } else {
        const finalDept = form.department === 'OTHER' ? form.customDept : form.department;
        const res = await createUser({
          ...form,
          department: finalDept || null,
        } as any);
        if (res.success) {
          toast.success('Personnel deployed');
          setEditOpen(false);
          loadUsers();
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return;
    const res = await deleteUser(id);
    if (res.success) {
      toast.success('Access revoked');
      loadUsers();
    }
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
        <StatCard label={t.activeNow} value={users.filter(u => u.status === 'ACTIVE').length} icon={<Zap size={18} />} delta="Live" trend="up" />
        <StatCard label={t.departments} value={new Set(users.map(u => u.department).filter(Boolean)).size} icon={<LayoutGrid size={18} />} />
      </motion.div>

      <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[280px] flex items-center gap-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-3.5 focus-within:border-brand/40 transition-all">
          <Search size={18} className="text-slate-600 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.search}
            className="bg-transparent text-sm text-white outline-none w-full font-medium placeholder:text-slate-700"
          />
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 py-3.5 text-[10px] font-black text-slate-400 outline-none uppercase tracking-widest cursor-pointer hover:bg-white/[0.05] transition-all"
        >
          <option value="">{t.allRoles}</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <div className="flex bg-white/[0.03] rounded-xl border border-white/[0.08] p-1">
          <button onClick={() => setViewMode('grid')} className={clsx('p-2.5 rounded-lg transition-all', viewMode === 'grid' ? 'bg-brand text-white shadow-lg shadow-brand/10' : 'text-slate-600 hover:text-white')}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setViewMode('list')} className={clsx('p-2.5 rounded-lg transition-all', viewMode === 'list' ? 'bg-brand text-white shadow-lg shadow-brand/10' : 'text-slate-600 hover:text-white')}>
            <List size={16} />
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="glass-card h-64 animate-pulse bg-white/[0.02] border-white/5" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="py-32 text-center glass-card border-dashed border-white/5 bg-white/[0.01]">
            <UserCircle size={48} className="mx-auto text-slate-800 mb-4 opacity-20" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.noUsers}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((u: any) => (
            <motion.div key={u.id} variants={fadeIn} className="glass-card group !p-8 flex flex-col items-center text-center hover:border-brand/20 hover:bg-white/[0.04] transition-all relative overflow-hidden">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-3xl bg-white text-black flex items-center justify-center font-black text-2xl shadow-2xl group-hover:scale-110 transition-transform">
                  {u.firstName?.[0] || '?'}
                </div>
                <div className={clsx(
                  'absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-[#0B0F1A]',
                  u.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-700'
                )} />
              </div>

              <h4 className="text-sm font-black text-white mb-1 uppercase tracking-tight">{u.firstName} {u.lastName}</h4>
              <p className="text-[9px] font-black text-brand uppercase tracking-[0.2em] mb-4">{u.role}</p>
              
              <div className="flex flex-col gap-2 mb-8">
                  {u.department && (
                    <span className="text-[9px] font-black text-slate-500 bg-white/5 px-3 py-1 rounded-lg uppercase tracking-widest border border-white/5">{u.department}</span>
                  )}
                  <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">#{u.employeeNumber}</span>
              </div>

              <div className="w-full grid grid-cols-2 gap-4 border-t border-white/5 pt-6 mb-6">
                <div>
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{t.tasks}</p>
                  <p className="text-lg font-black text-white">{u.tasksCount ?? 0}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{t.projects}</p>
                  <p className="text-lg font-black text-white">{u.projectsCount ?? 0}</p>
                </div>
              </div>

              <div className="flex gap-2 w-full mt-auto opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                <button onClick={() => handleEdit(u)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">
                  {t.edit}
                </button>
                <button onClick={() => handleDelete(u.id)} className="p-3 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeIn} className="glass-card !p-0 overflow-hidden border-white/5 bg-white/[0.01]">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-8 py-5 text-start text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.firstName}</th>
                  <th className="px-8 py-5 text-start text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.role}</th>
                  <th className="px-8 py-5 text-start text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.dept}</th>
                  <th className="px-8 py-5 text-start text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.status}</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-black text-sm">{u.firstName?.[0]}</div>
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-tight">{u.firstName} {u.lastName}</p>
                          <p className="text-[10px] font-bold text-slate-600">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[9px] font-black text-brand bg-brand/10 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-brand/20">{u.role}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{u.department || 'GENERAL'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={clsx(
                        'text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border',
                        u.status === 'ACTIVE' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-slate-600 bg-white/5 border-white/10'
                      )}>{u.status}</span>
                    </td>
                    <td className="px-8 py-5 text-end">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => handleEdit(u)} className="p-2 rounded-lg bg-white/5 text-slate-500 hover:text-white"><Edit2 size={14} /></button>
                            <button onClick={() => handleDelete(u.id)} className="p-2 rounded-lg bg-white/5 text-slate-500 hover:text-rose-500"><Trash2 size={14} /></button>
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
            <Input label={t.employeeNumber} value={form.employeeNumber} onChange={(e: any) => setForm(f => ({...f, employeeNumber: e.target.value}))} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label={t.nationalId} value={form.nationalId} onChange={(e: any) => setForm(f => ({...f, nationalId: e.target.value}))} />
            <Input label={t.password} type="password" placeholder={editingId ? '••••••••' : 'Access Cipher'} value={form.password} onChange={(e: any) => setForm(f => ({...f, password: e.target.value}))} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t.role}
              value={form.role}
              options={ROLES.map(r => ({ value: r, label: r }))}
              onChange={(e: any) => setForm(f => ({...f, role: e.target.value}))}
            />
            <Select
              label={t.dept}
              value={form.department}
              placeholder="Select Functional Dept"
              options={[...DEPARTMENTS.map(d => ({ value: d, label: d })), { value: 'OTHER', label: t.other }]}
              onChange={(e: any) => setForm(f => ({...f, department: e.target.value}))}
            />
          </div>

          {form.department === 'OTHER' && (
            <Input label={t.enterDept} value={form.customDept} onChange={(e: any) => setForm(f => ({...f, customDept: e.target.value}))} />
          )}

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/5">
            <button className="px-8 py-3 rounded-xl bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest" onClick={() => setEditOpen(false)}>
              {t.cancel}
            </button>
            <button
              className="px-10 py-3 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 disabled:opacity-50"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Processing...' : t.save}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
