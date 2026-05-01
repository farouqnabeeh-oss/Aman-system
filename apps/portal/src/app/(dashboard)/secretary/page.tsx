'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Package, Wallet, Plus, Search, 
    CheckCircle2, Clock, AlertCircle, Phone, 
    User as UserIcon, Calendar, ArrowRightLeft,
    TrendingUp, TrendingDown, ClipboardList
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { 
    getVisitors, addVisitor, checkOutVisitor,
    getInventory, updateInventoryQuantity, addInventoryItem,
    getPettyCash, requestPettyCash, approvePettyCash
} from '@/lib/actions/secretary';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';

const T = {
    ar: {
        title: 'مركز قيادة السكرتارية',
        subtitle: 'إدارة الزوار، المخزون، والعهدة النثرية',
        visitors: 'سجل الزوار',
        inventory: 'إدارة المخزون',
        pettyCash: 'العهدة النثرية',
        addVisitor: 'تسجيل زائر',
        addItem: 'إضافة صنف',
        requestCash: 'طلب عهدة',
        name: 'الاسم',
        purpose: 'الغرض من الزيارة',
        host: 'المضيف',
        status: 'الحالة',
        quantity: 'الكمية',
        category: 'الفئة',
        amount: 'المبلغ',
        reason: 'السبب',
        in: 'داخل المكان',
        out: 'غادر',
        available: 'متوفر',
        low: 'كمية منخفضة',
        outOfStock: 'نفد',
    },
    en: {
        title: 'Secretary Command Center',
        subtitle: 'Managing visitors, inventory, and petty cash',
        visitors: 'Visitor Logs',
        inventory: 'Inventory',
        pettyCash: 'Petty Cash',
        addVisitor: 'Register Visitor',
        addItem: 'Add Item',
        requestCash: 'Request Cash',
        name: 'Name',
        purpose: 'Purpose',
        host: 'Host',
        status: 'Status',
        quantity: 'Quantity',
        category: 'Category',
        amount: 'Amount',
        reason: 'Reason',
        in: 'In Building',
        out: 'Checked Out',
        available: 'Available',
        low: 'Low Stock',
        outOfStock: 'Out of Stock',
    }
};

