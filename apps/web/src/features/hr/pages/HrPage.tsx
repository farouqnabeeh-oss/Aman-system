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
      newLeave: 'New Leave Request',
      employee: 'Employee',
      type: 'Type',
      dates: 'Duration',
      status: 'Status',
      totalPresent: 'Present Today',
      totalLate: 'Late Arrivals',
      onLeave: 'On Leave',
      attendanceLogs: 'Live Access Feed',
      manualEntry: 'Add Manual Record',
      save: 'Save Request',
      cancel: 'Cancel',
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

   const { data: leaves, isLoading: leavesLoading } = useQuery({ queryKey: ['leaves'], queryFn: () => api.get<any>('/hr/leaves').then(r => r.data.data) });
   const { data: attendance, isLoading: attLoading } = useQuery({ queryKey: ['attendance', attPage], queryFn: () => api.get<any>('/hr/attendance', { params: { page: attPage } }).then(r => r.data.data) });
   const { data: users } = useQuery({ queryKey: ['users-list'], queryFn: () => api.get<any>('/users', { params: { limit: 100 } }).then(r => r.data.data.items) });

   const createMutation = useMutation({
      mutationFn: () => {
         const payload: any = { ...leaveForm };
         if (!payload.reason) delete payload.reason;
         return api.post('/hr/leaves', payload);
      },
      onSuccess: () => { 
        qc.invalidateQueries({ queryKey: ['leaves'] }); 
        qc.invalidateQueries({ queryKey: ['dashboard'] });
        qc.invalidateQueries({ queryKey: ['audit-logs'] });
        setCreateLeaveOpen(false); 
        toast.success('Protocol Sent'); 
      },
   });

   const reviewMutation = useMutation({
      mutationFn: ({ id, status }: { id: string, status: 'APPROVED' | 'REJECTED' }) => api.patch(`/hr/leaves/${id}/review`, { status }),
      onSuccess: () => {
         qc.invalidateQueries({ queryKey: ['leaves'] });
         qc.invalidateQueries({ queryKey: ['dashboard'] });
         qc.invalidateQueries({ queryKey: ['audit-logs'] });
         toast.success(isRtl ? 'تم تحديث حالة الإجازة' : 'Leave status updated');
      }
   });

   const checkInMutation = useMutation({
      mutationFn: () => api.post('/hr/attendance/check-in'),
      onSuccess: () => {
         qc.invalidateQueries({ queryKey: ['attendance'] });
         qc.invalidateQueries({ queryKey: ['dashboard'] });
         qc.invalidateQueries({ queryKey: ['audit-logs'] });
         toast.dismiss('att-toast');
         toast.success(isRtl ? 'تم تسجيل الحضور' : 'Clocked In');
      },
      onError: (err: any) => {
         toast.dismiss('att-toast');
         toast.error(err.response?.data?.message || (isRtl ? 'فشل تسجيل الحضور' : 'Clock In Failed'));
      }
   });

   const checkOutMutation = useMutation({
      mutationFn: () => api.post('/hr/attendance/check-out'),
      onSuccess: () => {
         qc.invalidateQueries({ queryKey: ['attendance'] });
         qc.invalidateQueries({ queryKey: ['dashboard'] });
         qc.invalidateQueries({ queryKey: ['audit-logs'] });
         toast.dismiss('att-toast');
         toast.success(isRtl ? 'تم تسجيل الانصراف' : 'Clocked Out');
      },
      onError: (err: any) => {
         toast.dismiss('att-toast');
         toast.error(err.response?.data?.message || (isRtl ? 'فشل تسجيل الانصراف' : 'Clock Out Failed'));
      }
   });

   const isOps = user && ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(user.role);

   const attCols = [
      {
         key: 'user', label: t.employee, render: (a: any) => (
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-xl bg-[var(--bg-glass)] border border-[var(--border)] flex items-center justify-center font-bold text-[10px] text-[var(--text-3)]">{a.user?.firstName[0]}</div>
               <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--text-1)]">{a.user?.firstName} {a.user?.lastName}</span>
                  <span className="text-[10px] font-medium text-[var(--text-4)] uppercase tracking-widest">{a.user?.position || 'Operator'}</span>
               </div>
            </div>
         )
      },
      { key: 'date', label: 'Protocol Date', render: (a: any) => <span className="text-[11px] font-black text-[var(--text-3)] uppercase tracking-widest">{new Date(a.date).toLocaleDateString(language)}</span> },
      { key: 'in', label: 'In', render: (a: any) => a.checkIn && <div className="flex items-center gap-2 text-[var(--text-1)]"><Clock size={12} className="text-brand" /> <span className="text-sm font-bold">{new Date(a.checkIn).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}</span></div> },
      { key: 'out', label: 'Out', render: (a: any) => a.checkOut && <div className="flex items-center gap-2 text-[var(--text-3)] font-bold text-sm">{new Date(a.checkOut).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}</div> },
      {
         key: 'duration', label: 'Duty Duration', render: (a: any) => {
            if (!a.checkIn || !a.checkOut) return '—';
            const hours = (new Date(a.checkOut).getTime() - new Date(a.checkIn).getTime()) / (1000 * 3600);
            return <span className="text-[10px] font-black text-brand bg-brand/5 px-2 py-1 rounded-lg">{hours.toFixed(1)} hrs</span>;
         }
      },
      { key: 'status', label: t.status, render: (a: any) => statusBadge(a.status) },
   ];

   return (
      <div className="space-y-12">
         <PageHeader title={t.hr} description={t.hrSub} />

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label={t.totalPresent} value={attendance?.items?.filter((a: any) => a.status === 'PRESENT').length || 0} icon={<UserCheck size={24} className="text-sky-400" />} />
            <StatCard label={t.totalLate} value={attendance?.items?.filter((a: any) => a.status === 'LATE').length || 0} icon={<Clock size={24} className="text-amber-400" />} />
            <StatCard label={t.onLeave} value={leaves?.items?.filter((l: any) => l.status === 'APPROVED').length || 0} icon={<Briefcase size={24} className="text-indigo-400" />} />
         </div>

         <div className="flex flex-wrap items-center justify-between gap-8 pt-4">
            <div className="flex bg-[var(--bg-glass)] p-1.5 rounded-[1.5rem] border border-[var(--border)]">
               <button onClick={() => setTab('attendance')} className={clsx('px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all', tab === 'attendance' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-[var(--text-3)] hover:text-[var(--text-1)]')}>{t.attendance}</button>
               <button onClick={() => setTab('leaves')} className={clsx('px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all', tab === 'leaves' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-[var(--text-3)] hover:text-[var(--text-1)]')}>{t.leaves}</button>
            </div>

            <div className="flex items-center gap-4">
               <div className="flex items-center bg-brand/5 border border-brand/10 rounded-2xl p-1 shadow-inner">
                  <button
                     onClick={() => {
                        checkInMutation.mutate();
                        toast.loading(isRtl ? 'جاري تسجيل الحضور...' : 'Logging In...', { id: 'att-toast' });
                     }}
                     className="h-10 px-8 text-[10px] font-black uppercase tracking-widest text-brand hover:bg-brand/10 rounded-xl transition-all"
                  >
                     {t.checkIn}
                  </button>
                  <div className="w-px h-4 bg-brand/20" />
                  <button
                     onClick={() => {
                        checkOutMutation.mutate();
                        toast.loading(isRtl ? 'جاري تسجيل الانصراف...' : 'Logging Out...', { id: 'att-toast' });
                     }}
                     className="h-10 px-8 text-[10px] font-black uppercase tracking-widest text-[var(--text-3)] hover:bg-brand/10 rounded-xl transition-all"
                  >
                     {t.checkOut}
                  </button>
               </div>

               {/* المدير: يرى أداة الإضافة اليدوية + زر طلب إجازة (للمدير نفسه) */}
               {isOps && (
                  <button onClick={() => setManualAttOpen(true)} className="clean-btn-secondary h-12 gap-2 text-[10px] uppercase tracking-widest border-[var(--border)]">
                     <Monitor size={16} /> {t.manualEntry}
                  </button>
               )}
               {/* كل المستخدمين (بما فيهم المدير) يمكنهم طلب إجازة */}
               <button onClick={() => setCreateLeaveOpen(true)} className="clean-btn-primary h-12 gap-2 text-[10px] uppercase tracking-widest bg-brand shadow-brand/20">
                  <Plus size={16} /> {t.newLeave}
               </button>
            </div>
         </div>

         <div className="clean-card !p-0 overflow-hidden relative border-[var(--border)]">
            <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[9px] font-black text-brand/20 uppercase tracking-[0.5em] pointer-events-none">Aman Tactical Stream v4.0</div>
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
                        { key: 'user', label: t.employee, render: (l: any) => <span className="text-sm font-bold text-[var(--text-1)]">{l.user?.firstName} {l.user?.lastName}</span> },
                        { key: 'type', label: t.type, render: (l: any) => <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{l.type}</span> },
                        { key: 'dates', label: t.dates, render: (l: any) => <span className="text-xs font-bold text-[var(--text-3)]">{new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}</span> },
                        { key: 'status', label: t.status, render: (l: any) => statusBadge(l.status) },
                        { key: 'actions', label: '', render: (l: any) => l.status === 'PENDING' && isOps && (
                           <div className="flex justify-end gap-2">
                              <button onClick={() => { if(confirm('Approve leave?')) reviewMutation.mutate({ id: l.id, status: 'APPROVED' })}} className="p-2 rounded-xl bg-teal-500/10 text-teal-500 hover:bg-teal-500 hover:text-white transition-all"><Check size={14} /></button>
                           </div>
                        ) }
                     ]} data={leaves?.items || []} keyFn={l => l.id} />
                  )}
               </>
            )}
         </div>

         <Modal open={createLeaveOpen} onClose={() => setCreateLeaveOpen(false)} title={t.newLeave}>
            <div className="space-y-8 pt-4">
               <Select label="Leave Category" icon={Target} value={leaveForm.type} options={['ANNUAL', 'SICK', 'EMERGENCY'].map(v => ({ value: v, label: v }))} onChange={(e: any) => setLeaveForm(f => ({ ...f, type: e.target.value }))} />
               <div className="grid grid-cols-2 gap-6">
                  <Input label={isRtl ? 'تاريخ البدء' : 'Protocol Start'} icon={Calendar} type="date" value={leaveForm.startDate} onChange={(e: any) => setLeaveForm(f => ({ ...f, startDate: e.target.value }))} />
                  <Input label={isRtl ? 'تاريخ الانتهاء' : 'Protocol End'} icon={Calendar} type="date" value={leaveForm.endDate} onChange={(e: any) => setLeaveForm(f => ({ ...f, endDate: e.target.value }))} />
               </div>
               <Textarea label={isRtl ? 'السبب' : 'Operational Reason'} icon={Layers} value={leaveForm.reason} onChange={(e: any) => setLeaveForm(f => ({ ...f, reason: e.target.value }))} />
               <div className="flex justify-end gap-4 mt-12 py-6 border-t border-[var(--border)]">
                  <button className="clean-btn-secondary px-10" onClick={() => setCreateLeaveOpen(false)}>{t.cancel}</button>
                  <button className="clean-btn-primary px-10" onClick={() => {
                     if (confirm(isRtl ? 'هل أنت متأكد من الحفظ؟' : 'Are you sure you want to save?')) {
                        createMutation.mutate();
                     }
                  }}>{t.save}</button>
               </div>
            </div>
         </Modal>

         <Modal open={manualAttOpen} onClose={() => setManualAttOpen(false)} title={t.manualEntry}>
            <div className="space-y-8 pt-4">
               <Select label={t.employee} icon={Users} value={manualForm.userId} options={(users ?? []).map((u: any) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))} onChange={(e: any) => setManualForm(f => ({ ...f, userId: e.target.value }))} />
               <Input label={isRtl ? 'التاريخ' : 'Deployment Date'} icon={Calendar} type="date" value={manualForm.date} onChange={(e: any) => setManualForm(f => ({ ...f, date: e.target.value }))} />
               <div className="grid grid-cols-2 gap-6">
                  <Input label="Clock In" icon={Clock} type="time" value={manualForm.checkIn} onChange={(e: any) => setManualForm(f => ({ ...f, checkIn: e.target.value }))} />
                  <Input label="Clock Out" icon={Clock} type="time" value={manualForm.checkOut} onChange={(e: any) => setManualForm(f => ({ ...f, checkOut: e.target.value }))} />
               </div>
               <div className="flex justify-end gap-4 mt-12 py-6 border-t border-[var(--border)]">
                  <button className="clean-btn-secondary px-10" onClick={() => setManualAttOpen(false)}>{t.cancel}</button>
                  <button className="clean-btn-primary px-10" onClick={() => {
                     if (confirm(isRtl ? 'هل أنت متأكد من الحفظ؟' : 'Are you sure you want to save?')) {
                        // Manual attendance logic here
                     }
                  }}>{t.save}</button>
               </div>
            </div>
         </Modal>
      </div>
   );
}
