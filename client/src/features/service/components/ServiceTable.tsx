import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { ServiceItem } from '../types';
import { Eye, Edit2, Trash2, Clock, GitBranch } from 'lucide-react';

export interface ServiceTableProps {
  services: ServiceItem[];
  isLoading?: boolean;
  isReadonly?: boolean;
  onEdit: (service: ServiceItem) => void;
  onDelete: (service: ServiceItem) => void;
}

export const ServiceTable: React.FC<ServiceTableProps> = ({
  services,
  isLoading = false,
  isReadonly = false,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  const columns: Column<ServiceItem>[] = [
    {
      key: 'name',
      header: 'Service Name & Code',
      render: (s) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100">{s.name}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-950 border border-brand-800 text-brand-400">
              {s.code}
            </span>
          </div>
          {s.description && <p className="text-[11px] text-slate-400 line-clamp-1">{s.description}</p>}
        </div>
      ),
    },
    {
      key: 'branch',
      header: 'Branch Location',
      render: (s) => (
        <span className="text-slate-300 text-xs flex items-center gap-1">
          <GitBranch className="w-3.5 h-3.5 text-slate-500" />
          {s.department?.branch?.name || 'Central Branch'}
        </span>
      ),
    },
    {
      key: 'duration',
      header: 'Avg Duration',
      render: (s) => (
        <span className="text-slate-200 font-mono text-xs flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          {s.avgServiceTimeMins} mins
        </span>
      ),
    },
    {
      key: 'priority',
      header: 'Priority Level',
      render: (s) => <PriorityBadge priority={s.priority} />,
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (s) => <StatusBadge status={s.isActive} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (s) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(`/admin/services/${s.id}`)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {!isReadonly && (
            <>
              <button
                type="button"
                onClick={() => onEdit(s)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 transition-colors"
                title="Edit Service"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onDelete(s)}
                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 transition-colors"
                title="Delete Service"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={services}
      isLoading={isLoading}
      emptyTitle="No queue services found"
      emptyDescription="Create queue services (e.g. Registration, Consultation, Pharmacy) for your branch."
      keyExtractor={(s) => s.id}
    />
  );
};
