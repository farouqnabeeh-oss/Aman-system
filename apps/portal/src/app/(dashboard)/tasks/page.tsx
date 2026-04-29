'use client';

import { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Search, Plus, Filter, Zap, Trash2, Edit2, ExternalLink } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

import { getTasks, createTask, updateTask, deleteTask } from '@/lib/actions/tasks';
import { getUsers } from '@/lib/actions/users';
import { getProjects } from '@/lib/actions/projects';
import { requestExtension } from '@/lib/actions/extensions';
import { getEntityLogs } from '@/lib/actions/audit';
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
    noTasks: 'لا يوجد مهام مطابقة للبحث',
    deleteConfirm: 'هل أنت متأكد من حذف المهمة؟',
  },
  en: {
    tasks: 'Task Command', tasksSub: 'Track daily operations and priority assignments',
    search: 'Search tasks...', allPriority: 'All Priorities',
    total: 'Total Tasks', inProgress: 'In Progress', completed: 'Completed', overdue: 'Overdue',
    newTask: 'New Task', title: 'Task Title', desc: 'Description',
    priority: 'Priority', assignee: 'Assignee', project: 'Project',
    save: 'Save Task', cancel: 'Cancel',
    noTasks: 'No tasks found matching your search',
    deleteConfirm: 'Are you sure you want to delete this task?',
  }
};

const priorityColor: Record<string, string> = {
  CRITICAL: 'text-rose-600 bg-rose-50 border-rose-100',
  HIGH: 'text-amber-600 bg-amber-50 border-amber-100',
  MEDIUM: 'text-blue-600 bg-blue-50 border-blue-100',
  LOW: 'text-slate-500 bg-slate-50 border-slate-200',
};

const statusMap: Record<string, { icon: any, label: string, color: string }> = {
  TODO: { icon: Clock, label: 'Todo', color: 'text-slate-400' },
  IN_PROGRESS: { icon: Zap, label: 'Progress', color: 'text-blue-500' },
  IN_REVIEW: { icon: AlertCircle, label: 'Review', color: 'text-amber-500' },
  DONE: { icon: CheckCircle, label: 'Done', color: 'text-emerald-500' },
};

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.04 } } };

