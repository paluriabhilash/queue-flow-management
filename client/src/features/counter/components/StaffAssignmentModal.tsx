import React, { useState } from 'react';
import { UserCheck, User, Save, AlertCircle } from 'lucide-react';
import { FormModal } from '@/components/ui/FormModal';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { useStaffProfiles } from '../hooks/useCounterQueries';

export interface StaffAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (staffProfileId: string) => void;
  isLoading: boolean;
  error?: string | null;
  currentStaffName?: string | null;
}

export const StaffAssignmentModal: React.FC<StaffAssignmentModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  isLoading,
  error,
  currentStaffName,
}) => {
  const { data: staffProfiles = [], isLoading: isStaffLoading } = useStaffProfiles();
  const [selectedStaffProfileId, setSelectedStaffProfileId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffProfileId) return;
    onAssign(selectedStaffProfileId);
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Staff User to Counter"
      subtitle="Select an active staff member to operate this counter desk"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {currentStaffName && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-500 block">Currently Assigned Staff</span>
            <span className="font-bold text-brand-400 flex items-center gap-1.5 mt-0.5">
              <UserCheck className="w-3.5 h-3.5" /> {currentStaffName}
            </span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Select Staff Member
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <User className="w-4 h-4" />
            </div>

            <select
              value={selectedStaffProfileId}
              onChange={(e) => setSelectedStaffProfileId(e.target.value)}
              disabled={isStaffLoading}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-xs rounded-xl focus:outline-none focus:border-brand-500 disabled:opacity-60"
            >
              <option value="">-- Choose a staff member --</option>
              {staffProfiles.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.user.fullName} ({sp.user.email}) {sp.counterId ? '[Assigned elsewhere]' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            Cancel
          </button>

          <SubmitButton
            type="submit"
            isLoading={isLoading}
            disabled={!selectedStaffProfileId}
            icon={<Save className="w-4 h-4" />}
            className="w-auto px-6"
          >
            Assign Staff
          </SubmitButton>
        </div>
      </form>
    </FormModal>
  );
};
