import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from '@/features/service/hooks/useServiceQueries';
import { ServiceItem } from '@/features/service/types';
import { ServiceTable } from '@/features/service/components/ServiceTable';
import { ServiceModalForm } from '@/features/service/components/ServiceModalForm';
import { ServiceFormValues } from '@/features/service/schemas/service.schema';
import { SearchBar } from '@/components/ui/SearchBar';
import { BranchSelector } from '@/components/ui/BranchSelector';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { Layers, Plus } from 'lucide-react';

export const ServiceListPage: React.FC = () => {
  const { user } = useAuth();
  const isReadonly = user?.role === 'STAFF';

  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { data: services = [], isLoading, isError, error, refetch } = useServices(
    selectedBranchId || undefined
  );

  const createMutation = useCreateService();

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Edit State
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const updateMutation = useUpdateService(editingService?.id || '');

  // Delete State
  const [deletingService, setDeletingService] = useState<ServiceItem | null>(null);
  const deleteMutation = useDeleteService();

  // Filter Search
  const filteredServices = services.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.code.toLowerCase().includes(term) ||
      (s.description && s.description.toLowerCase().includes(term))
    );
  });

  const handleCreateSubmit = (values: ServiceFormValues) => {
    createMutation.mutate(
      {
        branchId: values.branchId,
        name: values.name,
        code: values.code,
        description: values.description || undefined,
        avgServiceTime: values.avgServiceTime,
        priority: values.priority,
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
        },
      }
    );
  };

  const handleEditSubmit = (values: ServiceFormValues) => {
    if (!editingService) return;
    updateMutation.mutate(
      {
        name: values.name,
        description: values.description || undefined,
        avgServiceTime: values.avgServiceTime,
        priority: values.priority,
        isActive: values.isActive,
      },
      {
        onSuccess: () => {
          setEditingService(null);
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!deletingService) return;
    deleteMutation.mutate(deletingService.id, {
      onSuccess: () => {
        setDeletingService(null);
      },
    });
  };

  if (isError) {
    return (
      <ErrorState
        title="Failed to load Queue Services"
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
            <Layers className="w-6 h-6 text-brand-400" /> Service Management
          </h1>
          <p className="text-xs text-slate-400">Configure queue services, average durations, and priority levels</p>
        </div>

        {!isReadonly && (
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-lg shadow-brand-600/30"
          >
            <Plus className="w-4 h-4" /> Add New Service
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by service name, code, or description..."
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
          Total: <span className="text-slate-300 font-bold">{filteredServices.length}</span> services
        </span>
      </div>

      {/* Service Table */}
      <ServiceTable
        services={filteredServices}
        isLoading={isLoading}
        isReadonly={isReadonly}
        onEdit={(s) => setEditingService(s)}
        onDelete={(s) => setDeletingService(s)}
      />

      {/* Create Modal */}
      <ServiceModalForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createMutation.isPending}
        error={createMutation.isError ? createMutation.error.message : null}
        defaultBranchId={selectedBranchId}
      />

      {/* Edit Modal */}
      <ServiceModalForm
        isOpen={!!editingService}
        onClose={() => setEditingService(null)}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
        error={updateMutation.isError ? updateMutation.error.message : null}
        initialService={editingService}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingService}
        onClose={() => setDeletingService(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Queue Service?"
        description={`Are you sure you want to delete '${deletingService?.name}' (${deletingService?.code})? This will soft delete the service.`}
        confirmText="Delete Service"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
