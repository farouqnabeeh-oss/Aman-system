import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, FolderKanban, Calendar, Target, Layers, Users, Search, LayoutGrid, List, Edit2, Trash2, Zap, DollarSign } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../../lib/axios';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, EmptyState } from '../../../components/ui/States';
import { Skeleton } from '../../../components/ui/Skeleton';
import { statusBadge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input, Select, Textarea } from '../../../components/ui/Input';
import { Table, Pagination } from '../../../components/ui/Table';
import toast from 'react-hot-toast';

const TRANSLATIONS = {
  ar: {
    projects: 'إدارة العمليات',
    projectsSub: 'متابعة المشاريع الاستراتيجية والجدول الزمني',
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
    projects: 'Project Hub',
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
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const t = TRANSLATIONS[language];

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
    mutationFn: () => editingId ? api.patch(`/projects/${editingId}`, { ...form, budget: parseFloat(form.budget)}) : api.post('/projects', { ...form, budget: parseFloat(form.budget) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); setEditOpen(false); toast.success('Success'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Deleted'); },
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
        action={<button onClick={() => { setEditingId(null); setForm({ name: '', description: '', managerId: '', department: '', startDate: '', endDate: '', budget: '' }); setEditOpen(true); }} className="clean-btn-primary h-12 gap-2 text-xs uppercase tracking-widest"><Plus size={16} /> {t.newProject}</button>}
      />

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-2xl px-5 py-3 focus-within:border-white/20 transition-all">
          <Search size={16} className="text-slate-600" />
          <input value={search} onChange={(e: any) => { setSearch(e.target.value); setPage(1); }} placeholder={t.search} className="bg-transparent text-sm text-white outline-none w-full font-medium" />
        </div>
        
        <select value={status} onChange={(e: any) => { setStatus(e.target.value); setPage(1); }} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-400 outline-none">
          <option value="">{t.allStatus}</option>
          {STATUS_OPTS(isRtl).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <div className="flex bg-white/5 rounded-2xl border border-white/10 p-1">
          <button onClick={() => setViewMode('grid')} className={clsx('p-2.5 rounded-xl transition-all', viewMode === 'grid' ? 'bg-white text-black' : 'text-slate-500 hover:text-white')}><LayoutGrid size={16}/></button>
          <button onClick={() => setViewMode('list')} className={clsx('p-2.5 rounded-xl transition-all', viewMode === 'list' ? 'bg-white text-black' : 'text-slate-500 hover:text-white')}><List size={16}/></button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-3xl" />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState icon={<FolderKanban size={40} />} title={isRtl ? 'لا يوجد مشاريع':'No projects detected'} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p: any) => (
            <div key={p.id} className="clean-card group hover:bg-white/[0.02] flex flex-col p-8">
              <div className="flex justify-between items-start mb-6">
                 <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-white truncate group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{p.name}</h4>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">{p.department}</p>
                 </div>
                 {statusBadge(p.status)}
              </div>

              <div className="mb-8">
                 <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                    <span>{t.progress}</span>
                    <span className="text-white">{p.progress}%</span>
                 </div>
                 <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} className="h-full bg-white" />
                 </div>
              </div>

              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-t border-white/5 pt-6 mt-auto">
                 <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">{p.manager?.firstName[0]}</div>
                    <span>{p.manager?.firstName}</span>
                 </div>
                 {p.budget && <div className="ml-auto text-white">${(p.budget/1000).toFixed(0)}K</div>}
              </div>
              
              <div className="flex justify-end gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => handleEdit(p)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Edit2 size={14}/></button>
                 <button onClick={() => {if(confirm('Delete?')) deleteMutation.mutate(p.id)}} className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="clean-card !p-0 overflow-hidden">
           <Table 
            columns={[
              { key: 'name', label: t.name, render: (p: any) => <div className="flex flex-col"><span className="text-sm font-bold text-white">{p.name}</span><span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">{p.department}</span></div> },
              { key: 'manager', label: t.manager, render: (p: any) => <span className="text-xs font-bold text-slate-400">{p.manager?.firstName} {p.manager?.lastName}</span> },
              { key: 'status', label: t.projects, render: (p: any) => statusBadge(p.status) },
              { key: 'progress', label: t.progress, render: (p: any) => <div className="flex items-center gap-3"><div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-white" style={{width:`${p.progress}%`}}/></div><span className="text-[10px] font-black text-white">{p.progress}%</span></div> },
              { key: 'budget', label: t.budget, render: (p: any) => <span className="text-xs font-bold text-slate-500">{p.budget ? `$${p.budget.toLocaleString()}` : '—'}</span> },
              { key: 'actions', label: '', render: (p: any) => (
                <div className="flex justify-end gap-2">
                  <button onClick={() => handleEdit(p)} className="p-2 rounded-lg hover:bg-white/10 text-slate-600 hover:text-white"><Edit2 size={14}/></button>
                  <button onClick={() => {if(confirm('Delete?')) deleteMutation.mutate(p.id)}} className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-500"><Trash2 size={14}/></button>
                </div>
              )}
            ]}
            data={projects}
            keyFn={p => p.id}
           />
           {data?.meta && <Pagination page={page} totalPages={data.meta.totalPages} total={data.meta.total} limit={data.meta.limit} onPage={setPage} />}
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={editingId ? t.edit : t.newProject}>
        <div className="space-y-8 pt-4">
          <Input label={t.name} icon={Target} value={form.name} onChange={(e: any) => setForm(f => ({ ...f, name: e.target.value }))} />
          <Textarea label={isRtl ? 'وصف المشروع' : 'Execution Details'} icon={Layers} value={form.description} onChange={(e: any) => setForm(f => ({ ...f, description: e.target.value }))} />
          
          <div className="grid grid-cols-2 gap-6">
            <Select label={t.manager} icon={Users} value={form.managerId} onChange={(e: any) => setForm(f => ({ ...f, managerId: e.target.value }))} options={(userData ?? []).map((u:any) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))} />
            <Select label={t.dept} icon={Zap} value={form.department} onChange={(e: any) => setForm(f => ({ ...f, department: e.target.value }))} options={['ENGINEERING','FINANCE','HR','MARKETING','OPERATIONS'].map(d => ({value:d, label:d}))} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Input label={isRtl ? 'تاريخ البدء' : 'Deployment Date'} icon={Calendar} type="date" value={form.startDate} onChange={(e: any) => setForm(f => ({ ...f, startDate: e.target.value }))} />
            <Input label={isRtl ? 'تاريخ الانتهاء' : 'Succession Date'} icon={Calendar} type="date" value={form.endDate} onChange={(e: any) => setForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>

          <Input label={t.budget} icon={DollarSign} type="number" value={form.budget} onChange={(e: any) => setForm(f => ({ ...f, budget: e.target.value }))} />
          
          <div className="flex justify-end gap-4 mt-12 py-6 border-t border-white/5">
            <button className="clean-btn-secondary px-10" onClick={() => setEditOpen(false)}>{t.cancel}</button>
            <button className="clean-btn-primary px-10" onClick={() => saveMutation.mutate()}>{t.save}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
