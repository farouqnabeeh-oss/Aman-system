import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Building2, ArrowLeft, Mail } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/States';
import api from '../../../lib/axios';
import toast from 'react-hot-toast';

export function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm<{ email: string }>();
  const [sent, setSent] = useState(false);
  const mutation = useMutation({
    mutationFn: (dto: { email: string }) => api.post('/auth/forgot-password', dto),
    onSuccess: () => { setSent(true); toast.success('Reset link sent if email exists'); },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center shadow-glow">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Forgot Password</h1>
          <p className="text-sm text-text-muted text-center">Enter your email and we'll send you a reset link.</p>
        </div>

        <div className="glass-card p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-secondary" />
              </div>
              <p className="text-text-primary font-medium">Check your email</p>
              <p className="text-sm text-text-muted">If that email exists, a reset link has been sent.</p>
              <Link to="/login" className="btn-primary inline-flex">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
              <Input label="Email address" type="email" placeholder="name@company.com" {...register('email', { required: true })} />
              <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
                {mutation.isPending ? <Spinner size="sm" /> : null} Send Reset Link
              </button>
            </form>
          )}
          <Link to="/login" className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mt-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
