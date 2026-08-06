import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Monitor, Hash, Save, AlertCircle } from 'lucide-react';
import { FormModal } from '@/components/ui/FormModal';
import { InputField } from '@/components/ui/InputField';
import { BranchSelector } from '@/components/ui/BranchSelector';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { counterFormSchema, CounterFormValues } from '../schemas/counter.schema';
import { CounterItem } from '../types';

export interface CounterModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CounterFormValues) => void;
  isLoading: boolean;
  error?: string | null;
  initialCounter?: CounterItem | null;
  defaultBranchId?: string;
}

export const CounterModalForm: React.FC<CounterModalFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error,
  initialCounter,
  defaultBranchId,
}) => {
  const isEditing = !!initialCounter;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CounterFormValues>({
    resolver: zodResolver(counterFormSchema),
    defaultValues: {
      branchId: defaultBranchId || '',
      name: '',
      number: 1,
      status: 'CLOSED',
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialCounter) {
      reset({
        branchId: initialCounter.branchId || defaultBranchId || '',
        name: initialCounter.name,
        number: initialCounter.number,
        status: initialCounter.status || 'CLOSED',
        isActive: initialCounter.isActive,
      });
    } else {
      reset({
        branchId: defaultBranchId || '',
        name: '',
        number: 1,
        status: 'CLOSED',
        isActive: true,
      });
    }
  }, [initialCounter, defaultBranchId, reset, isOpen]);

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Counter Desk' : 'Create New Counter Desk'}
      subtitle={isEditing ? 'Update counter name, number, or operating status' : 'Register a new service counter for queue dispatch'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Branch Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Target Branch Location
          </label>
          <Controller
            name="branchId"
            control={control}
            render={({ field }) => (
              <BranchSelector
                value={field.value}
                onChange={field.onChange}
                disabled={isEditing}
              />
            )}
          />
          {errors.branchId && <p className="text-xs text-rose-400 font-medium">{errors.branchId.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Counter Name"
            icon={<Monitor className="w-4 h-4" />}
            placeholder="e.g. Counter 01 - Helpdesk"
            error={errors.name?.message}
            {...register('name')}
          />

          <InputField
            label="Counter Number"
            type="number"
            icon={<Hash className="w-4 h-4" />}
            placeholder="1"
            disabled={isEditing}
            helperText={isEditing ? 'Counter number cannot be changed' : 'Unique number in branch'}
            error={errors.number?.message}
            {...register('number')}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Initial Counter Status
          </label>
          <select
            className="w-full rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm p-2.5 focus:outline-none focus:border-brand-500"
            {...register('status')}
          >
            <option value="OPEN">OPEN (Serving Queue)</option>
            <option value="PAUSED">PAUSED (Break Time)</option>
            <option value="CLOSED">CLOSED (Non-operational)</option>
            <option value="MAINTENANCE">MAINTENANCE (System Repair)</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Counter Active State</span>
            <span className="text-[11px] text-slate-400 font-normal">Controls whether staff can log in to this counter</span>
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
            {isEditing ? 'Save Counter' : 'Create Counter'}
          </SubmitButton>
        </div>
      </form>
    </FormModal>
  );
};
