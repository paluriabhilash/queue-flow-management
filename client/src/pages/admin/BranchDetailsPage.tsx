import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  useBranchDetails,
  useWorkingHours,
  useCreateWorkingHour,
  useUpdateWorkingHour,
  useDeleteWorkingHour,
  useHolidays,
  useCreateHoliday,
  useUpdateHoliday,
  useDeleteHoliday,
} from '@/features/branch/hooks/useBranchQueries';
import { WorkingHour, Holiday } from '@/features/branch/types';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { WorkingHoursModalForm } from '@/features/branch/components/WorkingHoursModalForm';
import { HolidayModalForm } from '@/features/branch/components/HolidayModalForm';
import { WorkingHourFormValues, HolidayFormValues } from '@/features/branch/schemas/branch.schema';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Clock,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Coffee,
  Globe,
} from 'lucide-react';

export const BranchDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isReadonly = user?.role === 'STAFF';

  const { data: branch, isLoading: isBranchLoading, isError, error, refetch } = useBranchDetails(id);
  const { data: workingHours = [] } = useWorkingHours(id || '');
  const { data: holidays = [] } = useHolidays(id || '');

  // Working Hour Mutations & Modals
  const [isWhModalOpen, setIsWhModalOpen] = useState(false);
  const [editingWh, setEditingWh] = useState<WorkingHour | null>(null);
  const [deletingWh, setDeletingWh] = useState<WorkingHour | null>(null);

  const createWhMutation = useCreateWorkingHour(id || '');
  const updateWhMutation = useUpdateWorkingHour(id || '');
  const deleteWhMutation = useDeleteWorkingHour(id || '');

  // Holiday Mutations & Modals
  const [isHolModalOpen, setIsHolModalOpen] = useState(false);
  const [editingHol, setEditingHol] = useState<Holiday | null>(null);
  const [deletingHol, setDeletingHol] = useState<Holiday | null>(null);

  const createHolMutation = useCreateHoliday(id || '');
  const updateHolMutation = useUpdateHoliday(id || '');
  const deleteHolMutation = useDeleteHoliday(id || '');

  // Handlers for Working Hours
  const handleWhSubmit = (values: WorkingHourFormValues) => {
    if (!id) return;
    if (editingWh) {
      updateWhMutation.mutate(
        {
          id: editingWh.id,
          data: {
            openTime: values.openTime,
            closeTime: values.closeTime,
            lunchStartTime: values.lunchStartTime || undefined,
            lunchEndTime: values.lunchEndTime || undefined,
            isClosed: values.isClosed,
          },
        },
        {
          onSuccess: () => setEditingWh(null),
        }
      );
    } else {
      createWhMutation.mutate(
        {
          dayOfWeek: values.dayOfWeek,
          openTime: values.openTime,
          closeTime: values.closeTime,
          lunchStartTime: values.lunchStartTime || undefined,
          lunchEndTime: values.lunchEndTime || undefined,
          isClosed: values.isClosed,
        },
        {
          onSuccess: () => setIsWhModalOpen(false),
        }
      );
    }
  };

  const handleWhDeleteConfirm = () => {
    if (!deletingWh) return;
    deleteWhMutation.mutate(deletingWh.id, {
      onSuccess: () => setDeletingWh(null),
    });
  };

  // Handlers for Holidays
  const handleHolSubmit = (values: HolidayFormValues) => {
    if (!id) return;
    const isoDateStr = new Date(values.date).toISOString();

    if (editingHol) {
      updateHolMutation.mutate(
        {
          id: editingHol.id,
          data: {
            name: values.name,
            date: isoDateStr,
            description: values.description || undefined,
          },
        },
        {
          onSuccess: () => setEditingHol(null),
        }
      );
    } else {
      createHolMutation.mutate(
        {
          name: values.name,
          date: isoDateStr,
          description: values.description || undefined,
        },
        {
          onSuccess: () => setIsHolModalOpen(false),
        }
      );
    }
  };

  const handleHolDeleteConfirm = () => {
    if (!deletingHol) return;
    deleteHolMutation.mutate(deletingHol.id, {
      onSuccess: () => setDeletingHol(null),
    });
  };

  if (isBranchLoading) {
    return <LoadingState message="Loading branch profile details..." rows={4} />;
  }

  if (isError || !branch) {
    return (
      <ErrorState
        title="Failed to load Branch Details"
        message={error?.message || 'Branch location not found.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <button
        type="button"
        onClick={() => navigate('/admin/branches')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Branch List
      </button>

      {/* Branch Header Profile Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-brand-400" />
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{branch.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-950 border border-brand-800 text-brand-400">
                {branch.code}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Belongs to {branch.organization?.name || 'Organization'}
            </p>
          </div>

          <StatusBadge status={branch.isActive} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{branch.address || 'No address specified'}</span>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="font-mono">{branch.phone || 'No phone specified'}</span>
          </div>

          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Timezone: <strong className="text-slate-200">{branch.timeZone}</strong></span>
          </div>
        </div>
      </div>

      {/* Tabs / Sub-sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Working Hours Section */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-400" /> Working Hours Schedule
              </h3>
              <p className="text-xs text-slate-400">Operating hours and lunch breaks (Monday – Sunday)</p>
            </div>

            {!isReadonly && (
              <button
                type="button"
                onClick={() => setIsWhModalOpen(true)}
                className="p-2 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 border border-brand-500/30 font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Hours
              </button>
            )}
          </div>

          {workingHours.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No operating hours defined for this branch yet.
            </div>
          ) : (
            <div className="space-y-2">
              {workingHours.map((wh) => (
                <div
                  key={wh.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-slate-200 tracking-wider font-mono">{wh.dayOfWeek}</span>
                    {wh.isClosed ? (
                      <span className="block font-semibold text-rose-400">CLOSED</span>
                    ) : (
                      <div className="text-slate-400 space-y-0.5 font-mono">
                        <div>
                          Open: <strong className="text-slate-200">{wh.openTime}</strong> –{' '}
                          <strong className="text-slate-200">{wh.closeTime}</strong>
                        </div>
                        {wh.lunchStartTime && wh.lunchEndTime && (
                          <div className="text-[11px] text-amber-400 flex items-center gap-1">
                            <Coffee className="w-3 h-3" /> Lunch: {wh.lunchStartTime} – {wh.lunchEndTime}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {!isReadonly && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingWh(wh)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingWh(wh)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Holidays Section */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" /> Branch Holidays
              </h3>
              <p className="text-xs text-slate-400">Scheduled facility closure events and national holidays</p>
            </div>

            {!isReadonly && (
              <button
                type="button"
                onClick={() => setIsHolModalOpen(true)}
                className="p-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 font-semibold text-xs hover:bg-emerald-900/60 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Holiday
              </button>
            )}
          </div>

          {holidays.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No holiday closures scheduled for this branch.
            </div>
          ) : (
            <div className="space-y-2">
              {holidays.map((hol) => (
                <div
                  key={hol.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{hol.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-emerald-400 border border-slate-800">
                        {new Date(hol.date).toLocaleDateString()}
                      </span>
                    </div>
                    {hol.description && <p className="text-[11px] text-slate-400">{hol.description}</p>}
                  </div>

                  {!isReadonly && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingHol(hol)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingHol(hol)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Working Hours Modals */}
      <WorkingHoursModalForm
        isOpen={isWhModalOpen || !!editingWh}
        onClose={() => {
          setIsWhModalOpen(false);
          setEditingWh(null);
        }}
        onSubmit={handleWhSubmit}
        isLoading={createWhMutation.isPending || updateWhMutation.isPending}
        error={
          createWhMutation.isError
            ? createWhMutation.error.message
            : updateWhMutation.isError
            ? updateWhMutation.error.message
            : null
        }
        initialData={editingWh}
      />

      <ConfirmDialog
        isOpen={!!deletingWh}
        onClose={() => setDeletingWh(null)}
        onConfirm={handleWhDeleteConfirm}
        title="Delete Working Hour Record?"
        description={`Remove operating hour schedule for ${deletingWh?.dayOfWeek}?`}
        isLoading={deleteWhMutation.isPending}
      />

      {/* Holiday Modals */}
      <HolidayModalForm
        isOpen={isHolModalOpen || !!editingHol}
        onClose={() => {
          setIsHolModalOpen(false);
          setEditingHol(null);
        }}
        onSubmit={handleHolSubmit}
        isLoading={createHolMutation.isPending || updateHolMutation.isPending}
        error={
          createHolMutation.isError
            ? createHolMutation.error.message
            : updateHolMutation.isError
            ? updateHolMutation.error.message
            : null
        }
        initialData={editingHol}
      />

      <ConfirmDialog
        isOpen={!!deletingHol}
        onClose={() => setDeletingHol(null)}
        onConfirm={handleHolDeleteConfirm}
        title="Delete Holiday Entry?"
        description={`Remove holiday entry '${deletingHol?.name}'?`}
        isLoading={deleteHolMutation.isPending}
      />
    </div>
  );
};
