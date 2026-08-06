import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  useCounterDetails,
  useAssignStaff,
  useRemoveStaff,
  useAssignServices,
  useRemoveService,
} from '@/features/counter/hooks/useCounterQueries';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CounterStatusBadge } from '@/components/ui/CounterStatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { StaffAssignmentModal } from '@/features/counter/components/StaffAssignmentModal';
import { ServiceAssignmentModal } from '@/features/counter/components/ServiceAssignmentModal';
import {
  ArrowLeft,
  Monitor,
  GitBranch,
  UserCheck,
  UserX,
  Layers,
  Plus,
  Trash2,
  Clock,
  Shield,
} from 'lucide-react';

export const CounterDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isReadonly = user?.role === 'STAFF';

  const { data: counter, isLoading, isError, error, refetch } = useCounterDetails(id);

  // Staff Assignment State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isRemoveStaffDialogOpen, setIsRemoveStaffDialogOpen] = useState(false);

  const assignStaffMutation = useAssignStaff(id || '');
  const removeStaffMutation = useRemoveStaff(id || '');

  // Service Assignment State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [removingServiceId, setRemovingServiceId] = useState<string | null>(null);

  const assignServicesMutation = useAssignServices(id || '');
  const removeServiceMutation = useRemoveService(id || '');

  // Handlers
  const handleAssignStaff = (staffProfileId: string) => {
    assignStaffMutation.mutate(
      { staffProfileId },
      {
        onSuccess: () => setIsStaffModalOpen(false),
      }
    );
  };

  const handleRemoveStaffConfirm = () => {
    if (!counter?.staffProfile) return;
    removeStaffMutation.mutate(counter.staffProfile.id, {
      onSuccess: () => setIsRemoveStaffDialogOpen(false),
    });
  };

  const handleAssignServices = (serviceIds: string[]) => {
    assignServicesMutation.mutate(
      { serviceIds },
      {
        onSuccess: () => setIsServiceModalOpen(false),
      }
    );
  };

  const handleRemoveServiceConfirm = () => {
    if (!removingServiceId) return;
    removeServiceMutation.mutate(removingServiceId, {
      onSuccess: () => setRemovingServiceId(null),
    });
  };

  if (isLoading) {
    return <LoadingState message="Loading counter desk profile..." rows={4} />;
  }

  if (isError || !counter) {
    return (
      <ErrorState
        title="Failed to load Counter Details"
        message={error?.message || 'Counter desk profile not found.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar */}
      <button
        type="button"
        onClick={() => navigate('/admin/counters')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Counter List
      </button>

      {/* Main Counter Header Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Monitor className="w-6 h-6 text-brand-400" />
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{counter.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-950 border border-brand-800 text-brand-400">
                #{counter.number}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Branch: <strong className="text-slate-200">{counter.branch?.name || 'Central General Hospital'}</strong>
            </p>
          </div>

          <CounterStatusBadge status={counter.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <GitBranch className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[11px]">Branch Location</span>
              <strong className="text-slate-100 font-semibold">{counter.branch?.name || 'Central Branch'}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[11px]">Assigned Staff</span>
              <strong className="text-slate-100 font-semibold">
                {counter.staffProfile ? counter.staffProfile.user.fullName : 'Unassigned'}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[11px]">Total Served Tickets</span>
              <strong className="text-slate-100 font-mono text-sm">{counter._count?.tickets ?? 0} Tickets</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Staff Assignment & Mapped Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Staff Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" /> Assigned Staff Operator
              </h3>
              <p className="text-xs text-slate-400">Staff user authorized to serve tokens at this counter</p>
            </div>

            {!isReadonly && (
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(true)}
                className="p-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 font-semibold text-xs hover:bg-emerald-900/60 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Assign Staff
              </button>
            )}
          </div>

          {counter.staffProfile ? (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-bold text-slate-100 text-sm">{counter.staffProfile.user.fullName}</span>
                <span className="block text-xs text-slate-400 font-mono">{counter.staffProfile.user.email}</span>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60 mt-1">
                  Active Operator
                </span>
              </div>

              {!isReadonly && (
                <button
                  type="button"
                  onClick={() => setIsRemoveStaffDialogOpen(true)}
                  className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 border border-rose-800/60 transition-colors flex items-center gap-1 text-xs font-semibold"
                  title="Remove Staff"
                >
                  <UserX className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No staff member currently assigned to operator duty.
            </div>
          )}
        </div>

        {/* Mapped Supported Services Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-400" /> Supported Queue Services
              </h3>
              <p className="text-xs text-slate-400">Services this counter is authorized to process</p>
            </div>

            {!isReadonly && (
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(true)}
                className="p-2 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 border border-brand-500/30 font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Map Services
              </button>
            )}
          </div>

          {!counter.counterServices || counter.counterServices.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No supported queue services mapped to this counter yet.
            </div>
          ) : (
            <div className="space-y-2">
              {counter.counterServices.map((cs) => (
                <div
                  key={cs.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100">{cs.service.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-950 border border-brand-800 text-brand-400">
                        {cs.service.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-amber-400" /> {cs.service.avgServiceTimeMins} mins
                      </span>
                      <PriorityBadge priority={cs.service.priority} />
                    </div>
                  </div>

                  {!isReadonly && (
                    <button
                      type="button"
                      onClick={() => setRemovingServiceId(cs.serviceId)}
                      className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 transition-colors"
                      title="Remove Service Mapping"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Staff Modals */}
      <StaffAssignmentModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onAssign={handleAssignStaff}
        isLoading={assignStaffMutation.isPending}
        error={assignStaffMutation.isError ? assignStaffMutation.error.message : null}
        currentStaffName={counter.staffProfile?.user.fullName}
      />

      <ConfirmDialog
        isOpen={isRemoveStaffDialogOpen}
        onClose={() => setIsRemoveStaffDialogOpen(false)}
        onConfirm={handleRemoveStaffConfirm}
        title="Remove Assigned Staff Member?"
        description={`Remove ${counter.staffProfile?.user.fullName} from Counter #${counter.number}?`}
        confirmText="Remove Staff"
        isLoading={removeStaffMutation.isPending}
      />

      {/* Service Modals */}
      <ServiceAssignmentModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onAssign={handleAssignServices}
        isLoading={assignServicesMutation.isPending}
        error={assignServicesMutation.isError ? assignServicesMutation.error.message : null}
        branchId={counter.branchId}
        currentCounterServices={counter.counterServices}
      />

      <ConfirmDialog
        isOpen={!!removingServiceId}
        onClose={() => setRemovingServiceId(null)}
        onConfirm={handleRemoveServiceConfirm}
        title="Remove Service Mapping?"
        description="Remove this supported service from the counter?"
        confirmText="Remove Service"
        isLoading={removeServiceMutation.isPending}
      />
    </div>
  );
};
