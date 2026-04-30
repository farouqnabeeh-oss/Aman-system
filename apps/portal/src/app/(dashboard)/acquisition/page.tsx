'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Users, UserPlus, TrendingUp, Clock, AlertTriangle,
    CheckCircle, Plus, Search, Filter, DollarSign, Calendar, Trash2, Edit2, MoreVertical
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { getAcquisitionStats, getExpiringClients, createClientLead, updateClientStatus, getLeads, deleteClient, updateClient } from '@/lib/actions/acquisition';
import toast from 'react-hot-toast';

import { useQuery, useQueryClient } from '@tanstack/react-query';

const T = {
    ar: {
        title: 'استقطاب المشاريع',
        subtitle: 'إدارة مسار المبيعات والعملاء المحتملين والاشتراكات',
        potential: 'تم التواصل',
        negotiating: 'قيد التفاوض',
        agreed: 'تم الاتفاق',
        expiring: 'اشتراكات شارفت على الانتهاء',
        addLead: 'إضافة عميل محتمل',
        clientName: 'اسم الزبون',
        phone: 'رقم الهاتف',
        status: 'الحالة',
        packagePrice: 'سعر الباقة',
        packageDesc: 'وصف الباقة',
        expiryDate: 'تاريخ انتهاء الاشتراك',
        save: 'حفظ البيانات',
        noExpiring: 'لا يوجد اشتراكات تنتهي قريباً',
        allLeads: 'جميع العملاء والمحتملين',
        noLeads: 'لا يوجد عملاء مضافين بعد',
        deleteConfirm: 'هل أنت متأكد من حذف هذا العميل؟',
        edit: 'تعديل البيانات',
    },
    en: {
        title: 'Project Acquisition',
        subtitle: 'Managing sales funnel, leads and subscriptions',
        potential: 'Contacted',
        negotiating: 'Negotiating',
        agreed: 'Agreed',
        expiring: 'Expiring Subscriptions',
        addLead: 'Add Lead',
        clientName: 'Client Name',
        phone: 'Phone',
        status: 'Status',
        packagePrice: 'Package Price',
        packageDesc: 'Package Description',
        expiryDate: 'Expiry Date',
        save: 'Save Lead',
        noLeads: 'No leads added yet',
        allLeads: 'All Leads & Clients',
        noExpiring: 'No subscriptions expiring soon',
        deleteConfirm: 'Are you sure you want to delete this client?',
        edit: 'Edit Lead',
    }
};

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.05 } } };

