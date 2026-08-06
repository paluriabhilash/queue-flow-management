import React from 'react';
import { Clock } from 'lucide-react';

export interface DurationInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  value?: number | string;
  onChange?: (value: number) => void;
}

export const DurationInput = React.forwardRef<HTMLInputElement, DurationInputProps>(
  ({ label = 'Average Service Duration (Minutes)', error, helperText, value, onChange, className = '', ...props }, ref) => {
    const handleQuickAdd = (mins: number) => {
      if (onChange) {
        onChange(mins);
      }
    };

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            {label}
          </label>
        )}

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Clock className="w-4 h-4" />
          </div>

          <input
            ref={ref}
            type="number"
            min={1}
            value={value}
            onChange={(e) => onChange && onChange(parseInt(e.target.value, 10) || 1)}
            className={`w-full pl-10 pr-16 py-2.5 bg-slate-900/90 border rounded-xl text-slate-100 text-sm focus:outline-none transition-all ${
              error
                ? 'border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
            } ${className}`}
            {...props}
          />

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-slate-400 pointer-events-none">
            mins
          </div>
        </div>

        {/* Quick select presets */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[10px] text-slate-500 font-medium">Quick presets:</span>
          {[5, 10, 15, 20, 30].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleQuickAdd(m)}
              className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
            >
              {m}m
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
        {helperText && !error && <p className="text-[11px] text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

DurationInput.displayName = 'DurationInput';
