'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsersWithRatings, getRatingsForUser, submitRating, getMyGivenRatings } from '@/lib/actions/ratings';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { PageHeader, StatCard } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Users, TrendingUp, Award, MessageSquare, ChevronRight, BarChart2 } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

function StarRating({ value, onChange, size = 24 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHover(s)}
          onMouseLeave={() => onChange && setHover(0)}
          className={clsx('transition-all', onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default')}
        >
          <Star
            size={size}
            className={clsx(
              'transition-colors',
              (hover || value) >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default function RatingsPage() {
  const { user } = useAuthStore();
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  const queryClient = useQueryClient();

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [ratingModal, setRatingModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [tab, setTab] = useState<'all' | 'given'>('all');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['ratings-users'],
    queryFn: async () => { const r = await getAllUsersWithRatings(); return r.data || []; },
  });

  const { data: detailData } = useQuery({
    queryKey: ['user-ratings-detail', selectedUser?.id],
    queryFn: async () => { const r = await getRatingsForUser(selectedUser.id); return r.data; },
    enabled: !!selectedUser && detailModal,
  });

  const { data: givenRatings = [] } = useQuery({
    queryKey: ['my-given-ratings'],
    queryFn: async () => { const r = await getMyGivenRatings(); return r.data || []; },
    enabled: tab === 'given',
  });

  const mutation = useMutation({
    mutationFn: () => submitRating(selectedUser.id, stars, comment),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(isRtl
          ? res.updated ? 'تم تحديث التقييم' : 'تم إرسال التقييم بنجاح'
          : res.updated ? 'Rating updated' : 'Rating submitted!'
        );
        setRatingModal(false);
        setStars(5);
        setComment('');
        queryClient.invalidateQueries({ queryKey: ['ratings-users'] });
        queryClient.invalidateQueries({ queryKey: ['my-given-ratings'] });
      } else {
        toast.error(res.error || 'Failed');
      }
    },
  });

  const myUser = users.find((u: any) => u.id === user?.id);
  const totalRatings = users.reduce((s: number, u: any) => s + u.ratingsCount, 0);
  const topRated = [...users].sort((a: any, b: any) => b.avgRating - a.avgRating)[0];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <PageHeader
        title={isRtl ? 'تقييم الأداء' : 'Performance Ratings'}
        description={isRtl ? 'قيّم زملاءك وتابع تقييماتك' : 'Rate your colleagues and track your performance score'}
      />

      {/* Stats */}
      <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label={isRtl ? 'إجمالي التقييمات' : 'Total Ratings'} value={totalRatings} icon={<Star size={18} />} />
        <StatCard label={isRtl ? 'تقييمي' : 'My Score'} value={myUser?.avgRating || 0} icon={<TrendingUp size={18} />} delta={`${myUser?.ratingsCount || 0} reviews`} />
        <StatCard label={isRtl ? 'الأعلى تقييماً' : 'Top Rated'} value={topRated ? `${topRated.firstName} ${topRated.lastName}` : '-'} icon={<Award size={18} />} delta={topRated ? `${topRated.avgRating}★` : ''} />
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeIn} className="flex gap-2 p-1 bg-slate-50 border border-slate-100 rounded-2xl w-fit">
        {(['all', 'given'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              tab === t ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-slate-400 hover:text-slate-700'
            )}
          >
            {t === 'all' ? (isRtl ? 'جميع الموظفين' : 'All Employees') : (isRtl ? 'تقييماتي المُرسلة' : 'My Given Ratings')}
          </button>
        ))}
      </motion.div>

      {/* All Users Grid */}
      {tab === 'all' && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading
            ? Array(6).fill(0).map((_, i) => <div key={i} className="h-48 bg-slate-50 rounded-3xl animate-pulse" />)
            : users
                .filter((u: any) => u.id !== user?.id)
                .map((u: any) => (
                  <motion.div
                    key={u.id}
                    variants={fadeIn}
                    className="bg-white border border-slate-100 rounded-3xl p-7 shadow-sm hover:shadow-md hover:border-brand/20 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center font-black text-xl text-brand group-hover:scale-110 transition-transform">
                          {u.firstName[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm uppercase tracking-tight">{u.firstName} {u.lastName}</p>
                          <p className="text-[10px] font-black text-brand uppercase tracking-widest">{u.role?.replace('_', ' ')}</p>
                          {u.department && <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{u.department}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="mb-5">
                      <StarRating value={Math.round(u.avgRating)} size={18} />
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-2xl font-black text-slate-900">{u.avgRating || '—'}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {u.ratingsCount} {isRtl ? 'تقييم' : 'reviews'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedUser(u); setStars(5); setComment(''); setRatingModal(true); }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand/90 transition-all shadow-lg shadow-brand/20"
                      >
                        <Star size={12} /> {isRtl ? 'تقييم' : 'Rate'}
                      </button>
                      <button
                        onClick={() => { setSelectedUser(u); setDetailModal(true); }}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-brand hover:border-brand/30 transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
          }
        </motion.div>
      )}

      {/* My Given Ratings */}
      {tab === 'given' && (
        <motion.div variants={fadeIn} className="space-y-3">
          {givenRatings.length === 0 ? (
            <div className="glass-card py-24 text-center bg-white border-slate-100">
              <Star size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {isRtl ? 'لم تقم بأي تقييم بعد' : 'No ratings given yet'}
              </p>
            </div>
          ) : givenRatings.map((r: any) => (
            <div key={r.id} className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-slate-700 text-lg">
                {r.receiver.firstName[0]}
              </div>
              <div className="flex-1">
                <p className="font-black text-slate-900 text-sm uppercase tracking-tight">{r.receiver.firstName} {r.receiver.lastName}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.receiver.role} · {r.receiver.department}</p>
                {r.comment && <p className="text-xs text-slate-500 mt-1 italic">"{r.comment}"</p>}
              </div>
              <div className="text-right">
                <StarRating value={r.stars} size={16} />
                <p className="text-[9px] font-black text-slate-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Rate Modal */}
      <Modal open={ratingModal} onClose={() => setRatingModal(false)} title={isRtl ? `تقييم ${selectedUser?.firstName}` : `Rate ${selectedUser?.firstName}`}>
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center font-black text-xl text-brand">
              {selectedUser?.firstName?.[0]}
            </div>
            <div>
              <p className="font-black text-slate-900 uppercase">{selectedUser?.firstName} {selectedUser?.lastName}</p>
              <p className="text-[10px] font-black text-brand uppercase tracking-widest">{selectedUser?.role}</p>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
              {isRtl ? 'التقييم' : 'Rating'}
            </label>
            <StarRating value={stars} onChange={setStars} size={36} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
              {['', isRtl ? 'ضعيف جداً' : 'Very Poor', isRtl ? 'ضعيف' : 'Poor', isRtl ? 'متوسط' : 'Average', isRtl ? 'جيد' : 'Good', isRtl ? 'ممتاز' : 'Excellent'][stars]}
            </p>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              {isRtl ? 'تعليق (اختياري)' : 'Comment (Optional)'}
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              placeholder={isRtl ? 'أضف تعليقاً...' : 'Add a comment...'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand/40 transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button onClick={() => setRatingModal(false)} className="px-6 py-3 rounded-xl bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100">
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="px-8 py-3 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 disabled:opacity-50"
            >
              {mutation.isPending ? '...' : (isRtl ? 'إرسال التقييم' : 'Submit Rating')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={isRtl ? `تقييمات ${selectedUser?.firstName}` : `${selectedUser?.firstName}'s Reviews`}>
        <div className="space-y-4 pt-4">
          {detailData && (
            <>
              <div className="flex items-center gap-4 p-5 bg-brand/5 rounded-2xl border border-brand/10">
                <div className="text-center">
                  <p className="text-4xl font-black text-brand">{detailData.avg || '—'}</p>
                  <StarRating value={Math.round(detailData.avg)} size={16} />
                  <p className="text-[10px] font-black text-slate-400 mt-1">{detailData.ratings.length} {isRtl ? 'تقييم' : 'reviews'}</p>
                </div>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {detailData.ratings.length === 0 ? (
                  <p className="text-center text-slate-400 text-[10px] font-black uppercase py-10">{isRtl ? 'لا توجد تقييمات' : 'No reviews yet'}</p>
                ) : detailData.ratings.map((r: any) => (
                  <div key={r.id} className="bg-white border border-slate-100 rounded-xl p-4 flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-slate-700">
                      {r.giver.firstName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-black text-slate-900 uppercase">{r.giver.firstName} {r.giver.lastName}</p>
                        <StarRating value={r.stars} size={13} />
                      </div>
                      {r.comment && <p className="text-xs text-slate-500 italic">"{r.comment}"</p>}
                      <p className="text-[9px] text-slate-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Modal>
    </motion.div>
  );
}
