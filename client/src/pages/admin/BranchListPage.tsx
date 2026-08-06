import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  useBranches,
  useCreateBranch,
  useUpdateBranch,
  useDeleteBranch,
} from '@/features/branch/hooks/useBranchQueries';
import { Branch } from '@/features/branch/types';
import { DataTable, Column } from '@/components/ui/DataTable';
import { SearchBar } from '@/components/ui/SearchBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { BranchModalForm } from '@/features/branch/components/BranchModalForm';
import { BranchFormValues } from '@/features/branch/schemas/branch.schema';
import { GitBranch, Plus, Eye, Edit2, Trash2, MapPin, Phone } from 'lucide-react';

export const BranchListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const orgId = user?.organizationId || undefined;

  const isReadonly = user?.role === 'STAFF';

  const { data: branches = [], isLoading, isError, error, refetch } = useBranches(orgId);
  const createMutation = useCreateBranch();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Edit State
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const updateMutation = useUpdateBranch(editingBranch?.id || '');

  // Delete State
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const deleteMutation = useDeleteBranch();

  // Filter Search
  const filteredBranches = branches.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      b.name.toLowerCase().includes(term) ||
      b.code.toLowerCase().includes(term) ||
      (b.address && b.address.toLowerCase().includes(term)) ||
      (b.phone && b.phone.toLowerCase().includes(term))
    );
  });

  const handleCreateSubmit = (values: BranchFormValues) => {
    if (!orgId) return;
    createMutation.mutate(
      {
        organizationId: orgId,
        name: values.name,
        code: values.code,
        address: values.address || undefined,
        phone: values.phone || undefined,
        timeZone: values.timeZone,
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
        },
      }
    );
  };

  const handleEditSubmit = (values: BranchFormValues) => {
    if (!editingBranch) return;
    updateMutation.mutate(
      {
        name: values.name,
        address: values.address || undefined,
        phone: values.phone || undefined,
        timeZone: values.timeZone,
        isActive: values.isActive,
      },
      {
        onSuccess: () => {
          setEditingBranch(null);
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!deletingBranch) return;
    deleteMutation.mutate(deletingBranch.id, {
      onSuccess: () => {
        setDeletingBranch(null);
      },
    });
  };

  const columns: Column<Branch>[] = [
    {
      key: 'name',
      header: 'Branch Name & Code',
      render: (b) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100">{b.name}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-950 border border-brand-800 text-brand-400">
              {b.code}
            </span>
          </div>
          {b.address && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500 shrink-0" /> {b.address}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Contact Phone',
      render: (b) => (
        <span className="text-slate-300 font-mono text-xs flex items-center gap-1">
          <Phone className="w-3.5 h-3.5 text-slate-500" /> {b.phone || 'N/A'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (b) => <StatusBadge status={b.isActive} />,
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      render: (b) => (
        <span className="text-slate-400 font-mono">
          {new Date(b.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (b) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(`/admin/branches/${b.id}`)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="View Branch Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {!isReadonly && (
            <>
              <button
                type="button"
                onClick={() => setEditingBranch(b)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 transition-colors"
                title="Edit Branch"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setDeletingBranch(b)}
                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 transition-colors"
                title="Delete Branch"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (isError) {
    return (
      <ErrorState
        title="Failed to load Branch List"
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
            <GitBranch className="w-6 h-6 text-brand-400" /> Branch Management
          </h1>
          <p className="text-xs text-slate-400">View and manage hospital & outpatient branch locations</p>
        </div>

        {!isReadonly && (
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-lg shadow-brand-600/30"
          >
            <Plus className="w-4 h-4" /> Add New Branch
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by branch name, code, address, or phone..."
        />
        <span className="text-xs text-slate-500 font-medium">
          Total: <span className="text-slate-300 font-bold">{filteredBranches.length}</span> branches
        </span>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredBranches}
        isLoading={isLoading}
        emptyTitle="No branches found"
        emptyDescription="Get started by adding your organization's first branch location."
        keyExtractor={(b) => b.id}
      />

      {/* Create Modal */}
      <BranchModalForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createMutation.isPending}
        error={createMutation.isError ? createMutation.error.message : null}
      />

      {/* Edit Modal */}
      <BranchModalForm
        isOpen={!!editingBranch}
        onClose={() => setEditingBranch(null)}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
        error={updateMutation.isError ? updateMutation.error.message : null}
        initialBranch={editingBranch}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingBranch}
        onClose={() => setDeletingBranch(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Branch Location?"
        description={`Are you sure you want to delete '${deletingBranch?.name}' (${deletingBranch?.code})? This will soft delete the branch record.`}
        confirmText="Delete Branch"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
