import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Clock, Plus, UserCheck, Briefcase, Monitor, Target, Layers, Users, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../../lib/axios';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '../../../components/ui/States';
import { Table, Pagination } from '../../../components/ui/Table';
import { SkeletonTable } from '../../../components/ui/Skeleton';
import { statusBadge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input, Select, Textarea } from '../../../components/ui/Input';
import { useAuthStore } from '../../../store/auth.store';
import toast from 'react-hot-toast';

const TRANSLATIONS = {
  ar: {
    hr: 'الموارد البشرية الاستراتيجية',
    hrSub: 'إدارة الكفاءات، مراقبة الحضور، وسجلات الإنتاجية',
    leaves: 'طلبات الغياب',
    attendance: 'منصة الحضور',
    checkIn: 'تسجيل الحضور',
    checkOut: 'تسجيل الانصراف',
    newLeave: 'طلب إجازة جديد',
    employee: 'الموظف',
    type: 'النوع',
    dates: 'الفترة',
    status: 'الحالة',
    totalPresent: 'الحضور اليوم',
    totalLate: 'المتأخرين',
    onLeave: 'في إجازة',
    attendanceLogs: 'سجلات الوصول اللحظية',
    manualEntry: 'إضافة سجل يدوي',
    save: 'حفظ الطلب',
    cancel: 'تراجع',
  },
  en: {
    hr: 'Human Capital Ops',
    hrSub: 'Personnel management, attendance monitoring, and productivity logs',
    leaves: 'Leave Protocol',
    attendance: 'Attendance Grid',
    checkIn: 'Clock In',
    checkOut: 'Clock Out',
    newLeave: 'New Protocol',
    employee: 'Operator',
    type: 'Type',
    dates: 'Duration',
    status: 'Status',
    totalPresent: 'Present Operators',
    totalLate: 'Late Arrivals',
    onLeave: 'On Leave',
    attendanceLogs: 'Live Access Feed',
    manualEntry: 'Deploy Manual Record',
    save: 'Verify & Save',
    cancel: 'Abort',
  }
};

