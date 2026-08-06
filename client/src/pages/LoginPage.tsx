import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthCard } from '@/components/ui/AuthCard';
import { InputField } from '@/components/ui/InputField';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { useLogin } from '@/features/auth/hooks/useAuthQueries';
import { loginFormSchema, LoginFormValues } from '@/features/auth/schemas/auth.schema';
import { UserRole } from '@/features/auth/types';

export const getRoleDashboardPath = (role: UserRole): string => {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/super-admin/dashboard';
    case 'ORG_ADMIN':
      return '/admin/dashboard';
    case 'STAFF':
      return '/staff/dashboard';
    case 'CUSTOMER':
    default:
      return '/customer/dashboard';
  }
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fromLocation = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setSuccessMessage(null);
    loginMutation.mutate(
      { email: values.email, password: values.password },
      {
        onSuccess: (data) => {
          setSuccessMessage(`Welcome back, ${data.user.fullName}! Redirecting to dashboard...`);
          const targetPath = fromLocation || getRoleDashboardPath(data.user.role);
          setTimeout(() => {
            navigate(targetPath, { replace: true });
          }, 600);
        },
      }
    );
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Enter your credentials to access your QueueFlow account"
      footer={
        <p className="text-slate-400">
          Don't have an account?{' '}
          <Link to="/auth/register" className="font-semibold text-brand-400 hover:text-brand-300 underline underline-offset-4">
            Sign up now
          </Link>
        </p>
      }
    >
      {/* Banner Error Feedback */}
      {loginMutation.isError && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <span className="font-semibold">Authentication Error</span>
            <p>{loginMutation.error.message || 'Invalid email or password.'}</p>
          </div>
        </div>
      )}

      {/* Banner Success Feedback */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email Input */}
        <InputField
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          autoComplete="email"
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Password Input */}
        <PasswordInput
          label="Password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-brand-600 focus:ring-brand-500/40 focus:ring-offset-0 transition-colors"
              {...register('rememberMe')}
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            onClick={() => alert('Forgot password functionality placeholder')}
            className="text-brand-400 hover:text-brand-300 font-medium hover:underline focus:outline-none"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <SubmitButton
            isLoading={loginMutation.isPending}
            loadingText="Authenticating..."
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </SubmitButton>
        </div>
      </form>
    </AuthCard>
  );
};
