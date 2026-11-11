import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Enter a valid email').toLowerCase(),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[0-9]/, 'Include at least one number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const REQUIREMENTS = [
  { test: (p) => p.length >= 8, label: '8+ characters' },
  { test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p) => /[0-9]/.test(p), label: 'One number' },
];

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password });
      toast.success('Account created! Let\'s set up your profile.');
      navigate('/onboarding');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-cream flex">
      <div className="hidden lg:flex lg:w-1/2 bg-charcoal-900 flex-col p-12">
        <Link to="/" className="flex items-center gap-2.5 mb-auto">
          <div className="w-8 h-8 bg-rust-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif text-xl text-cream-100">NextOpp</span>
        </Link>
        <div className="mb-auto">
          <p className="text-charcoal-400 text-sm mb-8">Join thousands of students discovering their best opportunities.</p>
          {[
            'Personalized match scores for every opportunity',
            'Skill gap analysis with learning recommendations',
            'Track applications from applied to offer',
            'AI-powered career insights',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 bg-rust-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-cream-200 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-charcoal-800 mb-8 transition-base">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <h1 className="font-serif text-3xl text-charcoal-900 mb-1">Create your account</h1>
          <p className="text-charcoal-500 text-sm mb-8">Free for students. No credit card required.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="Alex Chen"
                id="name"
                autoComplete="name"
                {...register('name')}
              />
              {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>}
            </div>

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
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Create a strong password"
                  id="password"
                  autoComplete="new-password"
                  {...register('password', {
                    onChange: (e) => setPasswordValue(e.target.value),
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Requirements */}
              {passwordValue && (
                <div className="mt-2 space-y-1">
                  {REQUIREMENTS.map(({ test, label }) => (
                    <div key={label} className={`flex items-center gap-1.5 text-xs ${test(passwordValue) ? 'text-emerald-600' : 'text-charcoal-400'}`}>
                      <Check className={`w-3 h-3 ${test(passwordValue) ? 'opacity-100' : 'opacity-30'}`} />
                      {label}
                    </div>
                  ))}
                </div>
              )}
              {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm password</label>
              <input
                type="password"
                className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Repeat your password"
                id="confirmPassword"
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-accent w-full justify-center py-3"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-charcoal-500 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-rust-600 hover:text-rust-700 font-medium">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
