'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FolderKanban, Search, Plus, Target, Users, Calendar, Zap } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '@/components/ui/States';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

import { getProjects, createProject } from '@/lib/actions/projects';

const T = {
  ar: {
    projects: 'إدارة العمليات', projectsSub: 'متابعة المشاريع الاستراتيجية والجدول الزمني',
    newProject: 'مشروع جديد', search: 'بحث عن مشروع...', allStatus: 'كل الحالات',
    total: 'إجمالي المشاريع', active: 'المشاريع النشطة', completed: 'المشاريع المكتملة',
    tasks: 'المهام', progress: 'التقدم',
  },
  en: {
    projects: 'Project Hub', projectsSub: 'Track strategic projects and operational timelines',
    newProject: 'New Project', search: 'Search project...', allStatus: 'All Statuses',
    total: 'Total Projects', active: 'Active Projects', completed: 'Completed',
    tasks: 'Tasks', progress: 'Progress',
  }
};

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.05 } } };

const statusColor: Record<string, string> = {
  ACTIVE: 'text-emerald-400 bg-emerald-500/10',
  PLANNING: 'text-blue-400 bg-blue-500/10',
  ON_HOLD: 'text-amber-400 bg-amber-500/10',
  COMPLETED: 'text-slate-400 bg-white/5',
};

export default function ProjectsPage() {
  const { language } = useUIStore();
  const t = T[language as keyof typeof T] || T.en;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await getProjects();
      return res.data || [];
    },
  });

  const SAMPLE_PROJECTS = projectsData || [];

  const filtered = SAMPLE_PROJECTS.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader
        title={t.projects}
        description={t.projectsSub}
        action={
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
            <Plus size={14} /> {t.newProject}
          </button>
        }
      />

      <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label={t.total} value={SAMPLE_PROJECTS.length} icon={<FolderKanban size={20} />} />
        <StatCard label={t.active} value={SAMPLE_PROJECTS.filter(p => p.status === 'ACTIVE').length} icon={<Zap size={20} />} delta="Live" trend="up" />
        <StatCard label={t.completed} value={SAMPLE_PROJECTS.filter(p => p.status === 'COMPLETED').length} icon={<Target size={20} />} />
      </motion.div>

      <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[280px] flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 focus-within:border-white/20 transition-all">
          <Search size={16} className="text-slate-600" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search} className="bg-transparent text-sm text-white outline-none w-full font-medium placeholder:text-slate-600" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-[10px] font-black text-slate-400 outline-none uppercase tracking-widest cursor-pointer">
          <option value="">{t.allStatus}</option>
          {['ACTIVE', 'PLANNING', 'ON_HOLD', 'COMPLETED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(p => (
          <motion.div key={p.id} variants={fadeIn} className="glass-card p-7 group hover:border-white/15 transition-all">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">{p.name}</h4>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{p.department}</p>
              </div>
              <span className={clsx('text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest', statusColor[p.status] || 'text-slate-400 bg-white/5')}>
                {p.status.replace('_', ' ')}
              </span>
            </div>

            <div className="mb-5">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-2">
                <span className="text-slate-600">{t.progress}</span>
                <span className="text-white">{p.progress}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full rounded-full bg-white" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-5 border-t border-white/5 text-[9px] font-black uppercase tracking-widest">
              <div><p className="text-slate-700 mb-0.5">{t.tasks}</p><p className="text-white">{p.tasksCount}</p></div>
              <div><p className="text-slate-700 mb-0.5">Manager</p><p className="text-white truncate">{p.managerName}</p></div>
              <div className="text-right"><p className="text-slate-700 mb-0.5">Budget</p><p className="text-white">${(Number(p.budget || 0) / 1000).toFixed(0)}k</p></div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
