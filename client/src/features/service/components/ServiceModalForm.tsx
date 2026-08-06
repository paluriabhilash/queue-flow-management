import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layers, Tag, Save, AlertCircle, Sparkles } from 'lucide-react';
import { FormModal } from '@/components/ui/FormModal';
import { InputField } from '@/components/ui/InputField';
import { DurationInput } from '@/components/ui/DurationInput';
import { BranchSelector } from '@/components/ui/BranchSelector';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { serviceFormSchema, ServiceFormValues } from '../schemas/service.schema';
import { ServiceItem, PriorityLevel } from '../types';

export interface ServiceModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ServiceFormValues) => void;
  isLoading: boolean;
  error?: string | null;
  initialService?: ServiceItem | null;
  defaultBranchId?: string;
}

export const ServiceModalForm: React.FC<ServiceModalFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error,
  initialService,
  defaultBranchId,
}) => {
  const isEditing = !!initialService;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      branchId: defaultBranchId || '',
      name: '',
      code: '',
      description: '',
      avgServiceTime: 10,
      priority: 'NORMAL',
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialService) {
      reset({
        branchId: initialService.department?.branchId || defaultBranchId || '',
        name: initialService.name,
        code: initialService.code,
        description: initialService.description || '',
        avgServiceTime: initialService.avgServiceTimeMins,
        priority: initialService.priority || 'NORMAL',
        isActive: initialService.isActive,
      });
    } else {
      reset({
        branchId: defaultBranchId || '',
        name: '',
        code: '',
        description: '',
        avgServiceTime: 10,
        priority: 'NORMAL',
        isActive: true,
      });
    }
  }, [initialService, defaultBranchId, reset, isOpen]);

  const applyPreset = (name: string, code: string, time: number, prio: PriorityLevel) => {
    setValue('name', name);
    setValue('code', code);
    setValue('avgServiceTime', time);
    setValue('priority', prio);
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Service Details' : 'Create New Service'}
      subtitle={isEditing ? 'Update service duration, code, or priority level' : 'Configure queue service offered at a branch'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Example Presets (Only when creating) */}
        {!isEditing && (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Sparkles className="w-3 h-3 text-amber-400" /> Quick Preset Examples
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset('Patient Registration & Triage', 'REG', 5, 'NORMAL')}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
              >
                Registration (REG - 5m)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('Doctor Consultation', 'DOC', 15, 'NORMAL')}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
              >
                Consultation (DOC - 15m)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('Emergency Assessment', 'EMG', 10, 'EMERGENCY')}
                className="px-2.5 py-1 rounded-lg text-xs bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 text-rose-300 transition-colors"
              >
                Emergency (EMG - 10m)
              </button>
            </div>
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
            label="Service Name"
            icon={<Layers className="w-4 h-4" />}
            placeholder="e.g. Patient Registration"
            error={errors.name?.message}
            {...register('name')}
          />

          <InputField
            label="Service Code / Prefix"
            icon={<Tag className="w-4 h-4" />}
            placeholder="e.g. REG"
            disabled={isEditing}
            helperText={isEditing ? 'Service code cannot be modified' : 'Prefix used for queue tokens'}
            error={errors.code?.message}
            {...register('code')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="avgServiceTime"
            control={control}
            render={({ field }) => (
              <DurationInput
                value={field.value}
                onChange={field.onChange}
                error={errors.avgServiceTime?.message}
              />
            )}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Priority Level
            </label>
            <select
              className="w-full rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm p-2.5 focus:outline-none focus:border-brand-500"
              {...register('priority')}
            >
              <option value="NORMAL">Normal Priority</option>
              <option value="SENIOR_CITIZEN">Senior / Disability</option>
              <option value="HIGH">High Priority</option>
              <option value="EMERGENCY">EMERGENCY (Top Queue Priority)</option>
              <option value="VIP">VIP Priority</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Description (Optional)
          </label>
          <textarea
            rows={2}
            className="w-full rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-100 text-sm p-3 focus:outline-none transition-all placeholder:text-slate-500"
            placeholder="Brief notes on counter requirements..."
            {...register('description')}
          />
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Service Status</span>
            <span className="text-[11px] text-slate-400">Controls whether customers can book tokens for this service</span>
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
            {isEditing ? 'Save Service' : 'Create Service'}
          </SubmitButton>
        </div>
      </form>
    </FormModal>
  );
};