export default function AcquisitionPage() {
    const { language } = useUIStore();
    const isRtl = language === 'ar';
    const t = T[language as keyof typeof T] || T.en;
    const queryClient = useQueryClient();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [form, setForm] = useState({ 
        name: '', 
        phone: '', 
        status: 'POTENTIAL',
        packagePrice: '',
        packageDesc: '',
        endDate: ''
    });

    const { data: stats = { POTENTIAL: 0, NEGOTIATING: 0, AGREED: 0 } } = useQuery({
        queryKey: ['acquisition-stats'],
        queryFn: async () => {
            const res = await getAcquisitionStats();
            return res.data;
        }
    });

    const { data: expiring = [] } = useQuery({
        queryKey: ['expiring-clients'],
        queryFn: async () => {
            const res = await getExpiringClients();
            return res.data || [];
        }
    });

    const { data: leads = [], isLoading } = useQuery({
        queryKey: ['leads'],
        queryFn: async () => {
            const res = await getLeads();
            return res.data || [];
        }
    });

    const filteredLeads = leads.filter((l: any) => 
        (l.name && l.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (l.phone && l.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.status && l.status.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSave = async () => {
        if (!form.name) return toast.error('Name is required');
        
        const res = editingId 
            ? await updateClient(editingId, form)
            : await createClientLead(form);

        if (res.success) {
            toast.success(editingId ? 'System updated' : 'Lead deployed');
            setIsModalOpen(false);
            setEditingId(null);
            setForm({ name: '', phone: '', status: 'POTENTIAL', packagePrice: '', packageDesc: '', endDate: '' });
            queryClient.invalidateQueries({ queryKey: ['acquisition-stats'] });
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        } else {
            toast.error(res.message || 'Operation failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t.deleteConfirm)) return;
        const res = await deleteClient(id);
        if (res.success) {
            toast.success('Record archived');
            queryClient.invalidateQueries({ queryKey: ['acquisition-stats'] });
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        }
    };

    const handleEdit = (l: any) => {
        setEditingId(l.id);
        setForm({ 
            name: l.name, 
            phone: l.phone || '', 
            status: l.status,
            packagePrice: l.smDetails?.packagePrice?.toString() || '',
            packageDesc: l.smDetails?.packageDesc || '',
            endDate: l.smDetails?.endDate ? new Date(l.smDetails.endDate).toISOString().split('T')[0] : ''
        });
        setIsModalOpen(true);
    };

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
            <PageHeader
                title={t.title}
                description={t.subtitle}
                action={
                    <button onClick={() => { setEditingId(null); setForm({ name: '', phone: '', status: 'POTENTIAL', packagePrice: '', packageDesc: '', endDate: '' }); setIsModalOpen(true); }} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand/90 transition-all shadow-lg">
                        <Plus size={14} /> {t.addLead}
                    </button>
                }
            />

            <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label={t.potential} value={stats.POTENTIAL} icon={<Users size={18} />} />
                <StatCard label={t.negotiating} value={stats.NEGOTIATING} icon={<Clock size={18} />} delta="Active" />
                <StatCard label={t.agreed} value={stats.AGREED} icon={<CheckCircle size={18} />} trend="up" delta="Closed" />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Expiring List */}
                <motion.div variants={fadeIn} className="lg:col-span-8 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3 px-2 mb-4">
                        <AlertTriangle size={16} className="text-rose-500" /> {t.expiring}
                    </h4>
                    <div className="space-y-3">
                        {expiring.length === 0 ? (
                            <div className="glass-card py-20 text-center border-dashed border-slate-200 bg-white">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.noExpiring}</p>
                            </div>
                        ) : expiring.map((c: any) => (
                            <div key={c.id} className="glass-card !p-8 flex items-center justify-between border-slate-100 bg-white group hover:bg-slate-50 transition-all relative overflow-hidden shadow-sm">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand transition-all group-hover:scale-110">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{c.name}</p>
                                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                                            {isRtl ? 'ينتهي في' : 'Critical Expiry'}: {new Date(c.smDetails.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.packagePrice}</p>
                                    <p className="text-lg font-black text-slate-900">${Number(c.smDetails.packagePrice).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Quick Actions / Summary */}
                <motion.div variants={fadeIn} className="lg:col-span-4">
                    <div className="glass-card !p-10 border-brand/10 bg-brand/[0.03] shadow-sm relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand/5 rounded-full blur-3xl" />
                        <h4 className="text-[10px] font-black text-brand mb-10 flex items-center gap-3 uppercase tracking-[0.3em]">
                            <TrendingUp size={18} /> Conversion Analytics
                        </h4>
                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Win Probability</p>
                                    <p className="text-2xl font-black text-slate-900">{Math.round((stats.AGREED / (stats.POTENTIAL + stats.NEGOTIATING + stats.AGREED || 1)) * 100)}%</p>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.AGREED / (stats.POTENTIAL + stats.NEGOTIATING + stats.AGREED || 1)) * 100}%` }} className="h-full bg-brand" />
                                </div>
                            </div>
                            <div className="flex justify-between items-end border-t border-slate-100 pt-6">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Negotiation Velocity</p>
                                <p className="text-2xl font-black text-slate-900">{stats.NEGOTIATING}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* All Leads List */}
            <motion.div variants={fadeIn} className="glass-card !p-0 overflow-hidden border-slate-100 bg-white shadow-sm">
                <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">{t.allLeads}</h4>
                    <div className="flex items-center gap-4 bg-white rounded-xl px-4 py-2 border border-slate-200">
                        <Search size={14} className="text-slate-400" />
                        <input 
                            className="bg-transparent text-[10px] font-black uppercase text-slate-900 outline-none placeholder:text-slate-300" 
                            placeholder="Filter List..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.clientName}</th>
                                <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.phone}</th>
                                <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.status}</th>
                                <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment</th>
                                <th className="px-10 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={5} className="px-10 py-6"><div className="h-4 bg-slate-50 rounded-lg animate-pulse" /></td></tr>)
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-20 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.noLeads}</td>
                                </tr>
                            ) : filteredLeads.map((l: any) => (
                                <tr key={l.id} className="hover:bg-slate-50 transition-all group">
                                    <td className="px-10 py-5 text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-brand transition-colors">{l.name}</td>
                                    <td className="px-10 py-5 text-xs font-black text-slate-400 tracking-wider">{l.phone || 'NO-CONTACT'}</td>
                                    <td className="px-10 py-5">
                                        <span className={clsx(
                                            'text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border transition-all',
                                            l.status === 'AGREED' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                                            l.status === 'NEGOTIATING' ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-brand bg-brand/10 border border-brand/20'
                                        )}>
                                            {l.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-5 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                        {new Date(l.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-10 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => handleEdit(l)} className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDelete(l.id)} className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Add/Edit Modal */}
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? t.edit : t.addLead}>
                <div className="space-y-6 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label={t.clientName} icon={Users} value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} placeholder="Client or Company Name" />
                        <Input label={t.phone} icon={TrendingUp} value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value })} placeholder="+971 ..." />
                    </div>
                    <Select
                        label={t.status}
                        icon={Clock}
                        value={form.status}
                        options={[
                            { value: 'POTENTIAL', label: t.potential },
                            { value: 'NEGOTIATING', label: t.negotiating },
                            { value: 'AGREED', label: t.agreed },
                        ]}
                        onChange={(e: any) => setForm({ ...form, status: e.target.value })}
                    />

                    {form.status === 'AGREED' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label={t.packagePrice} type="number" value={form.packagePrice} onChange={(e: any) => setForm({ ...form, packagePrice: e.target.value })} placeholder="5000" />
                                <Input label={t.expiryDate} type="date" value={form.endDate} onChange={(e: any) => setForm({ ...form, endDate: e.target.value })} />
                            </div>
                            <Input label={t.packageDesc} value={form.packageDesc} onChange={(e: any) => setForm({ ...form, packageDesc: e.target.value })} placeholder="Silver Package - 12 Posts" />
                        </motion.div>
                    )}

                    <div className="flex justify-end gap-3 pt-8 border-t border-slate-100">
                        <button className="px-8 py-3 rounded-xl bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button
                            onClick={handleSave}
                            className="px-10 py-3 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20"
                        >
                            {editingId ? 'Update Record' : 'Deploy Lead'}
                        </button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}
