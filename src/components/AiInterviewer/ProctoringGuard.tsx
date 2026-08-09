import React, { useEffect, useState } from 'react';
import { AlertOctagon, EyeOff, ShieldAlert, Check } from 'lucide-react';
import { ProctoringEvent } from '../../types';

interface ProctoringGuardProps {
  isActive: boolean;
  onFlagEvent: (event: ProctoringEvent) => void;
  eventCount: number;
}

export const ProctoringGuard: React.FC<ProctoringGuardProps> = ({
  isActive,
  onFlagEvent,
  eventCount,
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [latestEventMessage, setLatestEventMessage] = useState('');

  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const event: ProctoringEvent = {
          id: `proc-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          eventType: 'tab_switch',
        };
        onFlagEvent(event);
        setLatestEventMessage('Tab Switch / Window Minimized Detected!');
        setShowWarning(true);
      }
    };

    const handleWindowBlur = () => {
      const event: ProctoringEvent = {
        id: `proc-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        eventType: 'window_blur',
      };
      onFlagEvent(event);
      setLatestEventMessage('Focus Lost: Candidate switched away from interview screen.');
      setShowWarning(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isActive, onFlagEvent]);

  return (
    <>
      {/* Active Proctoring Indicator Badge */}
      <div className="flex items-center justify-between bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold tracking-tight">Module 4: Anti-Malpractice Guard Active</span>
        </div>

        <div className="flex items-center gap-2">
          {eventCount > 0 ? (
            <span className="bg-red-500/20 text-red-300 font-bold px-2 py-0.5 rounded-full border border-red-500/30 text-[10px] flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-red-400" />
              {eventCount} Flag(s) Logged
            </span>
          ) : (
            <span className="bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 text-[10px] flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              100% Integrity
            </span>
          )}
        </div>
      </div>

      {/* Warning Overlay Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border-2 border-red-500">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <AlertOctagon className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Proctoring Warning Flag</h3>
              <p className="text-xs text-red-600 font-bold">{latestEventMessage}</p>
              <p className="text-[11px] text-slate-500 pt-2">
                Leaving or minimizing the interview session is flagged by the anti-cheat guard and recorded on your final performance scorecard.
              </p>
            </div>

            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-left text-xs font-mono text-red-800 space-y-1">
              <div className="flex justify-between">
                <span>Total Violations:</span>
                <span className="font-bold">{eventCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Integrity Score Impact:</span>
                <span className="font-bold">-{Math.min(60, eventCount * 15)}%</span>
              </div>
            </div>

            <button
              onClick={() => setShowWarning(false)}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              I Understand - Resume Interview
            </button>
          </div>
        </div>
      )}
    </>
  );
};
