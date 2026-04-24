import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Trash2, Search, Filter, Mail, LayoutGrid, List, Edit2, ShieldCheck, Zap, Download } from 'lucide-react';
import api from '../../../lib/axios';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '../../../components/ui/States';
import { Table, Pagination } from '../../../components/ui/Table';
import { Skeleton } from '../../../components/ui/Skeleton';
import { roleBadge, statusBadge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input, Select } from '../../../components/ui/Input';
import { useAuthStore } from '../../../store/auth.store';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const TRANSLATIONS = {
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
    name: 'الاسم الكامل',
    role: 'المستوى الوظيفي',
    dept: 'القسم',
    status: 'الحالة التشغيلية',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
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
    name: 'Operator Name',
    role: 'Access Protocol',
    dept: 'Department',
    status: 'Operational Status',
    email: 'Command Email',
    password: 'Access Cipher',
  }
};

export function UsersPage() {
  const qc = useQueryClient();
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const t = TRANSLATIONS[language];

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'EMPLOYEE', department: '', position: '' });

  const user = useAuthStore(s => s.user);
  const isAdminOrManager = user?.role !== 'EMPLOYEE';

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search, roleFilter, statusFilter],
    queryFn: () => api.get<any>('/users', { params: { page, limit: 12, search: search || undefined, role: roleFilter || undefined, status: statusFilter || undefined } }).then((r) => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: (dto: typeof form) => editingId ? api.patch(`/users/${editingId}`, dto) : api.post('/users', dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setEditOpen(false); toast.success('Protocol Successful'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Access Revoked'); },
  });

  const handleEdit = (u: any) => {
    setEditingId(u.id);
    setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, password: '', role: u.role, department: u.department || '', position: u.position || '' });
    setEditOpen(true);
  };

  const exportUsers = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Department', 'Position'],
      ...users.map((u: any) => [`${u.firstName} ${u.lastName}`, u.email, u.role, u.department, u.position])
    ].map(e => e.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `team_report_${new Date().toISOString().slice(0,10)}.csv`);
    link.click();
    toast.success(isRtl ? 'تم تصدير الفريق' : 'Team exported');
  };

  const users = data?.items || [];

  return (
    <div className="space-y-12 pb-12">
      <PageHeader
        title={t.users}
        description={t.usersSub}
        action={
          <div className="flex gap-3">
             <button onClick={exportUsers} className="clean-btn-secondary h-12 gap-2 text-[10px] uppercase tracking-widest"><Download size={16}/> {isRtl ? 'تصدير' : 'Export'}</button>
             {isAdminOrManager && <button onClick={() => { setEditingId(null); setForm({ firstName: '', lastName: '', email: '', password: '', role: 'EMPLOYEE', department: '', position: '' }); setEditOpen(true); }} className="clean-btn-primary h-12 gap-2 text-[10px] uppercase tracking-widest"><UserPlus size={16} /> {t.addUser}</button>}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label={t.totalTeam} value={data?.meta?.total || 0} icon={<ShieldCheck size={24} />} />
        <StatCard label={t.activeNow} value={users.filter((u: any) => u.status === 'ACTIVE').length} icon={<Zap size={24} />} delta="Live" trend="up" />
        <StatCard label={t.departments} value={5} icon={<Filter size={24} />} />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[300px] flex items-center gap-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl px-5 py-3.5 focus-within:border-white/20 transition-all">
          <Search size={18} className="text-slate-600" />
          <input value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} placeholder={t.search} className="bg-transparent text-sm text-white outline-none w-full font-medium" />
        </div>

        <select value={roleFilter} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRoleFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-xs font-black text-slate-400 outline-none uppercase tracking-widest">
          <option value="">{t.allRoles}</option>
          {['MANAGER', 'EMPLOYEE'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <div className="flex bg-white/5 rounded-2xl border border-white/10 p-1">
          <button onClick={() => setViewMode('grid')} className={clsx('p-2.5 rounded-xl transition-all', viewMode === 'grid' ? 'bg-white text-black' : 'text-slate-500 hover:text-white')}><LayoutGrid size={16} /></button>
          <button onClick={() => setViewMode('list')} className={clsx('p-2.5 rounded-xl transition-all', viewMode === 'list' ? 'bg-white text-black' : 'text-slate-500 hover:text-white')}><List size={16} /></button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-64 rounded-[2rem]" />)}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((u: any) => (
            <div key={u.id} className="clean-card group !p-8 flex flex-col items-center text-center hover:bg-white/[0.02]">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-[2rem] bg-white text-black flex items-center justify-center font-black text-xl shadow-2xl group-hover:scale-110 transition-transform">
                  {u.firstName[0]}
                </div>
                <div className={clsx("absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[#0B0F1A]", u.status === 'ACTIVE' ? "bg-teal-500" : "bg-slate-700")} />
              </div>

              <h4 className="text-base font-bold text-white mb-1">{u.firstName} {u.lastName}</h4>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-6">{u.role}</p>

              <div className="w-full grid grid-cols-2 gap-4 border-t border-white/5 pt-6 mb-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <div className="text-left"><p className="text-slate-700 mb-1">Tasks</p><p className="text-white">{u.tasksCount}</p></div>
                <div className={isRtl ? "text-left" : "text-right"}><p className="text-slate-700 mb-1">Projects</p><p className="text-white">{u.projectsCount}</p></div>
              </div>

              <div className="flex gap-2 w-full mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                {isAdminOrManager && (
                  <>
                    <button onClick={() => handleEdit(u)} className="flex-1 clean-btn-secondary py-2 h-auto text-[9px] uppercase tracking-widest">{t.edit}</button>
                    <button onClick={() => { if (confirm('Revoke Access?')) deleteMutation.mutate(u.id) }} className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={12} /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="clean-card !p-0 overflow-hidden">
          <Table columns={[
            { key: 'name', label: t.name, render: (u: any) => <div className="flex items-center gap-4"><div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs">{u.firstName[0]}</div><div className="flex flex-col"><span className="text-sm font-bold text-white">{u.firstName} {u.lastName}</span><span className="text-[10px] font-medium text-slate-500">{u.email}</span></div></div> },
            { key: 'role', label: t.role, render: (u: any) => roleBadge(u.role) },
            { key: 'dept', label: t.dept, render: (u: any) => <span className="text-xs font-bold text-slate-600 uppercase">{u.department || 'General'}</span> },
            { key: 'status', label: t.status, render: (u: any) => statusBadge(u.status) },
            isAdminOrManager && { key: 'actions', label: '', render: (u: any) => <div className="flex justify-end gap-2"><button onClick={() => handleEdit(u)} className="p-2 rounded-xl hover:bg-white/10 transition-all"><Edit2 size={14} /></button></div> }
          ].filter(Boolean) as any} data={users} keyFn={(u: any) => u.id} />
          {data?.meta && <Pagination page={page} totalPages={data.meta.totalPages} total={data.meta.total} limit={data.meta.limit} onPage={setPage} />}
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={editingId ? t.edit : t.addUser}>
        <div className="space-y-8 pt-4">
          <div className="grid grid-cols-2 gap-6">
            <Input label={isRtl ? 'الاسم الأول' : 'First Name'} icon={UserPlus} value={form.firstName} onChange={(e: any) => setForm(f => ({ ...f, firstName: e.target.value }))} />
            <Input label={isRtl ? 'الاسم الأخير' : 'Last Name'} icon={UserPlus} value={form.lastName} onChange={(e: any) => setForm(f => ({ ...f, lastName: e.target.value }))} />
          </div>

          <Input label={t.email} icon={Mail} type="email" value={form.email} onChange={(e: any) => setForm(f => ({ ...f, email: e.target.value }))} />

          {!editingId && (
            <Input label={t.password} icon={ShieldCheck} type="password" placeholder="••••••••" value={form.password} onChange={(e: any) => setForm(f => ({ ...f, password: e.target.value }))} />
          )}

          <div className="grid grid-cols-2 gap-6">
            <Select label={t.role} icon={ShieldCheck} value={form.role} options={['MANAGER', 'EMPLOYEE'].map(r => ({ value: r, label: r }))} onChange={(e: any) => setForm(f => ({ ...f, role: e.target.value }))} />
            <Select label={t.dept} icon={Zap} value={form.department} options={['ENGINEERING', 'FINANCE', 'HR', 'MARKETING', 'OPERATIONS'].map(d => ({ value: d, label: d }))} onChange={(e: any) => setForm(f => ({ ...f, department: e.target.value }))} />
          </div>

          <div className="flex justify-end gap-4 mt-12 py-6 border-t border-white/5">
            <button className="clean-btn-secondary px-10" onClick={() => setEditOpen(false)}>{t.cancel}</button>
            <button className="clean-btn-primary px-10" onClick={() => saveMutation.mutate(form)}>{t.save}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
