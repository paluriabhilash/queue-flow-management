export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6">
      <div className="max-w-xl text-center space-y-4">
        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-400 bg-brand-950/80 border border-brand-800/60 rounded-full inline-block">
          System Initialized
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-white via-slate-200 to-brand-400 bg-clip-text text-transparent">
          QueueFlow
        </h1>
        <p className="text-slate-400 text-lg">
          Smart Digital Queue Management System for Hospitals, Banks, Service Centers & Education.
        </p>
      </div>
    </div>
  );
}
