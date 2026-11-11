import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Enter a valid email').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed. Check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-charcoal-900 flex-col p-12">
        <Link to="/" className="flex items-center gap-2.5 mb-auto">
          <div className="w-8 h-8 bg-rust-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif text-xl text-cream-100">NextOpp</span>
        </Link>
        <div className="mb-auto">
          <blockquote className="font-serif text-4xl text-cream-100 leading-tight mb-6 text-balance">
            "Find the role. Fix the gaps. Make your move."
          </blockquote>
          <p className="text-charcoal-400 text-sm leading-relaxed">
            Intelligent opportunity discovery for college students — internships, scholarships, fellowships, hackathons, and more.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-charcoal-800 mb-8 transition-base">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-charcoal-900 rounded-lg flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5 text-cream-100" />
            </div>
            <span className="font-serif text-lg text-charcoal-900">NextOpp</span>
          </div>

          <h1 className="font-serif text-3xl text-charcoal-900 mb-1">Welcome back</h1>
          <p className="text-charcoal-500 text-sm mb-8">Log in to your account to continue.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="you@university.edu"
                id="email"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-charcoal-500 hover:text-charcoal-800">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  id="password"
                  autoComplete="current-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center py-3"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-cream-200 border-t-transparent rounded-full animate-spin" />
                  Logging in…
                </span>
              ) : 'Log in'}
            </button>
          </form>

          <p className="text-sm text-charcoal-500 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-rust-600 hover:text-rust-700 font-medium">
              Sign up free
            </Link>
          </p>

          <div className="mt-8 p-4 bg-charcoal-50 rounded-lg border border-charcoal-100">
            <p className="text-xs text-charcoal-500 font-medium mb-2">Demo accounts:</p>
            <p className="text-xs text-charcoal-600">Student: <code>demo@nextopp.dev</code> / <code>Demo@123456</code></p>
            <p className="text-xs text-charcoal-600">Admin: <code>admin@nextopp.dev</code> / <code>Admin@123456</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
