'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Trash2, Search, Filter, Mail, LayoutGrid, List, ShieldCheck, Zap } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/actions/users';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const T = {
  ar: {
    users: 'إدارة الكوادر البشرية',
    usersSub: 'التحكم في صلاحيات الفريق ومراقبة مستويات الأداء',
    addUser: 'إضافة عضو جديد',
    search: 'البحث في قاعدة البيانات...',
    allRoles: 'كل الصلاحيات',
    allStatus: 'كل الحالات',
    totalTeam: 'إجمالي الفريق',
    activeNow: 'نشط حالياً',
    departments: 'الأقسام النشطة',
    edit: 'تعديل البيانات',
    delete: 'حذف الحساب',
    save: 'اعتماد الحساب',
    cancel: 'تراجع',
    firstName: 'الاسم الأول',
    lastName: 'الاسم الأخير',
    role: 'المستوى الوظيفي',
    dept: 'القسم',
    status: 'الحالة التشغيلية',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    tasks: 'المهام',
    projects: 'المشاريع',
    noUsers: 'لا يوجد مستخدمون',
  },
  en: {
    users: 'Human Capital',
    usersSub: 'Strategic oversight of team permissions and operational velocity',
    addUser: 'Deploy Member',
    search: 'Search personnel database...',
    allRoles: 'All Protocols',
    allStatus: 'All Statuses',
    totalTeam: 'Total Personnel',
    activeNow: 'Active Operators',
    departments: 'Functional Depts',
    edit: 'Edit Profile',
    delete: 'Revoke Access',
    save: 'Verify & Save',
    cancel: 'Cancel',
    firstName: 'First Name',
    lastName: 'Last Name',
    role: 'Access Protocol',
    dept: 'Department',
    status: 'Operational Status',
    email: 'Command Email',
    password: 'Access Cipher',
    tasks: 'Tasks',
    projects: 'Projects',
    noUsers: 'No operators found',
  }
};

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'];
const DEPARTMENTS = ['ENGINEERING', 'FINANCE', 'HR', 'MARKETING', 'OPERATIONS', 'SALES', 'LEGAL', 'PRODUCT'];

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.05 } } };