export default function SecretaryPage() {
    const { language } = useUIStore();
    const user = useAuthStore(s => s.user);
    const isRtl = language === 'ar';
    const t = T[language as keyof typeof T] || T.en;
    const [tab, setTab] = useState<'visitors' | 'inventory' | 'cash'>('visitors');

    const tabs = [
        { id: 'visitors' as const, label: t.visitors, icon: Users, color: 'text-blue-500' },
        { id: 'inventory' as const, label: t.inventory, icon: Package, color: 'text-amber-500' },
        { id: 'cash' as const, label: t.pettyCash, icon: Wallet, color: 'text-emerald-500' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shadow-inner">
                        <ClipboardList size={26} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t.title}</h1>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">{t.subtitle}</p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
                    {tabs.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setTab(item.id)}
                            className={clsx(
                                "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                tab === item.id 
                                    ? "bg-white text-slate-900 shadow-sm shadow-slate-200/50 border border-slate-200" 
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <item.icon size={14} className={tab === item.id ? item.color : "text-slate-300"} />
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {tab === 'visitors' && <VisitorsTab t={t} isRtl={isRtl} />}
                    {tab === 'inventory' && <InventoryTab t={t} isRtl={isRtl} />}
                    {tab === 'cash' && <PettyCashTab t={t} isRtl={isRtl} user={user} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// --- Visitors Tab ---

function VisitorsTab({ t, isRtl }: any) {
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', purpose: '', hostId: '' });
    const queryClient = useQueryClient();

    const { data: visitors = [], isLoading } = useQuery({
        queryKey: ['visitors'],
        queryFn: async () => {
            const res = await getVisitors();
            return res.data || [];
        }
    });

    const addMutation = useMutation({
        mutationFn: () => addVisitor(form),
        onSuccess: () => {
            toast.success(isRtl ? 'تم تسجيل الزائر' : 'Visitor Registered');
            setModal(false);
            setForm({ name: '', phone: '', purpose: '', hostId: '' });
            queryClient.invalidateQueries({ queryKey: ['visitors'] });
        }
    });

    const checkOutMutation = useMutation({
        mutationFn: (id: string) => checkOutVisitor(id),
        onSuccess: () => {
            toast.success(isRtl ? 'تم تسجيل المغادرة' : 'Checked Out');
            queryClient.invalidateQueries({ queryKey: ['visitors'] });
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t.visitors}</h3>
                <button 
                    onClick={() => setModal(true)}
                    className="px-6 py-3 bg-brand text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                    <Plus size={14} /> {t.addVisitor}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visitors.map((v: any) => (
                    <div key={v.id} className="glass-card bg-white border-slate-100 p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                    <UserIcon size={20} />
                                </div>
                                <span className={clsx(
                                    "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                                    v.status === 'IN' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                )}>
                                    {v.status === 'IN' ? t.in : t.out}
                                </span>
                            </div>
                            <h4 className="font-black text-slate-900 text-sm mb-1">{v.name}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Phone size={10} /> {v.phone || '---'}
                            </p>
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.purpose}</p>
                                <p className="text-xs font-bold text-slate-700">{v.purpose}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-2">
                                <Clock size={12} className="text-slate-300" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    {new Date(v.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            {v.status === 'IN' && (
                                <button 
                                    onClick={() => checkOutMutation.mutate(v.id)}
                                    className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                                >
                                    {isRtl ? 'تسجيل مغادرة' : 'Check Out'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Modal open={modal} onClose={() => setModal(false)} title={t.addVisitor}>
                <div className="space-y-5 pt-2">
                    <Input label={t.name} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    <Input label="Phone (Optional)" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                    <Input label={t.purpose} value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} />
                    <button 
                        onClick={() => addMutation.mutate()}
                        className="w-full py-4 bg-brand text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand/20 mt-4"
                    >
                        {t.addVisitor}
                    </button>
                </div>
            </Modal>
        </div>
    );
}

// --- Inventory Tab ---

function InventoryTab({ t, isRtl }: any) {
    const [modal, setModal] = useState(false);
    const queryClient = useQueryClient();

    const { data: items = [], isLoading } = useQuery({
        queryKey: ['inventory'],
        queryFn: async () => {
            const res = await getInventory();
            return res.data || [];
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t.inventory}</h3>
                <button className="px-6 py-3 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2">
                    <Plus size={14} /> {t.addItem}
                </button>
            </div>

            <div className="glass-card bg-white border-slate-100 !p-0 overflow-hidden">
                <table className="w-full text-start">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-start">{isRtl ? 'الصنف' : 'Item'}</th>
                            <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-start">{t.category}</th>
                            <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-start">{t.quantity}</th>
                            <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-start">{t.status}</th>
                            <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-end"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {items.length === 0 && (
                            <tr><td colSpan={5} className="py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No items found</td></tr>
                        )}
                        {items.map((item: any) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                                <td className="px-8 py-5">
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.name}</p>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.category}</span>
                                </td>
                                <td className="px-8 py-5">
                                    <p className="text-xs font-black text-slate-700">{item.quantity} <span className="text-[9px] text-slate-400">{item.unit}</span></p>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={clsx(
                                        "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                                        item.status === 'AVAILABLE' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                        item.status === 'LOW' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                    )}>
                                        {item.status === 'AVAILABLE' ? t.available : item.status === 'LOW' ? t.low : t.outOfStock}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-end">
                                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all">
                                        <ArrowRightLeft size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- Petty Cash Tab ---

function PettyCashTab({ t, isRtl, user }: any) {
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({ amount: '', reason: '' });
    const queryClient = useQueryClient();

    const { data: records = [] } = useQuery({
        queryKey: ['petty-cash'],
        queryFn: async () => {
            const res = await getPettyCash();
            return res.data || [];
        }
    });

    const requestMutation = useMutation({
        mutationFn: () => requestPettyCash({ amount: parseFloat(form.amount), reason: form.reason }),
        onSuccess: () => {
            toast.success('Request Submitted');
            setModal(false);
            setForm({ amount: '', reason: '' });
            queryClient.invalidateQueries({ queryKey: ['petty-cash'] });
        }
    });

    const approveMutation = useMutation({
        mutationFn: ({ id, status }: any) => approvePettyCash(id, status),
        onSuccess: () => {
            toast.success('Status Updated');
            queryClient.invalidateQueries({ queryKey: ['petty-cash'] });
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t.pettyCash}</h3>
                <button 
                    onClick={() => setModal(true)}
                    className="px-6 py-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                    <Plus size={14} /> {t.requestCash}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card bg-white border-slate-100 !p-6">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Spent (Month)</p>
                    <div className="flex items-center justify-between">
                        <h4 className="text-xl font-black text-slate-900">$1,240.00</h4>
                        <TrendingUp size={16} className="text-emerald-500" />
                    </div>
                </div>
                <div className="glass-card bg-white border-slate-100 !p-6">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Requests</p>
                    <div className="flex items-center justify-between">
                        <h4 className="text-xl font-black text-slate-900">{records.filter((r: any) => r.status === 'PENDING').length}</h4>
                        <Clock size={16} className="text-amber-500" />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {records.map((r: any) => (
                    <div key={r.id} className="glass-card bg-white border-slate-100 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className={clsx(
                                "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm",
                                r.status === 'APPROVED' ? "bg-emerald-50 text-emerald-500" :
                                r.status === 'REJECTED' ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-500"
                            )}>
                                ${r.amount}
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{r.reason}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{new Date(r.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <span className={clsx(
                                "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                r.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                r.status === 'REJECTED' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-amber-50 text-amber-600 border-amber-100"
                            )}>
                                {r.status}
                            </span>
                            
                            {r.status === 'PENDING' && (['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user?.role || '')) && (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => approveMutation.mutate({ id: r.id, status: 'APPROVED' })}
                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all"
                                    >
                                        <CheckCircle2 size={14} />
                                    </button>
                                    <button 
                                        onClick={() => approveMutation.mutate({ id: r.id, status: 'REJECTED' })}
                                        className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all"
                                    >
                                        <AlertCircle size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Modal open={modal} onClose={() => setModal(false)} title={t.requestCash}>
                <div className="space-y-5 pt-2">
                    <Input label={t.amount} type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                    <Input label={t.reason} value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} />
                    <button 
                        onClick={() => requestMutation.mutate()}
                        className="w-full py-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 mt-4"
                    >
                        {t.requestCash}
                    </button>
                </div>
            </Modal>
        </div>
    );
}
