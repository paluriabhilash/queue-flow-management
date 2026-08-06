import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Tag, Save, AlertCircle } from 'lucide-react';
import { FormModal } from '@/components/ui/FormModal';
import { InputField } from '@/components/ui/InputField';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { holidayFormSchema, HolidayFormValues } from '../schemas/branch.schema';
import { Holiday } from '../types';

export interface HolidayModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: HolidayFormValues) => void;
  isLoading: boolean;
  error?: string | null;
  initialData?: Holiday | null;
}

export const HolidayModalForm: React.FC<HolidayModalFormProps> = ({
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
    formState: { errors },
  } = useForm<HolidayFormValues>({
    resolver: zodResolver(holidayFormSchema),
    defaultValues: {
      name: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      const dateString = new Date(initialData.date).toISOString().split('T')[0];
      reset({
        name: initialData.name,
        date: dateString,
        description: initialData.description || '',
      });
    } else {
      reset({
        name: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
    }
  }, [initialData, reset, isOpen]);

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Holiday Entry' : 'Schedule Branch Holiday'}
      subtitle="Configure branch closures for national or local holidays"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <InputField
          label="Holiday Name"
          icon={<Tag className="w-4 h-4" />}
          placeholder="e.g. National Foundation Day"
          error={errors.name?.message}
          {...register('name')}
        />

        <InputField
          label="Holiday Date"
          type="date"
          icon={<Calendar className="w-4 h-4" />}
          error={errors.date?.message}
          {...register('date')}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Description (Optional)
          </label>
          <textarea
            rows={2}
            className="w-full rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-100 text-sm p-3 focus:outline-none transition-all placeholder:text-slate-500"
            placeholder="Additional notes about facility closure..."
            {...register('description')}
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
            {isEditing ? 'Save Holiday' : 'Add Holiday'}
          </SubmitButton>
        </div>
      </form>
    </FormModal>
  );
};
