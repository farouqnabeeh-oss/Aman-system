'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
    FolderKanban, Search, Plus, Target, Users, 
    Calendar, Zap, Trash2, ExternalLink, Layers, 
    Edit2 
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '@/components/ui/States';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import toast from 'react-hot-toast';

import { getProjects, createProject, updateProject, deleteProject } from '@/lib/actions/projects';
import { getUsers } from '@/lib/actions/users';
import { getEntityLogs } from '@/lib/actions/audit';

const T = {
  ar: {
    projects: 'إدارة العمليات', projectsSub: 'متابعة المشاريع الاستراتيجية والجدول الزمني',
    newProject: 'مشروع جديد', search: 'بحث عن مشروع...', allStatus: 'كل الحالات',
    total: 'إجمالي المشاريع', active: 'المشاريع النشطة', completed: 'المشاريع المكتملة',
    tasks: 'المهام', progress: 'التقدم',
    name: 'اسم المشروع', description: 'الوصف', department: 'القسم', manager: 'مدير المشروع', budget: 'الميزانية',
    startDate: 'تاريخ البدء', endDate: 'تاريخ الانتهاء', save: 'حفظ المشروع', cancel: 'إلغاء',
    desc: 'الوصف', status: 'الحالة',
    noProjects: 'لا يوجد مشاريع مطابقة للبحث',
    deleteConfirm: 'هل أنت متأكد من حذف المشروع؟ سيتم حذف جميع المهام المتعلقة به!',
  },
  en: {
    projects: 'Project Hub', projectsSub: 'Track strategic projects and operational timelines',
    newProject: 'New Project', search: 'Search project...', allStatus: 'All Statuses',
    total: 'Total Projects', active: 'Active Projects', completed: 'Completed',
    tasks: 'Tasks', progress: 'Progress',
    name: 'Project Name', description: 'Description', department: 'Department', manager: 'Project Manager', budget: 'Budget',
    startDate: 'Start Date', endDate: 'End Date', save: 'Save Project', cancel: 'Cancel',
    desc: 'Description', status: 'Status',
    noProjects: 'No projects found matching your search',
    deleteConfirm: 'Are you sure you want to delete this project? All related tasks will be removed!',
  }
};

const statusColors: Record<string, string> = {
  PLANNING: 'text-slate-500 bg-white/5 border-white/10',
  IN_PROGRESS: 'text-brand bg-brand/10 border-brand/20',
  ON_HOLD: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  COMPLETED: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
};

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.04 } } };

