import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { authAPI } from '../../api';
import { ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Enter a valid email').toLowerCase(),
});

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await authAPI.forgotPassword(data.email);
      setSent(true);
    } catch (err) {
      toast.error(err.message || 'Something went wrong.');
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-charcoal-800 mb-8 transition-base">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        {sent ? (
          <div className="card p-8 text-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Mail className="w-7 h-7 text-emerald-600" />
            </div>
            <h1 className="font-serif text-2xl text-charcoal-900 mb-3">Check your inbox</h1>
            <p className="text-sm text-charcoal-500 mb-6">
              If an account with that email exists, we've sent password reset instructions.
            </p>
            <Link to="/login" className="btn-primary w-full justify-center">Return to login</Link>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-3xl text-charcoal-900 mb-1">Reset password</h1>
            <p className="text-charcoal-500 text-sm mb-8">
              Enter your email and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@university.edu"
                  id="email"
                  {...register('email')}
                />
                {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3">
                {isSubmitting ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
