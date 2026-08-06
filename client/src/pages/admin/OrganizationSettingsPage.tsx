import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrganizationDetails } from '@/features/organization/hooks/useOrganizationQueries';
import { SettingsForm } from '@/features/organization/components/SettingsForm';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

export const OrganizationSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const orgId = user?.organizationId || '';

  const { data: org, isLoading, isError, error, refetch } = useOrganizationDetails(orgId);

  if (isLoading) {
    return <LoadingState message="Loading organization settings..." rows={3} />;
  }

  if (isError || !org || !org.settings) {
    return (
      <ErrorState
        title="Failed to load Organization Settings"
        message={error?.message || 'Could not fetch organization settings.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Organization Settings</h1>
        <p className="text-xs text-slate-400">Configure queue quotas, notification gateways, and automated ticket calling</p>
      </div>

      <SettingsForm organizationId={org.id} initialSettings={org.settings} />
    </div>
  );
};
