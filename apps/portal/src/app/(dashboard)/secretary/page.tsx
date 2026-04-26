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
  { value: 'PRESENT', label_ar: 'حاضر', label_en: 'Present', color: 'text-emerald-400 bg-emerald-500/10' },
  { value: 'LATE', label_ar: 'متأخر', label_en: 'Late', color: 'text-amber-400 bg-amber-500/10' },
  { value: 'ABSENT', label_ar: 'غائب', label_en: 'Absent', color: 'text-rose-400 bg-rose-500/10' },
  { value: 'REMOTE', label_ar: 'عمل عن بعد', label_en: 'Remote', color: 'text-blue-400 bg-blue-500/10' },
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
      toast.error(res.message || 'Error loading data');
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
      toast.error(res.message || 'Update failed');
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
        <div className="flex-1 min-w-[300px] flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-3.5 focus-within:border-white/20 transition-all">
          <Search size={18} className="text-slate-600 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.search}
            className="bg-transparent text-sm text-white outline-none w-full font-medium placeholder:text-slate-600"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
            <Calendar size={14} className="text-slate-500" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeIn} className="glass-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                <th className="px-6 py-5 text-start text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.employee}</th>
                <th className="px-6 py-5 text-start text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.status}</th>
                <th className="px-6 py-5 text-start text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.checkIn}</th>
                <th className="px-6 py-5 text-start text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.checkOut}</th>
                <th className="px-6 py-5 text-start text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.notes}</th>
                <th className="px-6 py-5 text-center text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
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
        <tr className="hover:bg-white/[0.02] transition-colors">
            <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center font-bold text-xs text-white border border-white/5">
                        {employee.name?.[0]}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">{employee.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">ID: {employee.employeeNumber} · {employee.department}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-5">
                <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={clsx(
                        'text-[10px] font-black px-3 py-1.5 rounded-lg outline-none cursor-pointer transition-all uppercase tracking-widest',
                        statusOptions.find(o => o.value === status)?.color || 'text-slate-400 bg-white/5'
                    )}
                >
                    {statusOptions.map(o => (
                        <option key={o.value} value={o.value} className="bg-[#0B0F1A] text-white">
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
                    className="bg-white/5 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-white/20"
                />
            </td>
            <td className="px-6 py-5">
                <input 
                    type="time" 
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="bg-white/5 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-white/20"
                />
            </td>
            <td className="px-6 py-5">
                <input 
                    type="text" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="..."
                    className="bg-transparent border-b border-white/10 text-xs text-white outline-none focus:border-white/30 w-full"
                />
            </td>
            <td className="px-6 py-5 text-center">
                <button 
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className={clsx(
                        'p-2.5 rounded-xl transition-all',
                        hasChanges ? 'bg-white text-black hover:bg-slate-200' : 'text-slate-700 pointer-events-none'
                    )}
                >
                    {isSaving ? <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                </button>
            </td>
        </tr>
    );
}
