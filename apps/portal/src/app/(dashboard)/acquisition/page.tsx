'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Users, UserPlus, TrendingUp, Clock, AlertTriangle,
    CheckCircle, Plus, Search, Filter, DollarSign, Calendar
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { getAcquisitionStats, getExpiringClients, createClientLead, updateClientStatus, getLeads } from '@/lib/actions/acquisition';
import toast from 'react-hot-toast';

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
    }
};

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.05 } } };

export default function AcquisitionPage() {
    const { language } = useUIStore();
    const isRtl = language === 'ar';
    const t = T[language as keyof typeof T] || T.en;

    const [stats, setStats] = useState({ POTENTIAL: 0, NEGOTIATING: 0, AGREED: 0 });
    const [expiring, setExpiring] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', status: 'POTENTIAL' });

    const loadData = useCallback(async () => {
        setLoading(true);
        const [sRes, eRes, lRes] = await Promise.all([
            getAcquisitionStats(), 
            getExpiringClients(),
            getLeads()
        ]);
        if (sRes.success && sRes.data) setStats(sRes.data);
        if (eRes.success) setExpiring(eRes.data || []);
        if (lRes.success) setLeads(lRes.data || []);
        setLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleSave = async () => {
        const res = await createClientLead(form);
        if (res.success) {
            toast.success('Lead added');
            setIsModalOpen(false);
            loadData();
        }
    };

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
            <PageHeader
                title={t.title}
                description={t.subtitle}
                action={
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand/90 transition-all shadow-lg shadow-brand/20">
                        <Plus size={14} /> {t.addLead}
                    </button>
                }
            />

            {/* Stats Funnel */}
            <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label={t.potential} value={stats.POTENTIAL} icon={<Users size={18} />} />
                <StatCard label={t.negotiating} value={stats.NEGOTIATING} icon={<Clock size={18} />} />
                <StatCard label={t.agreed} value={stats.AGREED} icon={<CheckCircle size={18} />} trend="up" delta="New" />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Expiring List */}
                <motion.div variants={fadeIn} className="lg:col-span-2 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
                        <AlertTriangle size={16} className="text-rose-500" /> {t.expiring}
                    </h4>
                    <div className="space-y-3">
                        {expiring.length === 0 ? (
                            <div className="glass-card py-12 text-center text-slate-300 border-dashed border-slate-200">
                                <p className="text-[10px] font-black uppercase tracking-widest">{t.noExpiring}</p>
                            </div>
                        ) : expiring.map((c) => (
                            <div key={c.id} className="glass-card !p-6 flex items-center justify-between border-slate-100 group hover:border-brand/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-brand/5 border border-brand/10 flex items-center justify-center text-brand">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{c.name}</p>
                                        <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">
                                            {isRtl ? 'ينتهي في' : 'Expires'}: {new Date(c.smDetails.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.packagePrice}</p>
                                    <p className="text-sm font-black text-slate-900">${c.smDetails.packagePrice?.toString() || '0'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Quick Actions / Summary */}
                <motion.div variants={fadeIn} className="lg:col-span-1">
                    <div className="glass-card !p-8 border-brand/10 bg-brand/5 shadow-inner">
                        <h4 className="text-[10px] font-black text-brand mb-6 flex items-center gap-2 uppercase tracking-[0.3em]">
                            <TrendingUp size={18} /> Performance Insights
                        </h4>
                        <div className="space-y-6">
                            <div className="flex justify-between items-end border-b border-brand/10 pb-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Conversion Rate</p>
                                <p className="text-xl font-black text-slate-900">{Math.round((stats.AGREED / (stats.POTENTIAL + stats.NEGOTIATING + stats.AGREED || 1)) * 100)}%</p>
                            </div>
                            <div className="flex justify-between items-end border-b border-brand/10 pb-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Trials</p>
                                <p className="text-xl font-black text-slate-900">{stats.NEGOTIATING}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* All Leads List */}
            <motion.div variants={fadeIn} className="glass-card !p-0 overflow-hidden border-slate-100">
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">{t.allLeads}</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/30">
                                <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.clientName}</th>
                                <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.phone}</th>
                                <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.status}</th>
                                <th className="px-8 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Added</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {leads.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">{t.noLeads}</td>
                                </tr>
                            ) : leads.map((l: any) => (
                                <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-4 text-sm font-black text-slate-900 uppercase tracking-tight">{l.name}</td>
                                    <td className="px-8 py-4 text-xs font-bold text-slate-500">{l.phone || '-'}</td>
                                    <td className="px-8 py-4">
                                        <span className={clsx(
                                            'text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest',
                                            l.status === 'AGREED' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' :
                                            l.status === 'NEGOTIATING' ? 'text-amber-600 bg-amber-50 border border-amber-100' : 'text-brand bg-brand/5 border border-brand/10'
                                        )}>
                                            {l.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-right text-[10px] text-slate-400 font-black uppercase">
                                        {new Date(l.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Add Lead Modal */}
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={t.addLead}>
                <div className="space-y-6 pt-2">
                    <Input label={t.clientName} icon={Users} value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
                    <Input label={t.phone} icon={TrendingUp} value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value })} />
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
                    <button
                        onClick={handleSave}
                        className="w-full py-4 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-4 hover:bg-brand/90 transition-all shadow-lg shadow-brand/20"
                    >
                        {t.save}
                    </button>
                </div>
            </Modal>
        </motion.div>
    );
}
