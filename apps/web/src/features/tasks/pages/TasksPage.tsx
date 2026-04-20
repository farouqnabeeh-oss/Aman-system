import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Calendar, Search, LayoutGrid, List as ListIcon, CheckCircle2, Circle, Clock, AlertCircle, Edit2, Trash2, Target, Layers, Users, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../../lib/axios';
import { useUIStore } from '@/store/ui.store';
import { PageHeader } from '../../../components/ui/States';
import { Skeleton } from '../../../components/ui/Skeleton';
import { statusBadge, priorityBadge } from '../../../components/ui/Badge';
import { Table } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { Input, Select, Textarea } from '../../../components/ui/Input';
import { useAuthStore } from '../../../store/auth.store';
import toast from 'react-hot-toast';

const TRANSLATIONS = {
  ar: {
    tasks: 'إدارة المهام',
    tasksSub: 'نظام تتبع الإنتاجية وإنجاز المشاريع',
    newTask: 'مهمة جديدة',
    editTask: 'تعديل المهمة',
    search: 'بحث في المهام...',
    myTasks: 'مهامي',
    allPriorities: 'كل الأولويات',
    kanban: 'لوحة التحكم',
    list: 'القائمة',
    save: 'حفظ المهمة',
    cancel: 'إلغاء',
    todo: 'المتبقية',
    inProgress: 'قيد الإنجاز',
    inReview: 'المراجعة',
    done: 'تمت بنجاح',
    empty: 'لا توجد مهام حالياً',
    assignee: 'المُكلف',
    dueDate: 'الموعد النهائي',
    project: 'المشروع المرتبط',
    priority: 'الأولوية',
    status: 'حالة المهمة',
  },
  en: {
    tasks: 'Task Stream',
    tasksSub: 'Enterprise productivity and project delivery system',
    newTask: 'Create Task',
    editTask: 'Edit Task',
    search: 'Search project deliverables...',
    myTasks: 'My Assets',
    allPriorities: 'All Priorities',
    kanban: 'Flow',
    list: 'Archive',
    save: 'Apply Changes',
    cancel: 'Cancel',
    todo: 'Queue',
    inProgress: 'Active',
    inReview: 'Review',
    done: 'Success',
    empty: 'No tasks in stream',
    assignee: 'Assignee',
    dueDate: 'Deadline',
    project: 'Resource',
    priority: 'Urgency',
    status: 'Execution Status',
  }
};

const PRIORITY_OPT = (isRtl: boolean) => [
  { value: 'LOW', label: isRtl ? 'منخفضة' : 'Low' },
  { value: 'MEDIUM', label: isRtl ? 'متوسطة' : 'Medium' },
  { value: 'HIGH', label: isRtl ? 'عالية' : 'High' },
  { value: 'CRITICAL', label: isRtl ? 'طارئة' : 'Critical' },
];

