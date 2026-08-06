import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Settings, Hash, Palette, Bell, Zap, Save, CheckCircle2, AlertCircle, Key } from 'lucide-react';
import { InputField } from '@/components/ui/InputField';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { organizationSettingsFormSchema, OrganizationSettingsFormValues } from '../schemas/organization.schema';
import { OrganizationSettings } from '../types';
import { useUpdateOrganizationSettings } from '../hooks/useOrganizationQueries';

export interface SettingsFormProps {
  organizationId: string;
  initialSettings: OrganizationSettings;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ organizationId, initialSettings }) => {
  const updateSettingsMutation = useUpdateOrganizationSettings(organizationId);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isDirty },
  } = useForm<OrganizationSettingsFormValues>({
    resolver: zodResolver(organizationSettingsFormSchema),
    defaultValues: {
      maxTokensPerDay: initialSettings.maxTokensPerDay || 500,
      autoCallEnabled: initialSettings.autoCallEnabled ?? false,
      smsGatewayEnabled: initialSettings.smsGatewayEnabled ?? false,
      smsApiKey: initialSettings.smsApiKey || '',
      themeColor: initialSettings.themeColor || '#0c8ce9',
    },
  });

  const isSmsEnabled = watch('smsGatewayEnabled');

  const onSubmit = (values: OrganizationSettingsFormValues) => {
    setSuccessMessage(null);
    updateSettingsMutation.mutate(
      {
        maxTokensPerDay: Number(values.maxTokensPerDay),
        autoCallEnabled: values.autoCallEnabled,
        smsGatewayEnabled: values.smsGatewayEnabled,
        smsApiKey: values.smsApiKey || undefined,
        themeColor: values.themeColor,
      },
      {
        onSuccess: () => {
          setSuccessMessage('Organization settings saved successfully');
          setTimeout(() => setSuccessMessage(null), 4000);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-400" /> Queue & System Settings
          </h3>
          <p className="text-xs text-slate-400">Configure daily queue limits, notification gateways, and theme branding</p>
        </div>
      </div>

      {updateSettingsMutation.isError && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{updateSettingsMutation.error.message || 'Failed to update settings'}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Queue Limits & Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Maximum Daily Tokens Limit"
          type="number"
          icon={<Hash className="w-4 h-4" />}
          placeholder="500"
          helperText="Total token bookings allowed per day across all branches"
          error={errors.maxTokensPerDay?.message}
          {...register('maxTokensPerDay')}
        />

        <InputField
          label="Brand Theme Color (Hex Code)"
          type="text"
          icon={<Palette className="w-4 h-4" />}
          placeholder="#0c8ce9"
          helperText="Primary color for customer queue screens"
          error={errors.themeColor?.message}
          {...register('themeColor')}
        />
      </div>

      {/* Toggles */}
      <div className="space-y-4 pt-2 border-t border-slate-800/60">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Automations & Notifications</h4>

        {/* Auto Call Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-950 text-amber-400 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-slate-200">Auto-Call Next Token</h5>
              <p className="text-xs text-slate-400">Automatically call the next waiting token when counter becomes available</p>
            </div>
          </div>
          <Controller
            name="autoCallEnabled"
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

        {/* SMS Gateway Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-brand-950 text-brand-400 mt-0.5">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-slate-200">SMS Notification Dispatch</h5>
              <p className="text-xs text-slate-400">Send SMS text alerts when customer turn is 3 positions away</p>
            </div>
          </div>
          <Controller
            name="smsGatewayEnabled"
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

        {isSmsEnabled && (
          <InputField
            label="SMS Provider API Key"
            type="password"
            icon={<Key className="w-4 h-4" />}
            placeholder="sk_live_sample_key..."
            helperText="Twilio or SMS Gateway Secret Key"
            error={errors.smsApiKey?.message}
            {...register('smsApiKey')}
          />
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <SubmitButton
          type="submit"
          isLoading={updateSettingsMutation.isPending}
          disabled={!isDirty}
          icon={<Save className="w-4 h-4" />}
          className="w-auto px-6"
        >
          Save Settings
        </SubmitButton>
      </div>
    </form>
  );
};
