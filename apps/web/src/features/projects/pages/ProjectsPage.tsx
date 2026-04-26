import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, FolderKanban, Calendar, Target, Layers, Users, Search, LayoutGrid, List, Edit2, Trash2, Zap, DollarSign, Download } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../../lib/axios';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, EmptyState } from '../../../components/ui/States';
import { Skeleton } from '../../../components/ui/Skeleton';
import { statusBadge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input, Select, Textarea } from '../../../components/ui/Input';
import { Table, Pagination } from '../../../components/ui/Table';
import { useAuthStore } from '../../../store/auth.store';
import toast from 'react-hot-toast';

const TRANSLATIONS = {
  ar: {
    projects: 'مركز العمليات الاستراتيجية',
    projectsSub: 'متابعة المشاريع والجدول الزمني التشغيلي',
    newProject: 'مشروع جديد',
    search: 'بحث عن مشروع...',
    allStatus: 'كل الحالات',
    edit: 'تعديل المشروع',
    save: 'حفظ البيانات',
    cancel: 'إلغاء',
    name: 'اسم المشروع',
    manager: 'مدير المشروع',
    dept: 'القسم المسؤول',
    budget: 'الميزانية المعتمدة',
    progress: 'نسبة الإنجاز',
  },
  en: {
    projects: 'Strategic Hub',
    projectsSub: 'Track strategic projects and operational timelines',
    newProject: 'New Project',
    search: 'Search project...',
    allStatus: 'All Statuses',
    edit: 'Edit Project',
    save: 'Apply Changes',
    cancel: 'Cancel',
    name: 'Project Title',
    manager: 'Project Manager',
    dept: 'Department',
    budget: 'Project Budget',
    progress: 'Work Progress',
  }
};

const STATUS_OPTS = (isRtl: boolean) => [
  { value: 'PLANNING', label: isRtl ? 'قيد التخطيط' : 'Planning' },
  { value: 'ACTIVE', label: isRtl ? 'مشروع نشط' : 'Active' },
  { value: 'ON_HOLD', label: isRtl ? 'متوقف مؤقتاً' : 'On Hold' },
  { value: 'COMPLETED', label: isRtl ? 'مكتمل' : 'Completed' },
];

