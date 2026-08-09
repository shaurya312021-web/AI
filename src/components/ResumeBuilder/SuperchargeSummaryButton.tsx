import React, { useState } from 'react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { superchargeSummary } from '../../utils/aiService';

interface SuperchargeSummaryButtonProps {
  rawText: string;
  targetTitle?: string;
  onApplySummary: (newSummary: string) => void;
  buttonText?: string;
  size?: 'sm' | 'md';
}

export const SuperchargeSummaryButton: React.FC<SuperchargeSummaryButtonProps> = ({
  rawText,
  targetTitle,
  onApplySummary,
  buttonText = 'Supercharge with AI',
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSummaries, setGeneratedSummaries] = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleSupercharge = async () => {
    if (!rawText || rawText.trim().length < 5) {
      alert('Please enter a draft summary first (at least 5 characters).');
      return;
    }
    setIsOpen(true);
    setIsLoading(true);
    try {
      const summaries = await superchargeSummary(rawText, targetTitle);
      setGeneratedSummaries(summaries);
    } catch (err) {
      console.error(err);
      setGeneratedSummaries([
        `Results-driven ${targetTitle || 'Professional'} with proven expertise in ${rawText}. Skilled at aligning cross-functional teams to exceed core KPI targets and deliver scalable solutions.`,
        `Dynamic ${targetTitle || 'Specialist'} leveraging deep experience in ${rawText}. Proven track record of optimizing operations, accelerating delivery timelines, and elevating performance.`,
        `Innovative ${targetTitle || 'Professional'} passionate about ${rawText}. Combines strategic capability with analytical problem solving to build high-value outcomes in fast-paced environments.`
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (summary: string) => {
    onApplySummary(summary);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleSupercharge}
        className={`inline-flex items-center gap-1.5 font-semibold text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all shadow-2xs hover:shadow-xs active:scale-95 ${
          size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
        }`}
        title="Transform draft summary into high-impact, ATS-optimized executive summary options"
      >
        <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
        <span>{buttonText}</span>
      </button>

      {/* Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">AI Summary Supercharger</h3>
                  <p className="text-xs text-slate-500">ATS-Optimized Executive Summary Generator</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-md hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Original Draft Display */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Draft Summary Input:</span>
              <p className="text-xs text-slate-800 font-medium italic">"{rawText}"</p>
            </div>

            {/* AI Generation State */}
            {isLoading ? (
              <div className="py-8 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-700">Synthesizing executive professional summaries...</p>
                <p className="text-[11px] text-slate-400">Crafting high-impact, ATS-tailored career summaries</p>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-800 block">Select your favorite AI-generated summary:</span>
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {generatedSummaries.map((summary, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedIdx(idx)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs space-y-2.5 ${
                        selectedIdx === idx
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80'
                      }`}
                    >
                      <p className="text-slate-800 font-medium leading-relaxed">{summary}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-100/60 px-2 py-0.5 rounded-full">Option #{idx + 1} • Executive Summary</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApply(summary);
                          }}
                          className="flex items-center gap-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-all shadow-2xs"
                        >
                          <span>Apply This</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
