import React, { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { FormModal } from '@/components/ui/FormModal';
import { MultiSelectDropdown, Option } from '@/components/ui/MultiSelectDropdown';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { useServices } from '@/features/service/hooks/useServiceQueries';
import { CounterServiceItem } from '../types';

export interface ServiceAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (serviceIds: string[]) => void;
  isLoading: boolean;
  error?: string | null;
  branchId: string;
  currentCounterServices?: CounterServiceItem[];
}

export const ServiceAssignmentModal: React.FC<ServiceAssignmentModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  isLoading,
  error,
  branchId,
  currentCounterServices = [],
}) => {
  const { data: availableServices = [], isLoading: isServicesLoading } = useServices(branchId);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  useEffect(() => {
    if (currentCounterServices.length > 0) {
      setSelectedServiceIds(currentCounterServices.map((cs) => cs.serviceId));
    } else {
      setSelectedServiceIds([]);
    }
  }, [currentCounterServices, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssign(selectedServiceIds);
  };

  const options: Option[] = availableServices.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.code})`,
    sublabel: `${s.avgServiceTimeMins} mins duration`,
  }));

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Map Supported Queue Services"
      subtitle="Select which queue services this counter desk is authorized to handle"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <MultiSelectDropdown
          options={options}
          selectedValues={selectedServiceIds}
          onChange={setSelectedServiceIds}
          placeholder="Select supported services for this branch counter..."
        />

        <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading || isServicesLoading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            Cancel
          </button>

          <SubmitButton
            type="submit"
            isLoading={isLoading}
            disabled={selectedServiceIds.length === 0}
            icon={<Save className="w-4 h-4" />}
            className="w-auto px-6"
          >
            Save Service Mapping
          </SubmitButton>
        </div>
      </form>
    </FormModal>
  );
};
