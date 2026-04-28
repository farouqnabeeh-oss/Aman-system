'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Save, Search, User, Filter, Calendar } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '@/components/ui/States';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { getEmployeesForSecretary, markAttendance } from '@/lib/actions/hr';
import toast from 'react-hot-toast';

const T = {
  ar: {
    title: 'قائمة المتابعة',
    subtitle: 'إدارة الحضور والانصراف والمتابعة اليومية للموظفين',
    search: 'بحث عن موظف...',
    employee: 'الموظف',
    status: 'الحالة',
    checkIn: 'وقت الحضور',
    checkOut: 'وقت الانصراف',
    notes: 'ملاحظات',
    save: 'حفظ التغييرات',
    total: 'إجمالي الموظفين',
    present: 'حاضر',
    absent: 'غائب',
    late: 'متأخر',
    actions: 'إجراءات',
  },
  en: {
    title: 'Tracking List',
    subtitle: 'Daily attendance monitoring and personnel tracking',
    search: 'Search employee...',
    employee: 'Employee',
    status: 'Status',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    notes: 'Notes',
    save: 'Save Changes',
    total: 'Total Staff',
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    actions: 'Actions',
  }
};

const statusOptions = [
  { value: 'PRESENT', label_ar: 'حاضر', label_en: 'Present', color: 'text-emerald-600 bg-emerald-50 border border-emerald-100' },
  { value: 'LATE', label_ar: 'متأخر', label_en: 'Late', color: 'text-amber-600 bg-amber-50 border border-amber-100' },
  { value: 'ABSENT', label_ar: 'غائب', label_en: 'Absent', color: 'text-rose-600 bg-rose-50 border border-rose-100' },
  { value: 'REMOTE', label_ar: 'عمل عن بعد', label_en: 'Remote', color: 'text-brand bg-brand/5 border border-brand/10' },
];

const fadeIn = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.05 } } };

export default function SecretaryPage() {
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const t = T[language as keyof typeof T] || T.en;

  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await getEmployeesForSecretary();
    if (res.success) {
      setEmployees(res.data || []);
    } else {
      toast.error(res.error || 'Error loading data');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleUpdate = async (userId: string, data: any) => {
    setSavingId(userId);
    const res = await markAttendance(userId, data);
    if (res.success) {
      toast.success(isRtl ? 'تم التحديث بنجاح' : 'Updated successfully');
      loadData();
    } else {
      toast.error(res.error || 'Update failed');
    }
    setSavingId(null);
  };

  const filtered = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.employeeNumber?.includes(search)
  );

  const stats = {
    total: employees.length,
    present: employees.filter(e => e.attendance?.status === 'PRESENT').length,
    late: employees.filter(e => e.attendance?.status === 'LATE').length,
    absent: employees.filter(e => e.attendance?.status === 'ABSENT').length,
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader title={t.title} description={t.subtitle} />

      {/* Stats */}
      <motion.div variants={fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t.total} value={stats.total} icon={<User size={18} />} />
        <StatCard label={t.present} value={stats.present} icon={<CheckCircle size={18} />} delta="Live" trend="up" />
        <StatCard label={t.late} value={stats.late} icon={<Clock size={18} />} trend="down" />
        <StatCard label={t.absent} value={stats.absent} icon={<XCircle size={18} />} />
      </motion.div>

      {/* Toolbar */}
      <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[300px] flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus-within:border-brand/30 transition-all">
          <Search size={18} className="text-slate-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.search}
            className="bg-transparent text-sm text-slate-900 outline-none w-full font-black uppercase tracking-tight placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <Calendar size={16} className="text-brand" />
            <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeIn} className="glass-card !p-0 overflow-hidden border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-5 text-start text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.employee}</th>
                <th className="px-6 py-5 text-start text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.status}</th>
                <th className="px-6 py-5 text-start text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.checkIn}</th>
                <th className="px-6 py-5 text-start text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.checkOut}</th>
                <th className="px-6 py-5 text-start text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.notes}</th>
                <th className="px-6 py-5 text-center text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((e) => (
                <EmployeeRow 
                    key={e.id} 
                    employee={e} 
                    t={t} 
                    isRtl={isRtl} 
                    onUpdate={(data: any) => handleUpdate(e.id, data)}
                    isSaving={savingId === e.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EmployeeRow({ employee, t, isRtl, onUpdate, isSaving }: any) {
    const [status, setStatus] = useState(employee.attendance?.status || 'ABSENT');
    const [checkIn, setCheckIn] = useState(employee.attendance?.checkIn ? new Date(employee.attendance.checkIn).toISOString().slice(11, 16) : '');
    const [checkOut, setCheckOut] = useState(employee.attendance?.checkOut ? new Date(employee.attendance.checkOut).toISOString().slice(11, 16) : '');
    const [notes, setNotes] = useState(employee.attendance?.notes || '');

    const hasChanges = 
        status !== (employee.attendance?.status || 'ABSENT') ||
        checkIn !== (employee.attendance?.checkIn ? new Date(employee.attendance.checkIn).toISOString().slice(11, 16) : '') ||
        checkOut !== (employee.attendance?.checkOut ? new Date(employee.attendance.checkOut).toISOString().slice(11, 16) : '') ||
        notes !== (employee.attendance?.notes || '');

    const handleSave = () => {
        const today = new Date();
        const ci = checkIn ? new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(checkIn.split(':')[0]), parseInt(checkIn.split(':')[1])) : undefined;
        const co = checkOut ? new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(checkOut.split(':')[0]), parseInt(checkOut.split(':')[1])) : undefined;

        onUpdate({
            status,
            checkIn: ci?.toISOString(),
            checkOut: co?.toISOString(),
            notes
        });
    };

    return (
        <tr className="hover:bg-slate-50/80 transition-colors group">
            <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand/5 border border-brand/10 flex items-center justify-center font-black text-xs text-brand transition-all">
                        {employee.name?.[0]}
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{employee.name}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">ID: {employee.employeeNumber} · {employee.department}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-5">
                <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={clsx(
                        'text-[10px] font-black px-3 py-1.5 rounded-lg outline-none cursor-pointer transition-all uppercase tracking-widest border',
                        statusOptions.find(o => o.value === status)?.color || 'text-slate-400 bg-slate-50 border-slate-100'
                    )}
                >
                    {statusOptions.map(o => (
                        <option key={o.value} value={o.value} className="bg-white text-slate-900">
                            {isRtl ? o.label_ar : o.label_en}
                        </option>
                    ))}
                </select>
            </td>
            <td className="px-6 py-5">
                <input 
                    type="time" 
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 outline-none focus:border-brand/30 focus:bg-white font-bold transition-all"
                />
            </td>
            <td className="px-6 py-5">
                <input 
                    type="time" 
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 outline-none focus:border-brand/30 focus:bg-white font-bold transition-all"
                />
            </td>
            <td className="px-6 py-5">
                <input 
                    type="text" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="..."
                    className="bg-transparent border-b border-slate-200 text-xs text-slate-900 font-bold outline-none focus:border-brand/30 w-full placeholder:text-slate-300"
                />
            </td>
            <td className="px-6 py-5 text-center">
                <button 
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className={clsx(
                        'p-2.5 rounded-xl transition-all shadow-sm',
                        hasChanges ? 'bg-brand text-white hover:bg-brand/90 shadow-brand/10' : 'bg-slate-50 text-slate-300 pointer-events-none'
                    )}
                >
                    {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                </button>
            </td>
        </tr>
    );
}
