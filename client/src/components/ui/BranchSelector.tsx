import React from 'react';
import { GitBranch } from 'lucide-react';
import { useBranches } from '@/features/branch/hooks/useBranchQueries';
import { useAuth } from '@/context/AuthContext';

export interface BranchSelectorProps {
  value?: string;
  onChange: (branchId: string) => void;
  allowAll?: boolean;
  allLabel?: string;
  className?: string;
  disabled?: boolean;
}

export const BranchSelector: React.FC<BranchSelectorProps> = ({
  value,
  onChange,
  allowAll = false,
  allLabel = 'All Branches',
  className = '',
  disabled = false,
}) => {
  const { user } = useAuth();
  const orgId = user?.organizationId || undefined;

  const { data: branches = [], isLoading } = useBranches(orgId);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
          <GitBranch className="w-4 h-4" />
        </div>

        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isLoading}
          className="w-full pl-9 pr-8 py-2.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl text-slate-100 text-xs focus:outline-none transition-all disabled:opacity-60 cursor-pointer"
        >
          {!allowAll && (
            <option value="" disabled>
              {isLoading ? 'Loading available branch locations...' : branches.length === 0 ? 'No active branches found' : '-- Select Branch Location --'}
            </option>
          )}
          {allowAll && <option value="">{allLabel}</option>}
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.code})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