export default function TasksPage() {
  const { language } = useUIStore();
  const t = T[language as keyof typeof T] || T.en;
  const isRtl = language === 'ar';
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    title: '', description: '', priority: 'MEDIUM',
    projectId: '', assigneeId: '', dueDate: '', status: 'TODO'
  });

  const [extModal, setExtModal] = useState<any>(null);
  const [extForm, setExtForm] = useState({ date: '', reason: '' });
  const [requesting, setRequesting] = useState(false);

  const { data: tasksData = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await getTasks();
      return res.data || [];
    },
  });

  const { data: usersData = [] } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      const res = await getUsers({ limit: 100 });
      return res.data?.items || [];
    },
  });

  const { data: projectsData = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await getProjects();
      return res.data || [];
    },
  });

  const handleSave = async () => {
    if (!form.title || !form.projectId) {
      toast.error('Title and Project are required');
      return;
    }
    setSaving(true);
    
    const payload = {
        ...form,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined
    };

    const res = editingId 
        ? await updateTask(editingId, payload)
        : await createTask(payload);

    if (res.success) {
      toast.success(editingId ? 'Task updated' : 'Task deployed');
      setIsModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    } else {
      toast.error(res.error || 'Operation failed');
    }
    setSaving(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ title: '', description: '', priority: 'MEDIUM', projectId: '', assigneeId: '', dueDate: '', status: 'TODO' });
  };

  const handleEdit = (task: any) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      projectId: task.projectId,
      assigneeId: task.assigneeId || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      status: task.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return;
    const res = await deleteTask(id);
    if (res.success) {
      toast.success('Task removed');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
      const res = await updateTask(id, { status });
      if (res.success) {
          toast.success('Status synced');
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      }
  };

  const filtered = tasksData.filter((task: any) => {
    const matchesSearch = task.title?.toLowerCase()?.includes(search.toLowerCase()) || 
                         task.projectName?.toLowerCase()?.includes(search.toLowerCase()) ||
                         task.assigneeName?.toLowerCase()?.includes(search.toLowerCase());
    const matchesPriority = priorityFilter ? task.priority === priorityFilter : true;
    return matchesSearch && matchesPriority;
  });

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader
        title={t.tasks}
        description={t.tasksSub}
        action={
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand/90 transition-all shadow-lg shadow-brand/10"
          >
            <Plus size={14} /> {t.newTask}
          </button>
        }
      />

      <motion.div variants={fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t.total} value={tasksData.length} icon={<Filter size={18} />} />
        <StatCard label={t.inProgress} value={tasksData.filter((t: any) => t.status === 'IN_PROGRESS').length} icon={<Zap size={18} />} delta="Live" trend="up" />
        <StatCard label={t.completed} value={tasksData.filter((t: any) => t.status === 'DONE').length} icon={<CheckCircle size={18} />} />
        <StatCard label={t.overdue} value={tasksData.filter((t: any) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length} icon={<AlertCircle size={18} />} trend="down" delta="Priority" />
      </motion.div>

      <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[280px] flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus-within:border-brand/40 transition-all">
          <Search size={18} className="text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search} className="bg-transparent text-sm text-slate-900 outline-none w-full font-medium placeholder:text-slate-400" />
        </div>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-[10px] font-black text-slate-500 outline-none uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-all">
          <option value="" className="bg-white">{t.allPriority}</option>
          {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => <option key={p} value={p} className="bg-white">{p}</option>)}
        </select>
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
        {isLoading ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="glass-card h-20 animate-pulse bg-white/[0.02] border-white/5" />)
        ) : filtered.length === 0 ? (
            <div className="py-20 text-center glass-card border-dashed border-slate-200 bg-white">
                <Clock size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.noTasks}</p>
            </div>
        ) : filtered.map((task: any) => {
          const Status = statusMap[task.status] || statusMap.TODO;
          return (
            <motion.div key={task.id} variants={fadeIn} className="glass-card !p-5 flex items-center gap-5 hover:border-brand/20 hover:bg-slate-50 transition-all group relative overflow-hidden">
              <div className="flex-shrink-0 relative">
                  <div className={clsx("w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center transition-all group-hover:scale-110 shadow-sm", Status.color)}>
                    <Status.icon size={18} />
                  </div>
              </div>
              <div className="flex-1 min-w-0" onClick={() => { setSelectedTask(task); setDetailModalOpen(true); }}>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1 truncate cursor-pointer hover:text-brand transition-colors">{task.title}</p>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{task.projectName}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{task.assigneeName || 'Unassigned'}</span>
                </div>
              </div>
              
              <div className="hidden md:flex flex-col items-end gap-1 px-4">
                  <span className={clsx('text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-[0.2em] border', priorityColor[task.priority])}>
                    {task.priority}
                  </span>
                  {task.dueDate && (
                      <span className={clsx(
                          "text-[9px] font-black uppercase tracking-widest",
                          new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-rose-500' : 'text-slate-400'
                      )}>
                          {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                  )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <select 
                    onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[9px] font-black text-slate-500 uppercase outline-none cursor-pointer hover:text-brand"
                    value={task.status}
                >
                    {Object.keys(statusMap).map(s => <option key={s} value={s} className="bg-white text-slate-900">{s}</option>)}
                </select>
                <button onClick={() => handleEdit(task)} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-brand transition-all"><Edit2 size={16} /></button>
                <button onClick={() => { setSelectedTask(task); setDetailModalOpen(true); }} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-brand transition-all"><ExternalLink size={16} /></button>
                <button onClick={() => handleDelete(task.id)} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Task Modal (Create/Edit) */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Task' : t.newTask}>
        <div className="space-y-6 pt-2">
          <Input label={t.title} value={form.title} onChange={(e: any) => setForm({...form, title: e.target.value})} placeholder="What needs to be done?" />
          <Input label={t.desc} value={form.description} onChange={(e: any) => setForm({...form, description: e.target.value})} placeholder="Provide context..." />
          
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
              options={projectsData.map((p: any) => ({ value: p.id, label: p.name }))}
              onChange={(e: any) => setForm({...form, projectId: e.target.value})}
              placeholder="Select Project"
            />
            <Select 
              label={t.assignee} 
              value={form.assigneeId} 
              options={usersData.map((u: any) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))}
              onChange={(e: any) => setForm({...form, assigneeId: e.target.value})}
              placeholder="Assign To"
            />
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
            <button className="px-6 py-3 rounded-xl bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-200" onClick={() => setIsModalOpen(false)}>
              {t.cancel}
            </button>
            <button 
              className="px-10 py-3 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 disabled:opacity-50"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Syncing...' : (editingId ? 'Save Changes' : t.save)}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="Task Intelligence & Audit">
        <TaskDetailView task={selectedTask} isRtl={isRtl} t={t} onClose={() => setDetailModalOpen(false)} />
      </Modal>
    </motion.div>
  );
}

function TaskDetailView({ task, isRtl, t, onClose }: any) {
    const [tab, setTab] = useState<'info' | 'activity'>('info');
    const { data: logs = [], isLoading } = useQuery({
        queryKey: ['entity-logs', 'Task', task?.id],
        queryFn: async () => { const res = await getEntityLogs('Task', task.id); return res.data || []; },
        enabled: !!task && tab === 'activity'
    });

    if (!task) return null;

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
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.title}</p>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{task.title}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.project}</p>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{task.projectName}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.assignee}</p>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{task.assigneeName || 'Unassigned'}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.priority}</p>
                                <p className={clsx("text-sm font-black uppercase tracking-tight", priorityColor[task.priority]?.split(' ')[0])}>{task.priority}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{task.status}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.desc}</p>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{task.description || 'No context provided'}</p>
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
