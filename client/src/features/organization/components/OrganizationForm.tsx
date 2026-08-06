import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Image, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { InputField } from '@/components/ui/InputField';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { organizationFormSchema, OrganizationFormValues } from '../schemas/organization.schema';
import { OrganizationDetails } from '../types';
import { useUpdateOrganization } from '../hooks/useOrganizationQueries';

export interface OrganizationFormProps {
  initialData: OrganizationDetails;
}

export const OrganizationForm: React.FC<OrganizationFormProps> = ({ initialData }) => {
  const updateMutation = useUpdateOrganization(initialData.id);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: initialData.name || '',
      code: initialData.code || '',
      description: initialData.description || '',
      logoUrl: initialData.logoUrl || '',
    },
  });

  const onSubmit = (values: OrganizationFormValues) => {
    setSuccessMessage(null);
    updateMutation.mutate(
      {
        name: values.name,
        description: values.description || undefined,
        logoUrl: values.logoUrl || undefined,
      },
      {
        onSuccess: () => {
          setSuccessMessage('Organization profile updated successfully');
          setTimeout(() => setSuccessMessage(null), 4000);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Organization Details</h3>
          <p className="text-xs text-slate-400">Update your institution's public profile information</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-brand-950 border border-brand-800 text-brand-400">
          CODE: {initialData.code}
        </span>
      </div>

      {updateMutation.isError && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{updateMutation.error.message || 'Failed to update organization profile'}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Organization Name"
          icon={<Building2 className="w-4 h-4" />}
          placeholder="e.g. Metro Health Medical Center"
          error={errors.name?.message}
          {...register('name')}
        />

        <InputField
          label="Organization Code (Read-Only)"
          value={initialData.code}
          disabled
          helperText="Unique code assigned during creation"
        />
      </div>

      <InputField
        label="Logo Image URL"
        icon={<Image className="w-4 h-4" />}
        placeholder="https://domain.com/logo.png"
        helperText="Direct HTTPS image link to your logo"
        error={errors.logoUrl?.message}
        {...register('logoUrl')}
      />

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Description
        </label>
        <div className="relative">
          <textarea
            rows={3}
            className="w-full rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-100 text-sm p-3.5 focus:outline-none transition-all placeholder:text-slate-500"
            placeholder="Brief description of your organization..."
            {...register('description')}
          />
        </div>
        {errors.description && (
          <p className="text-xs text-rose-400 font-medium">{errors.description.message}</p>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <SubmitButton
          type="submit"
          isLoading={updateMutation.isPending}
          disabled={!isDirty}
          icon={<Save className="w-4 h-4" />}
          className="w-auto px-6"
        >
          Save Profile Changes
        </SubmitButton>
      </div>
    </form>
  );
};
