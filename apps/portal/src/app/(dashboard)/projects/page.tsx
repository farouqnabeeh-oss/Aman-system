'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    FolderKanban, Search, Plus, Target, Users, 
    Calendar, Zap, Trash2, ExternalLink, Layers, 
    MoreVertical, Edit2 
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
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    managerId: '', 
    status: 'PLANNING', 
    department: 'MANAGEMENT',
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

  const handleCreate = async () => {
    if (!form.name || !form.managerId) {
      toast.error('Name and Manager are required');
      return;
    }
    setSaving(true);
    
    // Ensure dates are ISO strings for the schema
    const res = await createProject({
        ...form,
        budget: Number(form.budget),
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined
    });

    if (res.success) {
      toast.success(isRtl ? 'تم إنشاء المشروع' : 'Project initiated');
      setIsModalOpen(false);
      setForm({ name: '', description: '', managerId: '', status: 'PLANNING', department: 'MANAGEMENT', budget: '', startDate: new Date().toISOString().split('T')[0], endDate: '' });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } else {
      toast.error(res.message || 'Operation failed');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return;
    const res = await deleteProject(id);
    if (res.success) {
      toast.success('Project archived');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  };

  const filtered = projects.filter((p: any) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.manager?.firstName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader
        title={t.projects}
        description={t.projectsSub}
        action={
          <button 
            onClick={() => setIsModalOpen(true)}
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
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
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
                <button className="text-[9px] font-black text-slate-900 uppercase tracking-widest hover:text-brand transition-all flex items-center gap-1">
                    {isRtl ? 'التفاصيل' : 'Details'} <ExternalLink size={10} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* New Project Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={t.newProject}>
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
              options={['MANAGEMENT', 'MARKETING', 'ENGINEERING', 'SOCIAL_MEDIA', 'HR', 'FINANCE'].map(s => ({ value: s, label: s }))}
              onChange={(e: any) => setForm({...form, department: e.target.value})}
            />
          </div>

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
              onClick={handleCreate}
              disabled={saving}
            >
              {saving ? 'Creating...' : t.save}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
