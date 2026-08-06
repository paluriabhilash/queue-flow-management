import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenerateToken } from '@/features/queue/hooks/useQueueQueries';
import { PriorityLevel } from '@/features/service/types';
import { BranchSelector } from '@/components/ui/BranchSelector';
import { ServiceSelector } from '@/components/ui/ServiceSelector';
import { PrioritySelector } from '@/components/ui/PrioritySelector';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { TicketTokenItem } from '@/features/queue/types';
import {
  ArrowLeft,
  Ticket,
  GitBranch,
  Layers,
  Shield,
  CheckCircle2,
  Clock,
  Users,
  Eye,
} from 'lucide-react';

export const GenerateTokenPage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>('NORMAL');

  // Generated Result State
  const [generatedResult, setGeneratedResult] = useState<{
    token: TicketTokenItem;
    queuePosition: number;
    estimatedWaitTime: number;
  } | null>(null);

  const generateMutation = useGenerateToken();

  const handleGenerate = () => {
    if (!selectedBranchId || !selectedServiceId) return;

    generateMutation.mutate(
      {
        branchId: selectedBranchId,
        serviceId: selectedServiceId,
        priority: selectedPriority,
      },
      {
        onSuccess: (data) => {
          setGeneratedResult(data);
        },
      }
    );
  };

  // If token generated successfully, show Result View
  if (generatedResult) {
    const { token, queuePosition, estimatedWaitTime } = generatedResult;
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-brand-500/40 shadow-2xl backdrop-blur-md text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest font-bold text-brand-400">Ticket Token Issued</span>
            <h1 className="text-5xl font-black font-mono text-white tracking-tight">{token.tokenNumber}</h1>
            <p className="text-xs text-slate-400 pt-1">{token.service?.name || 'Queue Service'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 block">Queue Position</span>
              <strong className="text-2xl font-black font-mono text-white flex items-center justify-center gap-1">
                <Users className="w-4 h-4 text-brand-400" /> #{queuePosition}
              </strong>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 block">Est. Waiting Time</span>
              <strong className="text-2xl font-black font-mono text-amber-300 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-amber-400" /> ~{estimatedWaitTime}m
              </strong>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate(`/customer/token/${token.id}`)}
              className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30"
            >
              <Eye className="w-4 h-4" /> Track Live Queue Status
            </button>

            <button
              type="button"
              onClick={() => navigate('/customer/dashboard')}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <button
        type="button"
        onClick={() => navigate('/customer/dashboard')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl backdrop-blur-md space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Ticket className="w-5 h-5 text-brand-400" /> Book Queue Ticket Token
          </h1>
          <p className="text-xs text-slate-400">Select branch location, service requirement, and priority level</p>
        </div>

        {/* Step 1: Branch Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-brand-400" /> Step 1: Select Branch Location
          </label>
          <BranchSelector
            value={selectedBranchId}
            onChange={(bId) => {
              setSelectedBranchId(bId);
              setSelectedServiceId('');
            }}
          />
        </div>

        {/* Step 2: Service Selection */}
        {selectedBranchId && (
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-400" /> Step 2: Select Queue Service
            </label>
            <ServiceSelector
              branchId={selectedBranchId}
              selectedServiceId={selectedServiceId}
              onSelectService={setSelectedServiceId}
            />
          </div>
        )}

        {/* Step 3: Priority Selection */}
        {selectedBranchId && selectedServiceId && (
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-400" /> Step 3: Select Priority Category
            </label>
            <PrioritySelector
              selectedPriority={selectedPriority}
              onSelectPriority={setSelectedPriority}
            />
          </div>
        )}

        {/* Step 4: Generate Action */}
        {selectedBranchId && selectedServiceId && (
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <SubmitButton
              onClick={handleGenerate}
              isLoading={generateMutation.isPending}
              icon={<Ticket className="w-4 h-4" />}
              className="w-full sm:w-auto px-8"
            >
              Generate Ticket Token
            </SubmitButton>
          </div>
        )}
      </div>
    </div>
  );
};
