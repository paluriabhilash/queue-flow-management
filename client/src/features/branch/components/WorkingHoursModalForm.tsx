import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, AlertCircle } from 'lucide-react';
import { FormModal } from '@/components/ui/FormModal';
import { TimePicker } from '@/components/ui/TimePicker';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { workingHourFormSchema, WorkingHourFormValues } from '../schemas/branch.schema';
import { WorkingHour, DayOfWeek } from '../types';

export interface WorkingHoursModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: WorkingHourFormValues) => void;
  isLoading: boolean;
  error?: string | null;
  initialData?: WorkingHour | null;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export const WorkingHoursModalForm: React.FC<WorkingHoursModalFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error,
  initialData,
}) => {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<WorkingHourFormValues>({
    resolver: zodResolver(workingHourFormSchema),
    defaultValues: {
      dayOfWeek: 'MONDAY',
      openTime: '08:00',
      closeTime: '17:00',
      lunchStartTime: '12:00',
      lunchEndTime: '13:00',
      isClosed: false,
    },
  });

  const isClosed = watch('isClosed');

  useEffect(() => {
    if (initialData) {
      reset({
        dayOfWeek: initialData.dayOfWeek,
        openTime: initialData.openTime,
        closeTime: initialData.closeTime,
        lunchStartTime: initialData.lunchStartTime || '',
        lunchEndTime: initialData.lunchEndTime || '',
        isClosed: initialData.isClosed,
      });
    } else {
      reset({
        dayOfWeek: 'MONDAY',
        openTime: '08:00',
        closeTime: '17:00',
        lunchStartTime: '12:00',
        lunchEndTime: '13:00',
        isClosed: false,
      });
    }
  }, [initialData, reset, isOpen]);

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Operating Hours' : 'Add Operating Hours'}
      subtitle="Set daily opening, closing, and lunch break hours for this branch"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Day of Week
          </label>
          <select
            disabled={isEditing}
            className="w-full rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm p-3 focus:outline-none focus:border-brand-500 disabled:opacity-60"
            {...register('dayOfWeek')}
          >
            {DAYS_OF_WEEK.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
          {errors.dayOfWeek && <p className="text-xs text-rose-400 font-medium">{errors.dayOfWeek.message}</p>}
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Mark as Closed Day</span>
            <span className="text-[11px] text-slate-400">Branch is non-operational on this day</span>
          </div>

          <Controller
            name="isClosed"
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

        {!isClosed && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <TimePicker
                label="Opening Time"
                error={errors.openTime?.message}
                {...register('openTime')}
              />
              <TimePicker
                label="Closing Time"
                error={errors.closeTime?.message}
                {...register('closeTime')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
              <TimePicker
                label="Lunch Start Time (Optional)"
                error={errors.lunchStartTime?.message}
                {...register('lunchStartTime')}
              />
              <TimePicker
                label="Lunch End Time (Optional)"
                error={errors.lunchEndTime?.message}
                {...register('lunchEndTime')}
              />
            </div>
          </div>
        )}

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
            {isEditing ? 'Save Hours' : 'Add Hours'}
          </SubmitButton>
        </div>
      </form>
    </FormModal>
  );
};
