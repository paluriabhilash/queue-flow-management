import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Building2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthCard } from '@/components/ui/AuthCard';
import { InputField } from '@/components/ui/InputField';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { useRegister } from '@/features/auth/hooks/useAuthQueries';
import { registerFormSchema, RegisterFormValues } from '@/features/auth/schemas/auth.schema';
import { getRoleDashboardPath } from './LoginPage';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      orgCode: '',
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    setSuccessMessage(null);
    registerMutation.mutate(
      {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password,
      },
      {
        onSuccess: (data) => {
          setSuccessMessage(`Account created successfully! Welcome, ${data.user.fullName}. Redirecting...`);
          const targetPath = getRoleDashboardPath(data.user.role);
          setTimeout(() => {
            navigate(targetPath, { replace: true });
          }, 600);
        },
      }
    );
  };

  return (
    <AuthCard
      title="Create an account"
      subtitle="Join QueueFlow to book tokens and track digital queues online"
      footer={
        <p className="text-slate-400">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold text-brand-400 hover:text-brand-300 underline underline-offset-4">
            Sign in instead
          </Link>
        </p>
      }
    >
      {/* Banner Error Feedback */}
      {registerMutation.isError && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <span className="font-semibold">Registration Error</span>
            <p>{registerMutation.error.message || 'Failed to create account. Please try again.'}</p>
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        {/* Full Name */}
        <InputField
          label="Full Name"
          type="text"
          placeholder="Jane Doe"
          autoComplete="name"
          icon={<User className="w-4 h-4" />}
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        {/* Email */}
        <InputField
          label="Email Address"
          type="email"
          placeholder="jane.doe@example.com"
          autoComplete="email"
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Phone Number */}
        <InputField
          label="Phone Number (Optional)"
          type="tel"
          placeholder="+1 (555) 019-2834"
          autoComplete="tel"
          icon={<Phone className="w-4 h-4" />}
          helperText="Receive SMS notifications when your turn approaches"
          error={errors.phone?.message}
          {...register('phone')}
        />

        {/* Password */}
        <PasswordInput
          label="Password"
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          helperText="Must contain uppercase, lowercase, number, and symbol"
          error={errors.password?.message}
          {...register('password')}
        />

        {/* Confirm Password */}
        <PasswordInput
          label="Confirm Password"
          placeholder="Re-enter password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {/* Optional Organization Code */}
        <InputField
          label="Organization Code (Optional)"
          type="text"
          placeholder="e.g. METROHEALTH"
          icon={<Building2 className="w-4 h-4" />}
          helperText="Enter code if joining a specific hospital or branch queue"
          error={errors.orgCode?.message}
          {...register('orgCode')}
        />

        {/* Submit Button */}
        <div className="pt-2">
          <SubmitButton
            isLoading={registerMutation.isPending}
            loadingText="Creating Account..."
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Create Account
          </SubmitButton>
        </div>
      </form>
    </AuthCard>
  );
};
