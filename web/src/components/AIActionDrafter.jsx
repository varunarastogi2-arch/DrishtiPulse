import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Copy, Send, Sparkles } from 'lucide-react';

export default function AIActionDrafter({ isOpen, onClose, targetDepartment = "Ministry of Environment, Forest and Climate Change", caseId = "CASE-00045" }) {
  const [isDrafting, setIsDrafting] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [draftContent, setDraftContent] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDraftContent(
        `Subject: URGENT - Fast-track Clearance Request for Project ${caseId || "CASE-00045"}\n\nTo the Principal Secretary, ${targetDepartment},\n\nOur AI-driven Predictive Engine has identified a critical bottleneck at the Forest Clearance stage for case ${caseId || "CASE-00045"}. Historical data indicates a high probability of a 300+ day delay if immediate action is not taken.\n\nWe urgently request an expedited review of the pending environmental impact assessments. Please prioritize this file to mitigate escalating acquisition risks.\n\nSincerely,\nAI Risk Mitigation System\nDrishtiPulse Platform`
      );
    }
  }, [isOpen, caseId, targetDepartment]);

  const handleRegenerate = () => {
    setIsDrafting(true);
    setTimeout(() => {
      setDraftContent(`Subject: EXPEDITED REVIEW REQUIRED - ${caseId || "CASE-00045"}\n\nAttention: ${targetDepartment}\n\nPredictive analytics indicate that pending approvals in your department are the primary risk driver for ${caseId || "CASE-00045"}, contributing to an estimated delay of 407 days.\n\nImmediate intervention is advised. Please allocate dedicated resources to resolve the outstanding clearance requirements within the next 48 hours to prevent severe project derailment.\n\nBest regards,\nDrishtiPulse Action Drafter`);
      setIsDrafting(false);
    }, 1500);
  };

  const handleDispatch = () => {
    setIsDispatched(true);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onClose();
      setIsDispatched(false);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-[#34f0b5]/20 border border-[#34f0b5]/50 text-[#34f0b5] px-6 py-3 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(52,240,181,0.2)] animate-in slide-in-from-top-4">
          <Send size={16} /> Notice Dispatched Successfully
        </div>
      )}

      <div className="w-full max-w-2xl bg-[#0a0e27] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff2d9a] to-[#4dd0ff] flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">AI Action Drafter</h3>
              <p className="text-xs text-[#8b93b8]">Automated Inter-Departmental Notice</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8b93b8] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <label className="text-xs font-semibold text-[#8b93b8] uppercase tracking-wider shrink-0">Target Dept</label>
            <div className="bg-[#05070f] border border-white/10 px-4 py-2 rounded-lg text-sm text-white font-medium flex-1">
              {targetDepartment}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#8b93b8] uppercase tracking-wider">Generated Draft</label>
              {isDrafting && <span className="text-xs text-[#4dd0ff] animate-pulse">AI is writing...</span>}
            </div>
            <textarea
              className="w-full h-64 bg-[#05070f] border border-white/10 rounded-xl p-4 text-sm text-[#f4f6fb] leading-relaxed focus:outline-none focus:border-[#ff2d9a]/50 resize-none"
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              disabled={isDrafting}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between gap-4">
          <button 
            onClick={handleRegenerate}
            disabled={isDrafting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#8b93b8] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isDrafting ? "animate-spin" : ""} />
            Regenerate
          </button>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigator.clipboard.writeText(draftContent)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#05070f] border border-white/10 hover:border-white/30 rounded-lg transition-colors"
            >
              <Copy size={16} />
              Copy
            </button>
            <button 
              onClick={handleDispatch}
              disabled={isDispatched}
              className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#ff2d9a] to-[#4dd0ff] rounded-lg shadow-[0_0_20px_rgba(255,45,154,0.3)] hover:opacity-90 transition-all disabled:opacity-50"
            >
              <Send size={16} />
              {isDispatched ? 'Dispatching...' : 'Dispatch Notice'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