export default function ProjectsPage() {
  const { language } = useUIStore();
  const t = T[language as keyof typeof T] || T.en;
  const isRtl = language === 'ar';
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    managerId: '', 
    status: 'PLANNING', 
    department: 'MANAGEMENT',
    customDept: '',
    budget: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await getProjects();
      return res.data || [];
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      const res = await getUsers({ limit: 100 });
      return res.data?.items || [];
    }
  });

  const handleSave = async () => {
    if (!form.name || !form.managerId) {
      toast.error('Name and Manager are required');
      return;
    }
    setSaving(true);
    
    const finalDept = form.department === 'OTHER' ? form.customDept : form.department;
    const payload = {
        ...form,
        department: finalDept,
        budget: Number(form.budget),
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined
    };

    const res = editingId 
        ? await updateProject(editingId, payload)
        : await createProject(payload);

    if (res.success) {
      toast.success(editingId ? (isRtl ? 'تم تحديث المشروع' : 'Project updated') : (isRtl ? 'تم إنشاء المشروع' : 'Project initiated'));
      setIsModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    } else {
      toast.error(res.error || 'Operation failed');
    }
    setSaving(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ 
        name: '', description: '', managerId: '', status: 'PLANNING', 
        department: 'MANAGEMENT', customDept: '', budget: '', 
        startDate: new Date().toISOString().split('T')[0], endDate: '' 
    });
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || '',
      managerId: p.managerId || '',
      status: p.status,
      department: ['MANAGEMENT', 'MARKETING', 'ENGINEERING', 'SOCIAL_MEDIA', 'HR', 'FINANCE'].includes(p.department) ? p.department : 'OTHER',
      customDept: ['MANAGEMENT', 'MARKETING', 'ENGINEERING', 'SOCIAL_MEDIA', 'HR', 'FINANCE'].includes(p.department) ? '' : (p.department || ''),
      budget: String(p.budget || ''),
      startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '',
      endDate: p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return;
    const res = await deleteProject(id);
    if (res.success) {
      toast.success('Project archived');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  };

  const filtered = projects.filter((p: any) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.manager?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    p.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader
        title={t.projects}
        description={t.projectsSub}
        action={
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand/90 transition-all shadow-lg shadow-brand/20"
          >
            <Plus size={14} /> {t.newProject}
          </button>
        }
      />

      <motion.div variants={fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t.total} value={projects.length} icon={<Layers size={18} />} />
        <StatCard label={t.active} value={projects.filter((p: any) => p.status === 'IN_PROGRESS').length} icon={<Zap size={18} />} delta="Live" trend="up" />
        <StatCard label={t.completed} value={projects.filter((p: any) => p.status === 'COMPLETED').length} icon={<Target size={18} />} />
        <StatCard label={isRtl ? 'الميزانية الإجمالية' : 'Total Budget'} value={`$${projects.reduce((acc: number, p: any) => acc + Number(p.budget || 0), 0).toLocaleString()}`} icon={<Calendar size={18} />} />
      </motion.div>

      <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[280px] flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus-within:border-brand/40 transition-all shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search} className="bg-transparent text-sm text-slate-900 outline-none w-full font-medium placeholder:text-slate-400" />
        </div>
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
            Array(6).fill(0).map((_, i) => <div key={i} className="glass-card h-52 animate-pulse bg-white/[0.02] border-white/5" />)
        ) : filtered.length === 0 ? (
            <div className="col-span-full py-20 text-center glass-card border-dashed border-slate-200 bg-white shadow-sm">
                <FolderKanban size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.noProjects}</p>
            </div>
        ) : filtered.map((p: any) => (
          <motion.div key={p.id} variants={fadeIn} className="glass-card !p-8 border-slate-100 bg-white hover:bg-slate-50 transition-all group relative overflow-hidden shadow-sm">
            <div className="flex justify-between items-start mb-8">
              <div className="max-w-[70%]">
                <h4 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight truncate" title={p.name}>{p.name}</h4>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-brand uppercase tracking-widest">{p.department}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{p.manager?.firstName} {p.manager?.lastName}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                  <span className={clsx('text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border', statusColors[p.status] || 'text-slate-500 bg-slate-50 border-slate-100')}>
                    {p.status}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleEdit(p)} className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:text-brand transition-all shadow-sm"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:text-rose-500 transition-all shadow-sm"><Trash2 size={14} /></button>
                  </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                  <span className="text-slate-400">{t.progress}</span>
                  <span className="text-slate-900">{p.progress || 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress || 0}%` }} className="h-full bg-brand" />
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-[10px] font-black text-brand">
                        {p.tasksCount || 0}
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Tasks</span>
                </div>
                <button onClick={() => { setSelectedProject(p); setDetailModalOpen(true); }} className="text-[9px] font-black text-slate-900 uppercase tracking-widest hover:text-brand transition-all flex items-center gap-1">
                    {isRtl ? 'التفاصيل والسجل' : 'Details & Log'} <ExternalLink size={10} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Project Modal (Create/Edit) */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? (isRtl ? 'تعديل المشروع' : 'Edit Project') : t.newProject}>
        <div className="space-y-6 pt-2">
          <Input label={t.name} value={form.name} onChange={(e: any) => setForm({...form, name: e.target.value})} placeholder="Project title..." />
          <Input label={t.desc} value={form.description} onChange={(e: any) => setForm({...form, description: e.target.value})} placeholder="Project description..." />
          
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label={t.manager} 
              value={form.managerId} 
              options={users.map((u: any) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))}
              onChange={(e: any) => setForm({...form, managerId: e.target.value})}
              placeholder="Assign Manager"
            />
            <Select 
              label={t.department} 
              value={form.department} 
              options={[
                  { value: 'MANAGEMENT', label: 'MANAGEMENT' },
                  { value: 'MARKETING', label: 'MARKETING' },
                  { value: 'ENGINEERING', label: 'ENGINEERING' },
                  { value: 'SOCIAL_MEDIA', label: 'SOCIAL_MEDIA' },
                  { value: 'HR', label: 'HR' },
                  { value: 'FINANCE', label: 'FINANCE' },
                  { value: 'OTHER', label: isRtl ? 'قسم آخر' : 'Other Dept' }
              ]}
              onChange={(e: any) => setForm({...form, department: e.target.value})}
            />
          </div>

          {form.department === 'OTHER' && (
              <Input label={isRtl ? 'اسم القسم' : 'Dept Name'} value={form.customDept} onChange={(e: any) => setForm({...form, customDept: e.target.value})} />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input label={t.budget} type="number" value={form.budget} onChange={(e: any) => setForm({...form, budget: e.target.value})} placeholder="Allocated budget..." />
             <Select 
              label={t.status} 
              value={form.status} 
              options={['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'].map(s => ({ value: s, label: s }))}
              onChange={(e: any) => setForm({...form, status: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label={t.startDate} type="date" value={form.startDate} onChange={(e: any) => setForm({...form, startDate: e.target.value})} />
            <Input label={t.endDate} type="date" value={form.endDate} onChange={(e: any) => setForm({...form, endDate: e.target.value})} />
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
            <button className="px-6 py-3 rounded-xl bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100" onClick={() => setIsModalOpen(false)}>
              {t.cancel}
            </button>
            <button 
              className="px-10 py-3 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 disabled:opacity-50"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Syncing...' : (editingId ? (isRtl ? 'حفظ التغييرات' : 'Save Changes') : t.save)}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} title={isRtl ? 'تفاصيل المشروع والسجل' : 'Project Intelligence & Audit'}>
        <ProjectDetailView project={selectedProject} isRtl={isRtl} t={t} onClose={() => setDetailModalOpen(false)} />
      </Modal>
    </motion.div>
  );
}

function ProjectDetailView({ project, isRtl, t, onClose }: any) {
    const [tab, setTab] = useState<'info' | 'activity'>('info');
    const { data: logs = [], isLoading } = useQuery({
        queryKey: ['entity-logs', 'Project', project?.id],
        queryFn: async () => { const res = await getEntityLogs('Project', project.id); return res.data || []; },
        enabled: !!project && tab === 'activity'
    });

    if (!project) return null;

    return (
        <div className="space-y-8 pt-4">
            <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
                <button onClick={() => setTab('info')} className={clsx('flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all', tab === 'info' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600')}>Information</button>
                <button onClick={() => setTab('activity')} className={clsx('flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all', tab === 'activity' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600')}>Audit Log</button>
            </div>

            <AnimatePresence mode="wait">
                {tab === 'info' ? (
                    <motion.div key="info" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.name}</p>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{project.name}</h3>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.desc}</p>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{project.description || (isRtl ? 'لا يوجد وصف' : 'No description provided')}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.manager}</p>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{project.manager?.firstName} {project.manager?.lastName}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.department}</p>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{project.department}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.budget}</p>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">${Number(project.budget || 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.status}</p>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{project.status}</p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="activity" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                        {isLoading ? (
                            Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />)
                        ) : logs.length === 0 ? (
                            <div className="py-20 text-center text-slate-300 uppercase tracking-[0.3em] text-[10px] font-black">No Audit Data Found</div>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                                {logs.map((log: any) => (
                                    <div key={log.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:text-brand transition-colors">{log.user?.[0]}</div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{log.user} <span className="text-slate-400 font-normal">{log.action.toLowerCase()}</span></p>
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
                <button className="px-8 py-3 rounded-xl bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-200 transition-all" onClick={onClose}>
                    {isRtl ? 'إغلاق' : 'Dismiss'}
                </button>
            </div>
        </div>
    );
}
