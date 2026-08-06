import React from 'react';

export interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ title, subtitle, children, footer }) => {
  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/80 border border-slate-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
      <div className="space-y-1.5 text-center sm:text-left">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>

      <div className="space-y-5">{children}</div>

      {footer && <div className="pt-4 border-t border-slate-800/80 text-center text-xs">{footer}</div>}
    </div>
  );
};
