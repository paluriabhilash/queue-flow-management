import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  useCounters,
  useCreateCounter,
  useUpdateCounter,
  useDeleteCounter,
} from '@/features/counter/hooks/useCounterQueries';
import { CounterItem } from '@/features/counter/types';
import { CounterTable } from '@/features/counter/components/CounterTable';
import { CounterModalForm } from '@/features/counter/components/CounterModalForm';
import { CounterFormValues } from '@/features/counter/schemas/counter.schema';
import { SearchBar } from '@/components/ui/SearchBar';
import { BranchSelector } from '@/components/ui/BranchSelector';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { Monitor, Plus } from 'lucide-react';

export const CounterListPage: React.FC = () => {
  const { user } = useAuth();
  const isReadonly = user?.role === 'STAFF';

  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { data: counters = [], isLoading, isError, error, refetch } = useCounters(
    selectedBranchId || undefined
  );

  const createMutation = useCreateCounter();

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Edit State
  const [editingCounter, setEditingCounter] = useState<CounterItem | null>(null);
  const updateMutation = useUpdateCounter(editingCounter?.id || '');

  // Delete State
  const [deletingCounter, setDeletingCounter] = useState<CounterItem | null>(null);
  const deleteMutation = useDeleteCounter();

  // Filter Search
  const filteredCounters = counters.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.number.toString().includes(term) ||
      (c.staffProfile && c.staffProfile.user.fullName.toLowerCase().includes(term))
    );
  });

  const handleCreateSubmit = (values: CounterFormValues) => {
    createMutation.mutate(
      {
        branchId: values.branchId,
        name: values.name,
        number: values.number,
        status: values.status,
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
        },
      }
    );
  };

  const handleEditSubmit = (values: CounterFormValues) => {
    if (!editingCounter) return;
    updateMutation.mutate(
      {
        name: values.name,
        status: values.status,
        isActive: values.isActive,
      },
      {
        onSuccess: () => {
          setEditingCounter(null);
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!deletingCounter) return;
    deleteMutation.mutate(deletingCounter.id, {
      onSuccess: () => {
        setDeletingCounter(null);
      },
    });
  };

  if (isError) {
    return (
      <ErrorState
        title="Failed to load Counters"
        message={error?.message || 'Error communicating with server.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Monitor className="w-6 h-6 text-brand-400" /> Counter Management
          </h1>
          <p className="text-xs text-slate-400">Configure branch service desks, assign staff operators, and map queue services</p>
        </div>

        {!isReadonly && (
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-lg shadow-brand-600/30"
          >
            <Plus className="w-4 h-4" /> Add New Counter
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by counter name, number, or assigned staff..."
          />
          <BranchSelector
            value={selectedBranchId}
            onChange={setSelectedBranchId}
            allowAll
            allLabel="All Branch Locations"
            className="w-full sm:w-56"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium shrink-0">
          Total: <span className="text-slate-300 font-bold">{filteredCounters.length}</span> counters
        </span>
      </div>

      {/* Counter Table */}
      <CounterTable
        counters={filteredCounters}
        isLoading={isLoading}
        isReadonly={isReadonly}
        onEdit={(c) => setEditingCounter(c)}
        onDelete={(c) => setDeletingCounter(c)}
      />

      {/* Create Modal */}
      <CounterModalForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createMutation.isPending}
        error={createMutation.isError ? createMutation.error.message : null}
        defaultBranchId={selectedBranchId}
      />

      {/* Edit Modal */}
      <CounterModalForm
        isOpen={!!editingCounter}
        onClose={() => setEditingCounter(null)}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
        error={updateMutation.isError ? updateMutation.error.message : null}
        initialCounter={editingCounter}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingCounter}
        onClose={() => setDeletingCounter(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Counter Desk?"
        description={`Are you sure you want to delete '${deletingCounter?.name}' (Counter #${deletingCounter?.number})?`}
        confirmText="Delete Counter"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
