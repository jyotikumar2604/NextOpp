import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '../../api';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'One uppercase letter required')
    .regex(/[0-9]/, 'One number required'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    if (!token) return toast.error('Invalid reset link.');
    try {
      await authAPI.resetPassword({ token, password: data.password });
      toast.success('Password reset successfully.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Reset failed. The link may have expired.');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-5">
        <div className="card p-8 max-w-sm text-center">
          <p className="text-charcoal-600 mb-4">Invalid or missing reset token.</p>
          <Link to="/forgot-password" className="btn-primary">Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-charcoal-800 mb-8 transition-base">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <h1 className="font-serif text-3xl text-charcoal-900 mb-1">Set new password</h1>
        <p className="text-charcoal-500 text-sm mb-8">Enter your new password below.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label">New password</label>
            <input type="password" className={`input ${errors.password ? 'input-error' : ''}`} {...register('password')} />
            {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input type="password" className={`input ${errors.confirmPassword ? 'input-error' : ''}`} {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3">
            {isSubmitting ? 'Resetting…' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  );
}
