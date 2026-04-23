'use client';

import { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Search, Plus, Filter, Zap } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '@/components/ui/States';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

import { getTasks, createTask } from '@/lib/actions/tasks';
import { useQuery } from '@tanstack/react-query';

const T = {
  ar: {
    tasks: 'إدارة المهام', tasksSub: 'تتبع سير العمليات اليومية والأولويات',
    search: 'بحث في المهام...', allPriority: 'كل الأولويات',
    total: 'إجمالي المهام', inProgress: 'قيد التنفيذ', completed: 'مكتملة', overdue: 'متأخرة',
    newTask: 'مهمة جديدة',
  },
  en: {
    tasks: 'Task Command', tasksSub: 'Track daily operations and priority assignments',
    search: 'Search tasks...', allPriority: 'All Priorities',
    total: 'Total Tasks', inProgress: 'In Progress', completed: 'Completed', overdue: 'Overdue',
    newTask: 'New Task',
  }
};

const priorityColor: Record<string, string> = {
  CRITICAL: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  HIGH: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  MEDIUM: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  LOW: 'text-slate-400 bg-white/5 border-white/10',
};

const statusIcon: Record<string, any> = {
  TODO: <Clock size={14} className="text-slate-500" />,
  IN_PROGRESS: <Zap size={14} className="text-blue-400" />,
  IN_REVIEW: <AlertCircle size={14} className="text-amber-400" />,
  DONE: <CheckCircle size={14} className="text-emerald-400" />,
};

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.04 } } };

export default function TasksPage() {
  const { language } = useUIStore();
  const t = T[language as keyof typeof T] || T.en;
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const { data: tasksData } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await getTasks();
      return res.data || [];
    },
  });

  const SAMPLE_TASKS = tasksData || [];

  const filtered = SAMPLE_TASKS.filter(task => {
    if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (priorityFilter && task.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader
        title={t.tasks}
        description={t.tasksSub}
        action={
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
            <Plus size={14} /> {t.newTask}
          </button>
        }
      />

      <motion.div variants={fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t.total} value={SAMPLE_TASKS.length} icon={<Filter size={18} />} />
        <StatCard label={t.inProgress} value={SAMPLE_TASKS.filter(t => t.status === 'IN_PROGRESS').length} icon={<Zap size={18} />} delta="Active" trend="up" />
        <StatCard label={t.completed} value={SAMPLE_TASKS.filter(t => t.status === 'DONE').length} icon={<CheckCircle size={18} />} />
        <StatCard label={t.overdue} value={1} icon={<AlertCircle size={18} />} trend="down" delta="Alert" />
      </motion.div>

      <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[280px] flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 focus-within:border-white/20 transition-all">
          <Search size={16} className="text-slate-600" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search} className="bg-transparent text-sm text-white outline-none w-full font-medium placeholder:text-slate-600" />
        </div>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-[10px] font-black text-slate-400 outline-none uppercase tracking-widest cursor-pointer">
          <option value="">{t.allPriority}</option>
          {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
        {filtered.map(task => (
          <motion.div key={task.id} variants={fadeIn} className="glass-card !p-5 flex items-center gap-4 hover:border-white/15 transition-all group">
            <div className="flex-shrink-0">{statusIcon[task.status] || statusIcon.TODO}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{task.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{task.projectName} · {task.assigneeName}</p>
            </div>
            <span className={clsx('text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border flex-shrink-0', priorityColor[task.priority])}>
              {task.priority}
            </span>
            <div className="text-[10px] font-bold text-slate-600 flex-shrink-0 hidden sm:block">
              <Clock size={10} className="inline mr-1" />
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
