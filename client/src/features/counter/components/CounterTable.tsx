import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '@/components/ui/DataTable';
import { CounterStatusBadge } from '@/components/ui/CounterStatusBadge';
import { CounterItem } from '../types';
import { Eye, Edit2, Trash2, GitBranch, UserCheck, Layers } from 'lucide-react';

export interface CounterTableProps {
  counters: CounterItem[];
  isLoading?: boolean;
  isReadonly?: boolean;
  onEdit: (counter: CounterItem) => void;
  onDelete: (counter: CounterItem) => void;
}

export const CounterTable: React.FC<CounterTableProps> = ({
  counters,
  isLoading = false,
  isReadonly = false,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  const columns: Column<CounterItem>[] = [
    {
      key: 'name',
      header: 'Counter Name & Number',
      render: (c) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100">{c.name}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-950 border border-brand-800 text-brand-400">
              #{c.number}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'branch',
      header: 'Branch Location',
      render: (c) => (
        <span className="text-slate-300 text-xs flex items-center gap-1">
          <GitBranch className="w-3.5 h-3.5 text-slate-500" />
          {c.branch?.name || 'Central Branch'}
        </span>
      ),
    },
    {
      key: 'staff',
      header: 'Assigned Staff',
      render: (c) => (
        c.staffProfile ? (
          <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
            {c.staffProfile.user.fullName}
          </span>
        ) : (
          <span className="text-slate-500 text-xs italic">Unassigned</span>
        )
      ),
    },
    {
      key: 'services',
      header: 'Mapped Services',
      render: (c) => (
        <div className="flex flex-wrap gap-1">
          {c.counterServices && c.counterServices.length > 0 ? (
            c.counterServices.map((cs) => (
              <span
                key={cs.id}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 text-indigo-300"
              >
                {cs.service.code}
              </span>
            ))
          ) : (
            <span className="text-slate-500 text-xs italic flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-600" /> No mapping
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Operating Status',
      render: (c) => <CounterStatusBadge status={c.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(`/admin/counters/${c.id}`)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="View Counter Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {!isReadonly && (
            <>
              <button
                type="button"
                onClick={() => onEdit(c)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 transition-colors"
                title="Edit Counter"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onDelete(c)}
                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 transition-colors"
                title="Delete Counter"
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
      data={counters}
      isLoading={isLoading}
      emptyTitle="No service counters found"
      emptyDescription="Register service counters (e.g. Counter 01, Consultation Room A) for your branch."
      keyExtractor={(c) => c.id}
    />
  );
};
