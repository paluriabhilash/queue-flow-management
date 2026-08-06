import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { AlertCircle } from 'lucide-react';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, icon, helperText, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5 w-full">
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label}
        </label>

        <div className="relative rounded-xl shadow-sm">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={clsx(
              'w-full rounded-xl bg-slate-900/90 border text-slate-100 text-sm px-4 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 placeholder:text-slate-500',
              icon ? 'pl-10' : 'pl-4',
              error
                ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-950/10'
                : 'border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:ring-brand-500/20',
              className
            )}
            {...props}
          />
        </div>

        {error ? (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium pt-0.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