export function HrPage() {
  const qc = useQueryClient();
  const { language } = useUIStore();
  const user = useAuthStore(s => s.user);
  const isRtl = language === 'ar';
  const t = TRANSLATIONS[language];

  const [tab, setTab] = useState<'leaves' | 'attendance'>('attendance');
  const [attPage, setAttPage] = useState(1);
  const [createLeaveOpen, setCreateLeaveOpen] = useState(false);
  const [manualAttOpen, setManualAttOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ type: 'ANNUAL', startDate: '', endDate: '', reason: '' });
  const [manualForm, setManualForm] = useState({ userId: '', date: '', checkIn: '', checkOut: '', status: 'PRESENT' });

  const { data: leaves, isLoading: leavesLoading } = useQuery({ queryKey:['leaves'], queryFn:()=>api.get<any>('/hr/leaves').then(r=>r.data.data) });
  const { data: attendance, isLoading: attLoading } = useQuery({ queryKey:['attendance', attPage], queryFn:()=>api.get<any>('/hr/attendance', {params:{page:attPage}}).then(r=>r.data.data) });
  const { data: users } = useQuery({ queryKey:['users-list'], queryFn:()=>api.get<any>('/users',{params:{limit:100}}).then(r=>r.data.data.items) });

  const createMutation = useMutation({
    mutationFn: () => api.post('/hr/leaves', leaveForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['leaves'] }); setCreateLeaveOpen(false); toast.success('Protocol Sent'); },
  });

  const checkInMutation = useMutation({ mutationFn: () => api.post('/hr/attendance/check-in'), onSuccess: () => { qc.invalidateQueries({ queryKey:['attendance'] }); toast.success('Clocked In'); } });
  const checkOutMutation = useMutation({ mutationFn: () => api.post('/hr/attendance/check-out'), onSuccess: () => { qc.invalidateQueries({ queryKey:['attendance'] }); toast.success('Clocked Out'); } });

  const isOps = user && ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(user.role);

  const attCols = [
     { key: 'user', label: t.employee, render: (a: any) => (
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-bold text-[10px] text-slate-500">{a.user?.firstName[0]}</div>
           <div className="flex flex-col">
              <span className="text-sm font-bold text-white">{a.user?.firstName} {a.user?.lastName}</span>
              <span className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">{a.user?.position || 'Operator'}</span>
           </div>
        </div>
     )},
     { key: 'date', label: 'Protocol Date', render: (a: any) => <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{new Date(a.date).toLocaleDateString(language)}</span> },
     { key: 'in', label: 'In', render: (a: any) => a.checkIn && <div className="flex items-center gap-2 text-white"><Clock size={12} className="text-indigo-400" /> <span className="text-sm font-bold">{new Date(a.checkIn).toLocaleTimeString(language, {hour:'2-digit', minute:'2-digit'})}</span></div> },
     { key: 'out', label: 'Out', render: (a: any) => a.checkOut && <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">{new Date(a.checkOut).toLocaleTimeString(language, {hour:'2-digit', minute:'2-digit'})}</div> },
     { key: 'duration', label: 'Duty Duration', render: (a: any) => {
        if(!a.checkIn || !a.checkOut) return '—';
        const hours = (new Date(a.checkOut).getTime() - new Date(a.checkIn).getTime()) / (1000 * 3600);
        return <span className="text-[10px] font-black text-slate-700 bg-white/5 px-2 py-1 rounded-lg">{hours.toFixed(1)} hrs</span>;
     }},
     { key: 'status', label: t.status, render: (a: any) => statusBadge(a.status) },
  ];

  return (
    <div className="space-y-12">
      <PageHeader title={t.hr} description={t.hrSub} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatCard label={t.totalPresent} value={attendance?.items?.filter((a:any)=>a.status==='PRESENT').length || 0} icon={<UserCheck size={24}/>} trend="up" delta="Safe" />
         <StatCard label={t.totalLate} value={attendance?.items?.filter((a:any)=>a.status==='LATE').length || 0} icon={<Clock size={24}/>} trend="down" delta="Check" />
         <StatCard label={t.onLeave} value={leaves?.items?.filter((l:any)=>l.status==='APPROVED').length || 0} icon={<Briefcase size={24}/>} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-8 pt-4">
         <div className="flex bg-white/[0.02] p-1.5 rounded-[1.5rem] border border-white/[0.05]">
            <button onClick={() => setTab('attendance')} className={clsx('px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all', tab === 'attendance' ? 'bg-white text-black' : 'text-slate-600 hover:text-white')}>{t.attendance}</button>
            <button onClick={() => setTab('leaves')} className={clsx('px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all', tab === 'leaves' ? 'bg-white text-black' : 'text-slate-600 hover:text-white')}>{t.leaves}</button>
         </div>

         <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-2">
               <button onClick={() => checkInMutation.mutate()} className="h-10 px-6 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-white/5 rounded-xl transition-all">{t.checkIn}</button>
               <div className="w-px h-4 bg-white/10" />
               <button onClick={() => checkOutMutation.mutate()} className="h-10 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 rounded-xl transition-all">{t.checkOut}</button>
            </div>
            
            {isOps && (
               <button onClick={() => setManualAttOpen(true)} className="clean-btn-secondary h-12 gap-2 text-[10px] uppercase tracking-widest"><Monitor size={16}/> {t.manualEntry}</button>
            )}
            <button onClick={() => setCreateLeaveOpen(true)} className="clean-btn-primary h-12 gap-2 text-[10px] uppercase tracking-widest"><Plus size={16}/> {t.newLeave}</button>
         </div>
      </div>

      <div className="clean-card !p-0 overflow-hidden relative">
         <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-800 uppercase tracking-[0.5em] pointer-events-none">Secure Stream Protocol v4.0</div>
         {tab === 'attendance' ? (
            <>
               {attLoading ? <SkeletonTable rows={10} cols={6} /> : (
                  <Table columns={attCols} data={attendance?.items || []} keyFn={a => a.id} />
               )}
               {attendance?.meta && attendance.meta.totalPages > 1 && <Pagination page={attPage} totalPages={attendance.meta.totalPages} total={attendance.meta.total} limit={attendance.meta.limit} onPage={setAttPage} />}
            </>
         ) : (
            <>
               {leavesLoading ? <SkeletonTable rows={10} cols={5} /> : (
                  <Table columns={[
                     { key: 'user', label: t.employee, render: (l: any) => <span className="text-sm font-bold text-white">{l.user?.firstName} {l.user?.lastName}</span> },
                     { key: 'type', label: t.type, render: (l: any) => <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{l.type}</span> },
                     { key: 'dates', label: t.dates, render: (l: any) => <span className="text-xs font-bold text-slate-500">{new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}</span> },
                     { key: 'status', label: t.status, render: (l: any) => statusBadge(l.status) },
                     { key: 'actions', label: '', render: (l: any) => l.status === 'PENDING' && isOps && <div className="flex justify-end gap-2"><button className="p-2 rounded-xl bg-white/5 text-slate-500 hover:text-white"><Check size={14}/></button></div>}
                  ]} data={leaves?.items || []} keyFn={l => l.id} />
               )}
            </>
         )}
      </div>

      <Modal open={createLeaveOpen} onClose={() => setCreateLeaveOpen(false)} title={t.newLeave}>
         <div className="space-y-8 pt-4">
            <Select label="Leave Category" icon={Target} value={leaveForm.type} options={['ANNUAL','SICK','EMERGENCY'].map(v => ({value:v, label:v}))} onChange={(e: any) => setLeaveForm(f => ({...f, type: e.target.value}))} />
            <div className="grid grid-cols-2 gap-6">
               <Input label={isRtl ? 'تاريخ البدء' : 'Protocol Start'} icon={Calendar} type="date" value={leaveForm.startDate} onChange={(e: any) => setLeaveForm(f => ({...f, startDate: e.target.value}))} />
               <Input label={isRtl ? 'تاريخ الانتهاء' : 'Protocol End'} icon={Calendar} type="date" value={leaveForm.endDate} onChange={(e: any) => setLeaveForm(f => ({...f, endDate: e.target.value}))} />
            </div>
            <Textarea label={isRtl ? 'السبب' : 'Operational Reason'} icon={Layers} value={leaveForm.reason} onChange={(e: any) => setLeaveForm(f => ({...f, reason: e.target.value}))} />
            <div className="flex justify-end gap-4 mt-12 py-6 border-t border-white/5">
               <button className="clean-btn-secondary px-10" onClick={() => setCreateLeaveOpen(false)}>{t.cancel}</button>
               <button className="clean-btn-primary px-10" onClick={() => createMutation.mutate()}>{t.save}</button>
            </div>
         </div>
      </Modal>

      <Modal open={manualAttOpen} onClose={() => setManualAttOpen(false)} title={t.manualEntry}>
         <div className="space-y-8 pt-4">
            <Select label={t.employee} icon={Users} value={manualForm.userId} options={(users ?? []).map((u:any)=>({value:u.id, label:`${u.firstName} ${u.lastName}`}))} onChange={(e: any) => setManualForm(f => ({...f, userId: e.target.value}))} />
            <Input label={isRtl ? 'التاريخ' : 'Deployment Date'} icon={Calendar} type="date" value={manualForm.date} onChange={(e: any) => setManualForm(f => ({...f, date: e.target.value}))} />
            <div className="grid grid-cols-2 gap-6">
               <Input label="Clock In" icon={Clock} type="time" value={manualForm.checkIn} onChange={(e: any) => setManualForm(f => ({...f, checkIn: e.target.value}))} />
               <Input label="Clock Out" icon={Clock} type="time" value={manualForm.checkOut} onChange={(e: any) => setManualForm(f => ({...f, checkOut: e.target.value}))} />
            </div>
            <div className="flex justify-end gap-4 mt-12 py-6 border-t border-white/5">
               <button className="clean-btn-secondary px-10" onClick={() => setManualAttOpen(false)}>{t.cancel}</button>
               <button className="clean-btn-primary px-10" onClick={() => {}}>{t.save}</button>
            </div>
         </div>
      </Modal>
    </div>
  );
}
