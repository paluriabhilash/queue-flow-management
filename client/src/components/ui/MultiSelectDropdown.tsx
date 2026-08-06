import React from 'react';
import { Check, Layers } from 'lucide-react';

export interface Option {
  value: string;
  label: string;
  sublabel?: string;
}

export interface MultiSelectDropdownProps {
  options: Option[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = 'Select services...',
}) => {
  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{placeholder}</span>
        <span className="font-semibold text-brand-400">{selectedValues.length} selected</span>
      </div>

      <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
        {options.length === 0 ? (
          <div className="p-3 text-center text-xs text-slate-500">No available options to select.</div>
        ) : (
          options.map((opt) => {
            const isSelected = selectedValues.includes(opt.value);
            return (
              <div
                key={opt.value}
                onClick={() => toggleOption(opt.value)}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-brand-950/60 border-brand-800 text-brand-300 font-semibold'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <div>
                    <span>{opt.label}</span>
                    {opt.sublabel && <span className="block text-[10px] text-slate-500 font-normal">{opt.sublabel}</span>}
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    isSelected ? 'bg-brand-600 border-brand-500 text-white' : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