export default function UsersPage() {
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const t = T[language as keyof typeof T] || T.en;

  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    role: 'EMPLOYEE' as string, department: '' as string, position: ''
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const res = await getUsers({
      page, limit: 12,
      search: search || undefined,
      role: (roleFilter || undefined) as any,
      sortBy: 'createdAt', sortOrder: 'desc',
    });
    if (res.success && res.data) {
      setUsers(res.data.items);
      setTotal(res.data.total);
    }
    setLoading(false);
  }, [page, search, roleFilter]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        const { password, email, ...updateData } = form;
        const res = await updateUser(editingId, {
          ...updateData,
          department: updateData.department || null,
          ...(password ? { password } : {}),
        } as any);
        if (res.success) {
          toast.success('Profile updated');
          setEditOpen(false);
          loadUsers();
        } else {
          toast.error(res.error || 'Update failed');
        }
      } else {
        const res = await createUser({
          ...form,
          department: form.department || null,
        } as any);
        if (res.success) {
          toast.success('Member deployed');
          setEditOpen(false);
          loadUsers();
        } else {
          toast.error(res.error || 'Creation failed');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Revoke access for this operator?')) return;
    const res = await deleteUser(id);
    if (res.success) {
      toast.success('Access revoked');
      loadUsers();
    } else {
      toast.error(res.error || 'Deletion failed');
    }
  };

  const handleEdit = (u: any) => {
    setEditingId(u.id);
    setForm({
      firstName: u.firstName, lastName: u.lastName, email: u.email, password: '',
      role: u.role, department: u.department || '', position: u.position || ''
    });
    setEditOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ firstName: '', lastName: '', email: '', password: '', role: 'EMPLOYEE', department: '', position: '' });
    setEditOpen(true);
  };

  const activeCount = users.filter(u => u.status === 'ACTIVE').length;
  const deptSet = new Set(users.map(u => u.department).filter(Boolean));

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <PageHeader
        title={t.users}
        description={t.usersSub}
        action={
          <button onClick={openNew} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
            <UserPlus size={14} /> {t.addUser}
          </button>
        }
      />

      {/* Stats */}
      <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label={t.totalTeam} value={total} icon={<ShieldCheck size={20} />} />
        <StatCard label={t.activeNow} value={activeCount} icon={<Zap size={20} />} delta="Live" trend="up" />
        <StatCard label={t.departments} value={deptSet.size} icon={<Filter size={20} />} />
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[280px] flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 focus-within:border-white/20 transition-all">
          <Search size={16} className="text-slate-600 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.search}
            className="bg-transparent text-sm text-white outline-none w-full font-medium placeholder:text-slate-600"
          />
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-[10px] font-black text-slate-400 outline-none uppercase tracking-widest cursor-pointer"
        >
          <option value="">{t.allRoles}</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <div className="flex bg-white/[0.03] rounded-xl border border-white/[0.08] p-1">
          <button onClick={() => setViewMode('grid')} className={clsx('p-2.5 rounded-lg transition-all', viewMode === 'grid' ? 'bg-white text-black' : 'text-slate-500 hover:text-white')}>
            <LayoutGrid size={14} />
          </button>
          <button onClick={() => setViewMode('list')} className={clsx('p-2.5 rounded-lg transition-all', viewMode === 'list' ? 'bg-white text-black' : 'text-slate-500 hover:text-white')}>
            <List size={14} />
          </button>
        </div>
      </motion.div>

      {/* Users Grid / List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="glass-card p-8 animate-pulse">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 mb-4" />
                <div className="h-4 w-24 bg-white/5 rounded mb-2" />
                <div className="h-3 w-16 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <motion.div variants={fadeIn} className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <ShieldCheck size={24} className="text-slate-600" />
          </div>
          <p className="text-sm font-bold text-white mb-1">{t.noUsers}</p>
          <p className="text-xs text-slate-500">Try adjusting your filters</p>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {users.map((u: any) => (
            <motion.div key={u.id} variants={fadeIn} className="glass-card group !p-8 flex flex-col items-center text-center hover:border-white/15 transition-all">
              {/* Avatar */}
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center font-black text-xl shadow-2xl group-hover:scale-110 transition-transform">
                  {u.firstName?.[0] || '?'}
                </div>
                <div className={clsx(
                  'absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[#0B0F1A]',
                  u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-700'
                )} />
              </div>

              {/* Name & Role */}
              <h4 className="text-sm font-bold text-white mb-1">{u.firstName} {u.lastName}</h4>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">{u.role}</p>
              {u.department && (
                <p className="text-[9px] font-bold text-blue-400/60 uppercase tracking-widest mb-4">{u.department}</p>
              )}

              {/* Stats */}
              <div className="w-full grid grid-cols-2 gap-4 border-t border-white/5 pt-5 mb-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <p className="text-slate-700 mb-0.5">{t.tasks}</p>
                  <p className="text-white text-sm">{u.tasksCount ?? 0}</p>
                </div>
                <div className={isRtl ? 'text-left' : 'text-right'}>
                  <p className="text-slate-700 mb-0.5">{t.projects}</p>
                  <p className="text-white text-sm">{u.projectsCount ?? 0}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 w-full mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(u)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">
                  {t.edit}
                </button>
                <button onClick={() => handleDelete(u.id)} className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        /* List view */
        <motion.div variants={fadeIn} className="glass-card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {[t.firstName, t.role, t.dept, t.status, ''].map((h, i) => (
                    <th key={i} className="px-5 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs text-white">{u.firstName?.[0]}</div>
                        <div>
                          <p className="text-sm font-bold text-white">{u.firstName} {u.lastName}</p>
                          <p className="text-[10px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg uppercase tracking-widest">{u.role}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{u.department || 'General'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={clsx(
                        'text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest',
                        u.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-white/5'
                      )}>{u.status}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => handleEdit(u)} className="p-2 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all">
                        <ShieldCheck size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={editingId ? t.edit : t.addUser}>
        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <Input label={t.firstName} icon={UserPlus} value={form.firstName} onChange={(e: any) => setForm(f => ({...f, firstName: e.target.value}))} />
            <Input label={t.lastName} icon={UserPlus} value={form.lastName} onChange={(e: any) => setForm(f => ({...f, lastName: e.target.value}))} />
          </div>

          <Input label={t.email} icon={Mail} type="email" value={form.email} onChange={(e: any) => setForm(f => ({...f, email: e.target.value}))} disabled={!!editingId} />

          {!editingId && (
            <Input label={t.password} icon={ShieldCheck} type="password" placeholder="••••••••" value={form.password} onChange={(e: any) => setForm(f => ({...f, password: e.target.value}))} />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t.role}
              icon={ShieldCheck}
              value={form.role}
              options={ROLES.map(r => ({ value: r, label: r }))}
              onChange={(e: any) => setForm(f => ({...f, role: e.target.value}))}
            />
            <Select
              label={t.dept}
              icon={Zap}
              value={form.department}
              placeholder="Select..."
              options={DEPARTMENTS.map(d => ({ value: d, label: d }))}
              onChange={(e: any) => setForm(f => ({...f, department: e.target.value}))}
            />
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/5">
            <button className="px-8 py-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 transition-all" onClick={() => setEditOpen(false)}>
              {t.cancel}
            </button>
            <button
              className="px-8 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '...' : t.save}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
