import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrganizationDetails } from '@/features/organization/hooks/useOrganizationQueries';
import { OrganizationForm } from '@/features/organization/components/OrganizationForm';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

export const OrganizationProfilePage: React.FC = () => {
  const { user } = useAuth();
  const orgId = user?.organizationId || '';

  const { data: org, isLoading, isError, error, refetch } = useOrganizationDetails(orgId);

  if (isLoading) {
    return <LoadingState message="Loading organization profile..." rows={3} />;
  }

  if (isError || !org) {
    return (
      <ErrorState
        title="Failed to load Organization Profile"
        message={error?.message || 'Could not fetch organization details.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Organization Profile</h1>
        <p className="text-xs text-slate-400">View and update your organization's primary contact and branding profile</p>
      </div>

      <OrganizationForm initialData={org} />
    </div>
  );
};
