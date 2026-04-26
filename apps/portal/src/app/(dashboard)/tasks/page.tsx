'use client';

import { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Search, Plus, Filter, Zap } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

import { getTasks, createTask } from '@/lib/actions/tasks';
import { getUsers } from '@/lib/actions/users';
import { getProjects } from '@/lib/actions/projects';
import { requestExtension } from '@/lib/actions/extensions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const T = {
  ar: {
    tasks: 'إدارة المهام', tasksSub: 'تتبع سير العمليات اليومية والأولويات',
    search: 'بحث في المهام...', allPriority: 'كل الأولويات',
    total: 'إجمالي المهام', inProgress: 'قيد التنفيذ', completed: 'مكتملة', overdue: 'متأخرة',
    newTask: 'مهمة جديدة', title: 'عنوان المهمة', desc: 'الوصف',
    priority: 'الأولوية', assignee: 'المكلف بها', project: 'المشروع',
    save: 'حفظ المهمة', cancel: 'إلغاء',
  },
  en: {
    tasks: 'Task Command', tasksSub: 'Track daily operations and priority assignments',
    search: 'Search tasks...', allPriority: 'All Priorities',
    total: 'Total Tasks', inProgress: 'In Progress', completed: 'Completed', overdue: 'Overdue',
    newTask: 'New Task', title: 'Task Title', desc: 'Description',
    priority: 'Priority', assignee: 'Assignee', project: 'Project',
    save: 'Save Task', cancel: 'Cancel',
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

  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', priority: 'MEDIUM',
    projectId: '', assigneeId: '', dueDate: ''
  });

  const [extModal, setExtModal] = useState<any>(null); // Stores task object
  const [extForm, setExtForm] = useState({ date: '', reason: '' });
  const [requesting, setRequesting] = useState(false);

  const { data: tasksData } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await getTasks();
      return res.data || [];
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await getUsers({});
      return res.data?.items || [];
    },
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await getProjects();
      return res.data || [];
    },
  });

  const handleCreate = async () => {
    if (!form.title || !form.projectId) {
      toast.error('Title and Project are required');
      return;
    }
    setSaving(true);
    const res = await createTask(form);
    if (res.success) {
      toast.success('Task deployed');
      setIsModalOpen(false);
      setForm({ title: '', description: '', priority: 'MEDIUM', projectId: '', assigneeId: '', dueDate: '' });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } else {
      toast.error(res.message || 'Failed to deploy task');
    }
    setSaving(false);
  };

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
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
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
            <button 
                onClick={() => setExtModal(task)}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-white/5 text-slate-500 hover:text-amber-400 transition-all"
            >
                <Clock size={14} />
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* New Task Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={t.newTask}>
        <div className="space-y-5 pt-2">
          <Input label={t.title} value={form.title} onChange={(e: any) => setForm({...form, title: e.target.value})} />
          <Input label={t.desc} value={form.description} onChange={(e: any) => setForm({...form, description: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label={t.priority} 
              value={form.priority} 
              options={['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => ({ value: p, label: p }))}
              onChange={(e: any) => setForm({...form, priority: e.target.value})}
            />
             <Input label="Due Date" type="date" value={form.dueDate} onChange={(e: any) => setForm({...form, dueDate: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select 
              label={t.project} 
              value={form.projectId} 
              options={projectsData?.map((p: any) => ({ value: p.id, label: p.name })) || []}
              onChange={(e: any) => setForm({...form, projectId: e.target.value})}
            />
            <Select 
              label={t.assignee} 
              value={form.assigneeId} 
              options={usersData?.map((u: any) => ({ value: u.id, label: `${u.firstName} ${u.lastName} (${u.employeeNumber})` })) || []}
              onChange={(e: any) => setForm({...form, assigneeId: e.target.value})}
            />
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/5">
            <button className="px-6 py-3 rounded-xl bg-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10" onClick={() => setIsModalOpen(false)}>
              {t.cancel}
            </button>
            <button 
              className="px-10 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 disabled:opacity-50"
              onClick={handleCreate}
              disabled={saving}
            >
              {saving ? '...' : t.save}
            </button>
          </div>
        </div>
      </Modal>

      {/* Extension Modal */}
      <Modal open={!!extModal} onClose={() => setExtModal(null)} title="Request Extension">
          <div className="space-y-5 pt-2">
              <p className="text-xs text-slate-400">Requesting extension for: <span className="text-white font-bold">{extModal?.title}</span></p>
              <Input label="Requested New Date" type="date" value={extForm.date} onChange={(e: any) => setExtForm({...extForm, date: e.target.value})} />
              <Input label="Reason for Extension" value={extForm.reason} onChange={(e: any) => setExtForm({...extForm, reason: e.target.value})} />
              <div className="flex justify-end gap-3 mt-8">
                  <button className="px-6 py-3 rounded-xl bg-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest" onClick={() => setExtModal(null)}>Cancel</button>
                  <button 
                    disabled={requesting}
                    className="px-10 py-3 rounded-xl bg-amber-400 text-black text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 disabled:opacity-50"
                    onClick={async () => {
                        if (!extModal) return;
                        setRequesting(true);
                        const res = await requestExtension(extModal.id, extForm.date, extForm.reason);
                        if (res.success) {
                            toast.success('Request sent to manager');
                            setExtModal(null);
                        } else {
                            toast.error(res.message || 'Failed to send request');
                        }
                        setRequesting(false);
                    }}
                  >
                      {requesting ? '...' : 'Send Request'}
                  </button>
              </div>
          </div>
      </Modal>
    </motion.div>
  );
}
