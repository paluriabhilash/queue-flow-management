import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Phone, MapPin, Globe, Save, AlertCircle } from 'lucide-react';
import { FormModal } from '@/components/ui/FormModal';
import { InputField } from '@/components/ui/InputField';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { branchFormSchema, BranchFormValues } from '../schemas/branch.schema';
import { Branch } from '../types';

export interface BranchModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: BranchFormValues) => void;
  isLoading: boolean;
  error?: string | null;
  initialBranch?: Branch | null;
}

export const BranchModalForm: React.FC<BranchModalFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error,
  initialBranch,
}) => {
  const isEditing = !!initialBranch;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: '',
      code: '',
      address: '',
      phone: '',
      timeZone: 'UTC',
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialBranch) {
      reset({
        name: initialBranch.name,
        code: initialBranch.code,
        address: initialBranch.address || '',
        phone: initialBranch.phone || '',
        timeZone: initialBranch.timeZone || 'UTC',
        isActive: initialBranch.isActive,
      });
    } else {
      reset({
        name: '',
        code: '',
        address: '',
        phone: '',
        timeZone: 'UTC',
        isActive: true,
      });
    }
  }, [initialBranch, reset, isOpen]);

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Branch Profile' : 'Create New Branch'}
      subtitle={isEditing ? 'Update branch address and operating details' : 'Register a new branch under your organization'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Branch Name"
            icon={<Building2 className="w-4 h-4" />}
            placeholder="e.g. Central Outpatient Wing"
            error={errors.name?.message}
            {...register('name')}
          />

          <InputField
            label="Branch Code"
            placeholder="e.g. WEST01"
            disabled={isEditing}
            helperText={isEditing ? 'Branch code cannot be changed' : 'Unique identifier code'}
            error={errors.code?.message}
            {...register('code')}
          />
        </div>

        <InputField
          label="Physical Address"
          icon={<MapPin className="w-4 h-4" />}
          placeholder="123 Healthcare Ave, Suite 400"
          error={errors.address?.message}
          {...register('address')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Phone Number"
            icon={<Phone className="w-4 h-4" />}
            placeholder="+1 (555) 019-2831"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <InputField
            label="Time Zone"
            icon={<Globe className="w-4 h-4" />}
            placeholder="UTC / America/New_York"
            error={errors.timeZone?.message}
            {...register('timeZone')}
          />
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Branch Status</span>
            <span className="text-[11px] text-slate-400">Controls whether branch can issue queue tokens</span>
          </div>

          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="w-5 h-5 rounded border-slate-800 bg-slate-900 text-brand-600 focus:ring-brand-500/40 cursor-pointer"
              />
            )}
          />
        </div>

        <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            Cancel
          </button>

          <SubmitButton
            type="submit"
            isLoading={isLoading}
            icon={<Save className="w-4 h-4" />}
            className="w-auto px-6"
          >
            {isEditing ? 'Save Branch' : 'Create Branch'}
          </SubmitButton>
        </div>
      </form>
    </FormModal>
  );
};