export function ProjectsPage() {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const isAdminOrManager = user?.role !== 'EMPLOYEE';
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const t = TRANSLATIONS[language];

  const exportProjects = async () => {
    try {
      const res = await api.get('/projects', { params: { limit: 10000 } });
      const allProjects = res.data.data.items || [];
      if (allProjects.length === 0) return toast.error(isRtl ? 'لا توجد مشاريع للتصدير' : 'No projects to export');
      const headers = isRtl
        ? ['الاسم', 'القسم', 'الحالة', 'نسبة الإنجاز', 'الميزانية', 'المدير', 'تاريخ البدء']
        : ['Name', 'Department', 'Status', 'Progress %', 'Budget', 'Manager', 'Start Date'];
      const csv = [
        headers,
        ...allProjects.map((p: any) => [
          `"${p.name}"`,
          `"${p.department || ''}"`,
          `"${p.status}"`,
          `"${p.progress}"`,
          `"${p.budget ?? ''}"`,
          `"${p.manager?.firstName || ''} ${p.manager?.lastName || ''}"`,
          `"${p.startDate ? new Date(p.startDate).toLocaleDateString() : ''}"`,
        ])
      ].map(e => e.join(",")).join("\n");
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `projects_report_${new Date().toISOString().slice(0, 10)}.csv`);
      link.click();
      URL.revokeObjectURL(url);
      toast.success(isRtl ? 'تم تصدير بيانات المشاريع' : 'Projects exported');
    } catch {
      toast.error(isRtl ? 'فشل التصدير' : 'Export failed');
    }
  };

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', managerId: '', department: '', startDate: '', endDate: '', budget: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['projects', page, search, status],
    queryFn: () => api.get<any>('/projects', { params: { page, limit: 12, search: search || undefined, status: status || undefined } }).then(r => r.data.data),
  });

  const { data: userData } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => api.get<any>('/users', { params: { limit: 100 } }).then(r => r.data.data.items),
  });

  const saveMutation = useMutation({
    mutationFn: () => editingId ? api.patch(`/projects/${editingId}`, { ...form, budget: parseFloat(form.budget) }) : api.post('/projects', { ...form, budget: parseFloat(form.budget) }),
    onSuccess: () => {
      setEditOpen(false);
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['audit-logs'] });
      toast.success(isRtl ? 'تم الحفظ' : 'Saved successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Action Failed');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['audit-logs'] });
      toast.success('Project Revoked');
    },
  });

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description || '', managerId: p.manager?.id || '', department: p.department || '', startDate: p.startDate?.split('T')[0] || '', endDate: p.endDate?.split('T')[0] || '', budget: String(p.budget || '') });
    setEditOpen(true);
  };

  const projects = data?.items ?? [];

  return (
    <div className="space-y-12">
      <PageHeader
        title={t.projects}
        description={t.projectsSub}
        action={
          <div className="flex gap-3">
            <button onClick={exportProjects} className="clean-btn-secondary h-12 gap-2 text-[10px] uppercase tracking-widest border-[var(--border)]"><Download size={16} /> {isRtl ? 'تصدير' : 'Export'}</button>
            {isAdminOrManager && <button onClick={() => { setEditingId(null); setForm({ name: '', description: '', managerId: '', department: '', startDate: '', endDate: '', budget: '' }); setEditOpen(true); }} className="clean-btn-primary h-12 gap-2 text-[10px] uppercase tracking-widest bg-brand shadow-brand/20"><Plus size={16} /> {t.newProject}</button>}
          </div>
        }
      />

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 flex items-center gap-3 bg-[var(--bg-glass)] border border-[var(--border)] rounded-2xl px-5 py-3 focus-within:border-brand/40 transition-all">
          <Search size={16} className="text-[var(--text-4)]" />
          <input value={search} onChange={(e: any) => { setSearch(e.target.value); setPage(1); }} placeholder={t.search} className="bg-transparent text-sm text-[var(--text-1)] outline-none w-full font-bold" />
        </div>

        <select value={status} onChange={(e: any) => { setStatus(e.target.value); setPage(1); }} className="bg-[var(--bg-glass)] border border-[var(--border)] rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--text-3)] outline-none">
          <option value="">{t.allStatus}</option>
          {STATUS_OPTS(isRtl).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <div className="flex bg-[var(--bg-glass)] rounded-2xl border border-[var(--border)] p-1">
          <button onClick={() => setViewMode('grid')} className={clsx('p-2.5 rounded-xl transition-all', viewMode === 'grid' ? 'bg-brand text-white' : 'text-[var(--text-4)] hover:text-brand')}><LayoutGrid size={16} /></button>
          <button onClick={() => setViewMode('list')} className={clsx('p-2.5 rounded-xl transition-all', viewMode === 'list' ? 'bg-brand text-white' : 'text-[var(--text-4)] hover:text-brand')}><List size={16} /></button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-[2.5rem]" />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState icon={<FolderKanban size={40} />} title={isRtl ? 'لا يوجد مشاريع استراتيجية' : 'No projects detected'} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((p: any) => (
            <div key={p.id} className="clean-card group hover:bg-brand/[0.02] flex flex-col p-8 border-[var(--border)]">
              <div className="flex justify-between items-start mb-8">
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-black text-[var(--text-1)] truncate group-hover:text-brand transition-colors uppercase tracking-tight">{p.name}</h4>
                  <p className="text-[10px] font-black text-[var(--text-4)] uppercase tracking-widest mt-1.5">{p.department}</p>
                </div>
                {statusBadge(p.status)}
              </div>

              <div className="mb-10">
                <div className="flex justify-between items-center text-[10px] font-black text-[var(--text-4)] uppercase tracking-[0.2em] mb-3">
                  <span>{t.progress}</span>
                  <span className="text-brand">{p.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--bg-glass)] rounded-full overflow-hidden border border-[var(--border)]">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} className="h-full bg-brand shadow-lg shadow-brand/40" />
                </div>
              </div>

              <div className="flex items-center gap-4 text-[10px] font-black text-[var(--text-4)] uppercase tracking-widest border-t border-[var(--border)] pt-8 mt-auto">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-black text-xs">{p.manager?.firstName[0]}</div>
                  <span className="font-bold text-[var(--text-3)]">{p.manager?.firstName}</span>
                </div>
                {p.budget && <div className="ml-auto text-[var(--text-1)] font-black">₪{(p.budget / 1000).toFixed(0)}K</div>}
              </div>

              {isAdminOrManager && (
                <div className="flex justify-end gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(p)} className="p-2 rounded-xl hover:bg-brand/10 text-[var(--text-4)] hover:text-brand transition-all"><Edit2 size={15} /></button>
                  <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(p.id) }} className="p-2 rounded-xl hover:bg-rose-500/10 text-[var(--text-4)] hover:text-rose-500 transition-all"><Trash2 size={15} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="clean-card !p-0 overflow-hidden border-[var(--border)]">
          <Table
            columns={[
              { key: 'name', label: t.name, render: (p: any) => <div className="flex flex-col"><span className="text-sm font-bold text-[var(--text-1)]">{p.name}</span><span className="text-[10px] font-black text-[var(--text-4)] uppercase tracking-widest mt-1.5">{p.department}</span></div> },
              { key: 'manager', label: t.manager, render: (p: any) => <span className="text-xs font-bold text-[var(--text-3)]">{p.manager?.firstName} {p.manager?.lastName}</span> },
              { key: 'status', label: t.projects, render: (p: any) => statusBadge(p.status) },
              { key: 'progress', label: t.progress, render: (p: any) => <div className="flex items-center gap-4"><div className="w-32 h-1.5 bg-[var(--bg-glass)] rounded-full overflow-hidden border border-[var(--border)]"><div className="h-full bg-brand" style={{ width: `${p.progress}%` }} /></div><span className="text-[10px] font-black text-[var(--text-1)]">{p.progress}%</span></div> },
              { key: 'budget', label: t.budget, render: (p: any) => <span className="text-xs font-bold text-[var(--text-4)]">{p.budget ? `₪${p.budget.toLocaleString()}` : '—'}</span> },
              isAdminOrManager && {
                key: 'actions', label: '', render: (p: any) => (
                  <div className="flex justify-end gap-3">
                    <button onClick={() => handleEdit(p)} className="p-2 rounded-xl hover:bg-brand/10 text-[var(--text-4)] hover:text-brand transition-colors"><Edit2 size={15} /></button>
                    <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(p.id) }} className="p-2 rounded-xl hover:bg-rose-500/10 text-[var(--text-4)] hover:text-rose-500 transition-colors"><Trash2 size={15} /></button>
                  </div>
                )
              }
            ].filter(Boolean) as any}
            data={projects}
            keyFn={(p: any) => p.id}
          />
          {data?.meta && <Pagination page={page} totalPages={data.meta.totalPages} total={data.meta.total} limit={data.meta.limit} onPage={setPage} />}
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={editingId ? t.edit : t.newProject}>
        <div className="space-y-8 pt-4">
          <Input label={t.name} icon={Target} value={form.name} onChange={(e: any) => setForm(f => ({ ...f, name: e.target.value }))} />
          <Textarea label={isRtl ? 'وصف المهمة الاستراتيجية' : 'Execution Details'} icon={Layers} value={form.description} onChange={(e: any) => setForm(f => ({ ...f, description: e.target.value }))} />

          <div className="grid grid-cols-2 gap-6">
            <Select label={t.manager} icon={Users} value={form.managerId} onChange={(e: any) => setForm(f => ({ ...f, managerId: e.target.value }))} options={(userData ?? []).map((u: any) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))} />
            <Select label={t.dept} icon={Zap} value={form.department} onChange={(e: any) => setForm(f => ({ ...f, department: e.target.value }))} options={['ENGINEERING', 'FINANCE', 'HR', 'MARKETING', 'OPERATIONS'].map(d => ({ value: d, label: d }))} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Input label={isRtl ? 'تاريخ البدء' : 'Deployment Date'} icon={Calendar} type="date" value={form.startDate} onChange={(e: any) => setForm(f => ({ ...f, startDate: e.target.value }))} />
            <Input label={isRtl ? 'تاريخ الإنجاز المتوقع' : 'Succession Date'} icon={Calendar} type="date" value={form.endDate} onChange={(e: any) => setForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>

          <Input label={t.budget} icon={DollarSign} type="number" value={form.budget} onChange={(e: any) => setForm(f => ({ ...f, budget: e.target.value }))} />

          <div className="flex justify-end gap-4 mt-12 py-6 border-t border-[var(--border)]">
            <button className="clean-btn-secondary px-10" onClick={() => setEditOpen(false)}>{t.cancel}</button>
            <button className="clean-btn-primary px-10" onClick={() => {
              if (!form.name || !form.managerId || !form.startDate) {
                return toast.error(isRtl ? 'يرجى تعبئة الحقول المطلوبة' : 'Please fill required fields');
              }
              if (confirm(isRtl ? 'هل أنت متأكد من حفظ البيانات؟' : 'Are you sure you want to save?')) {
                saveMutation.mutate()
              }
            }} disabled={saveMutation.isPending}>{t.save}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