export function TasksPage() {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const t = TRANSLATIONS[language];

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [priorityF, setPriorityF] = useState('');
  const [myTasks, setMyTasks] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', projectId: '', assigneeId: '', dueDate: '', status: 'TODO' });

  const STATUS_COLS = [
    { key: 'TODO',        label: t.todo,       icon: Circle,       color: 'text-slate-600' },
    { key: 'IN_PROGRESS', label: t.inProgress, icon: Clock,        color: 'text-white' },
    { key: 'IN_REVIEW',   label: t.inReview,   icon: AlertCircle,  color: 'text-white' },
    { key: 'DONE',        label: t.done,       icon: CheckCircle2, color: 'text-white' },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', search, priorityF, myTasks],
    queryFn: () => api.get<any>('/tasks', { params: { limit: 100, search: search || undefined, priority: priorityF || undefined, assigneeId: myTasks ? user?.id : undefined } }).then(r => r.data.data),
  });

  const { data: projects } = useQuery({ queryKey:['projects-list'], queryFn:()=>api.get<any>('/projects',{params:{limit:100}}).then(r=>r.data.data.items) });
  const { data: users } = useQuery({ queryKey:['users-list'], queryFn:()=>api.get<any>('/users',{params:{limit:100}}).then(r=>r.data.data.items) });

  const saveMutation = useMutation({
    mutationFn: () => editingId ? api.patch(`/tasks/${editingId}`, form) : api.post('/tasks', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); setEditOpen(false); toast.success('Success'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Deleted'); },
  });

  const handleEdit = (task: any) => {
    setEditingId(task.id);
    setForm({ title: task.title, description: task.description || '', priority: task.priority, projectId: task.projectId || '', assigneeId: task.assigneeId || '', dueDate: task.dueDate?.split('T')[0] || '', status: task.status });
    setEditOpen(true);
  };

  const tasks = data?.items ?? [];

  return (
    <div className="space-y-12">
      <PageHeader
        title={t.tasks}
        description={t.tasksSub}
        action={<button onClick={() => { setEditingId(null); setForm({ title: '', description: '', priority: 'MEDIUM', projectId: '', assigneeId: '', dueDate: '', status: 'TODO' }); setEditOpen(true); }} className="clean-btn-primary h-12 gap-2 text-xs uppercase tracking-widest"><Plus size={16} /> {t.newTask}</button>}
      />

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[280px] flex items-center gap-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl px-5 py-3 focus-within:border-white/20 transition-all">
           <Search size={16} className="text-slate-600" />
           <input value={search} onChange={(e: any) => setSearch(e.target.value)} placeholder={t.search} className="bg-transparent text-sm text-white outline-none w-full font-medium" />
        </div>
        
        <select value={priorityF} onChange={(e: any) => setPriorityF(e.target.value)} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-400 outline-none">
          <option value="">{t.allPriorities}</option>
          {PRIORITY_OPT(isRtl).map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>

        <button onClick={() => setMyTasks(t => !t)} className={clsx('px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all', myTasks ? 'bg-white text-black' : 'text-slate-500 hover:text-white hover:bg-white/5')}>
          {t.myTasks}
        </button>

        <div className="flex bg-white/5 rounded-2xl border border-white/10 p-1">
          <button onClick={() => setViewMode('kanban')} className={clsx('p-2.5 rounded-xl transition-all', viewMode === 'kanban' ? 'bg-white text-black' : 'text-slate-500 hover:text-white')}><LayoutGrid size={16}/></button>
          <button onClick={() => setViewMode('list')} className={clsx('p-2.5 rounded-xl transition-all', viewMode === 'list' ? 'bg-white text-black' : 'text-slate-500 hover:text-white')}><ListIcon size={16}/></button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">{[1,2,3,4].map(i => <Skeleton key={i} className="h-96 rounded-[2rem]" />)}</div>
      ) : viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {STATUS_COLS.map(col => {
             const colTasks = tasks.filter((t: any) => t.status === col.key);
             return (
               <div key={col.key} className="flex flex-col gap-8 min-h-[500px]">
                  <div className="flex items-center justify-between px-2">
                     <div className="flex items-center gap-3">
                        <col.icon size={12} className={col.color} />
                         <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{col.label}</span>
                     </div>
                     <span className="text-[10px] font-black text-slate-700 bg-white/5 px-2.5 py-1 rounded-lg">{colTasks.length}</span>
                  </div>
                  
                  <div className="space-y-4">
                     {colTasks.map((task: any) => (
                       <motion.div key={task.id} layout className="clean-card group !p-6 cursor-pointer hover:bg-white/[0.02]">
                          <div className="flex justify-between items-start mb-6">
                             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest truncate max-w-[120px]">{task.project?.name}</span>
                             {priorityBadge(task.priority)}
                          </div>
                          <h4 className="text-sm font-bold text-white leading-relaxed mb-8 group-hover:text-indigo-400 transition-colors" onClick={() => handleEdit(task)}>{task.title}</h4>
                          
                          <div className="flex items-center justify-between pt-6 border-t border-white/5">
                             {task.assignee ? (
                                <div className="flex items-center gap-2">
                                   <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[8px] font-black text-slate-500 uppercase tracking-tight">{task.assignee.firstName[0]}</div>
                                   <span className="text-[10px] font-bold text-slate-600">{task.assignee.firstName}</span>
                                </div>
                             ) : <div className="w-6 h-6 rounded-lg border border-dashed border-white/10" />}
                             
                             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(task)} className="p-1.5 rounded-lg text-slate-500 hover:text-white"><Edit2 size={12}/></button>
                                <button onClick={() => {if(confirm('Delete?')) deleteMutation.mutate(task.id)}} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500"><Trash2 size={12}/></button>
                             </div>
                          </div>
                       </motion.div>
                     ))}
                  </div>
               </div>
             );
           })}
        </div>
      ) : (
        <div className="clean-card !p-0 overflow-hidden">
           <Table columns={[
              { key: 'title', label: isRtl ? 'المهمة' : 'Task', render: (t: any) => <div className="flex flex-col"><span className="text-sm font-bold text-white">{t.title}</span><span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">{t.project?.name}</span></div> },
              { key: 'assignee', label: t.assignee, render: (t: any) => <span className="text-xs font-bold text-slate-400">{t.assignee?.firstName}</span> },
              { key: 'status', label: '', render: (t: any) => statusBadge(t.status) },
              { key: 'priority', label: '', render: (t: any) => priorityBadge(t.priority) },
              { key: 'actions', label: '', render: (t: any) => <div className="flex justify-end gap-2"><button onClick={() => handleEdit(t)} className="p-2 rounded-lg text-slate-600 hover:text-white"><Edit2 size={14}/></button></div> },
           ]} data={tasks} keyFn={t => t.id} />
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={editingId ? t.editTask : t.newTask}>
         <div className="space-y-8 pt-4">
            <Input label={isRtl?'عنوان المهمة':'Task Designation'} icon={Target} value={form.title} onChange={(e: any) => setForm(f => ({ ...f, title: e.target.value }))} />
            <Textarea label={isRtl?'تفاصيل العمل':'Operational Scope'} icon={Layers} value={form.description} onChange={(e: any) => setForm(f => ({ ...f, description: e.target.value }))} />
            
            <div className="grid grid-cols-2 gap-6">
               <Select label={t.project} icon={Zap} value={form.projectId} options={(projects ?? []).map((p: any) => ({ value: p.id, label: p.name }))} onChange={(e: any) => setForm(f => ({ ...f, projectId: e.target.value }))} />
               <Select label={t.priority} icon={AlertCircle} value={form.priority} options={PRIORITY_OPT(isRtl)} onChange={(e: any) => setForm(f => ({ ...f, priority: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-6">
               <Select label={t.assignee} icon={Users} value={form.assigneeId} options={(users ?? []).map((u: any) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))} onChange={(e: any) => setForm(f => ({ ...f, assigneeId: e.target.value }))} />
               <Input label={t.dueDate} icon={Calendar} type="date" value={form.dueDate} onChange={(e: any) => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>

            <Select label={t.status} icon={CheckCircle2} value={form.status} options={['TODO','IN_PROGRESS','IN_REVIEW','DONE'].map(s => ({value:s, label:s}))} onChange={(e: any) => setForm(f => ({...f, status: e.target.value}))} />
            
            <div className="flex justify-end gap-4 mt-12 py-6 border-t border-white/5">
               <button className="clean-btn-secondary px-10" onClick={() => setEditOpen(false)}>{t.cancel}</button>
               <button className="clean-btn-primary px-10" onClick={() => saveMutation.mutate()}>{t.save}</button>
            </div>
         </div>
      </Modal>
    </div>
  );
}
