import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  CheckCircle2,
  AlertCircle,
  XCircle,
  BookOpen,
  Award,
  Sparkles,
  Loader2,
  Zap,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  BrainCircuit,
  Mic,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Brain,
  AlertTriangle
} from 'lucide-react';
import { InterviewSession, InterviewScorecard, QuestionEvaluation, IdealAnswerResult } from '../types';
import { evaluateInterviewSession, generateIdealAnswer } from '../utils/aiService';

interface AnalyticsScorecardProps {
  session: InterviewSession | null;
  onRetakeInterview: () => void;
}

export const AnalyticsScorecard: React.FC<AnalyticsScorecardProps> = ({
  session,
  onRetakeInterview,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [scorecard, setScorecard] = useState<InterviewScorecard | null>(null);

  // Ideal answer generation state
  const [loadingQIds, setLoadingQIds] = useState<string[]>([]);
  const [idealAnswersMap, setIdealAnswersMap] = useState<Record<string, IdealAnswerResult>>({});
  const [speakingQId, setSpeakingQId] = useState<string | null>(null);
  const [copiedQId, setCopiedQId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    const generateScorecard = async () => {
      setIsLoading(true);
      try {
        const sc = await evaluateInterviewSession(session);
        setScorecard(sc);
      } catch (err) {
        console.error('Error generating scorecard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    generateScorecard();
  }, [session]);

  // Speech synthesis stop handler
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4 shadow-2xs">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <BarChart3 className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-bold text-slate-900">No Interview Scorecard Found</h3>
          <p className="text-xs text-slate-500">
            Complete an AI Mock Interview session to generate your comprehensive performance analytics scorecard and answer correctness report.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || !scorecard) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4 shadow-2xs">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">Processing Transcripts & Verifying Answer Correctness...</h3>
          <p className="text-xs text-slate-500">
            Evaluating technical accuracy, answer correctness, speech pacing, filler words, and candidate role readiness.
          </p>
        </div>
      </div>
    );
  }

  // Calculate correctness statistics
  const evaluations = scorecard.questionEvaluations || [];
  const totalQuestions = evaluations.length;

  const correctCount = evaluations.filter((q) => {
    const score = q.score ?? 80;
    return q.correctnessCategory === 'correct' || score >= 80;
  }).length;

  const partiallyCorrectCount = evaluations.filter((q) => {
    const score = q.score ?? 80;
    return q.correctnessCategory === 'partially_correct' || (score >= 50 && score < 80);
  }).length;

  const incorrectCount = evaluations.filter((q) => {
    const score = q.score ?? 80;
    return q.correctnessCategory === 'incorrect' || score < 50;
  }).length;

  const isCandidateReady = scorecard.candidateReadinessStatus === 'ready' || scorecard.overallReadinessScore >= 75;

  // Handler for AI Ideal Answer generation button
  const handleGenerateIdealAnswer = async (q: QuestionEvaluation, qIdx: number) => {
    const qKey = q.questionId || `q-${qIdx}`;

    // If already generated, toggle visibility
    if (idealAnswersMap[qKey]) {
      // Toggle off by removing or keep
      setIdealAnswersMap((prev) => {
        const next = { ...prev };
        delete next[qKey];
        return next;
      });
      if (speakingQId === qKey && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setSpeakingQId(null);
      }
      return;
    }

    setLoadingQIds((prev) => [...prev, qKey]);
    try {
      const ideal = await generateIdealAnswer(
        q.questionText,
        session.jobDescriptionTitle,
        session.roleCategory,
        q.candidateAnswer
      );
      setIdealAnswersMap((prev) => ({ ...prev, [qKey]: ideal }));
    } catch (err) {
      console.error('Error generating ideal answer:', err);
    } finally {
      setLoadingQIds((prev) => prev.filter((id) => id !== qKey));
    }
  };

  // Handler for voice speech read aloud of ideal answer
  const handleToggleReadAloud = (qKey: string, textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (speakingQId === qKey) {
      window.speechSynthesis.cancel();
      setSpeakingQId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingQId(null);
    utterance.onerror = () => setSpeakingQId(null);

    setSpeakingQId(qKey);
    window.speechSynthesis.speak(utterance);
  };

  // Copy ideal answer text
  const handleCopyIdealAnswer = (qKey: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQId(qKey);
    setTimeout(() => setCopiedQId(null), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Performance Analytics & Answer Correctness Scorecard</h2>
            <p className="text-xs text-slate-500">
              Evaluation report targeting: <strong className="text-slate-800">{session.jobDescriptionTitle}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={onRetakeInterview}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all border border-slate-200 min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>New Interview Session</span>
        </button>
      </div>

      {/* Role Readiness Status Banner */}
      <div
        className={`p-6 rounded-2xl border text-white shadow-md relative overflow-hidden space-y-4 ${
          isCandidateReady
            ? 'bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 border-emerald-500'
            : 'bg-gradient-to-br from-rose-600 via-amber-600 to-rose-800 border-rose-500'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              {isCandidateReady ? (
                <ShieldCheck className="w-7 h-7 text-white" />
              ) : (
                <AlertTriangle className="w-7 h-7 text-amber-100" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                  {isCandidateReady ? 'CANDIDATE HIRING VERDICT' : 'PRACTICE REQUIRED VERDICT'}
                </span>
              </div>
              <h3 className="text-xl font-black text-white mt-0.5">
                {isCandidateReady
                  ? `READY FOR ROLE: Candidate is Interview-Ready for ${session.jobDescriptionTitle}`
                  : `NEEDS FURTHER PRACTICE: Additional Preparation Recommended for ${session.jobDescriptionTitle}`}
              </h3>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-center shrink-0">
            <span className="text-[10px] uppercase font-bold text-white/80 block">Overall Readiness Score</span>
            <span className="text-3xl font-black text-white">{scorecard.overallReadinessScore}%</span>
          </div>
        </div>

        {/* Readiness Reasoning & Correctness Summary Counters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="md:col-span-2 bg-black/15 backdrop-blur-md p-3.5 rounded-xl border border-white/10 space-y-1">
            <span className="text-xs font-bold text-white/90 flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-white/90" />
              AI Hiring Manager Assessment Reasoning:
            </span>
            <p className="text-xs text-white/90 leading-relaxed">
              {scorecard.readinessReasoning ||
                (isCandidateReady
                  ? 'Candidate successfully answered key technical questions with accurate domain terminology, structured reasoning, and clear context.'
                  : 'Candidate missed essential domain concepts or provided incomplete responses on several questions. Focus on reviewing missing concepts below.')}
            </p>
          </div>

          {/* Correctness Pill Breakdown */}
          <div className="bg-black/20 backdrop-blur-md p-3.5 rounded-xl border border-white/10 space-y-2 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-white/90 uppercase tracking-wide block">
              Question Correctness Summary ({totalQuestions} Total)
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-bold">
              <div className="bg-emerald-500/30 border border-emerald-300/40 p-1.5 rounded-lg">
                <span className="block text-emerald-100 text-[10px]">Correct</span>
                <span className="text-base text-white">{correctCount}</span>
              </div>
              <div className="bg-amber-500/30 border border-amber-300/40 p-1.5 rounded-lg">
                <span className="block text-amber-100 text-[10px]">Partial</span>
                <span className="text-base text-white">{partiallyCorrectCount}</span>
              </div>
              <div className="bg-rose-500/30 border border-rose-300/40 p-1.5 rounded-lg">
                <span className="block text-rose-100 text-[10px]">Incorrect</span>
                <span className="text-base text-white">{incorrectCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Overall Readiness */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Readiness Index</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600">{scorecard.overallReadinessScore}%</span>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> {isCandidateReady ? 'Job Ready' : 'In Progress'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${scorecard.overallReadinessScore}%` }} />
          </div>
        </div>

        {/* Technical Accuracy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Technical Accuracy</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-600">{scorecard.technicalAccuracyScore}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${scorecard.technicalAccuracyScore}%` }} />
          </div>
        </div>

        {/* Communication Pacing */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Speech Pacing & Clarity</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-600">{scorecard.communicationScore}%</span>
            <span className="text-[10px] text-slate-500 font-mono">{scorecard.fillerWordsAnalytics.wordsPerMinute} WPM</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-purple-600 h-full rounded-full" style={{ width: `${scorecard.communicationScore}%` }} />
          </div>
        </div>

        {/* Proctoring Integrity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Proctoring Integrity</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black ${scorecard.proctoringIntegrityScore >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {scorecard.proctoringIntegrityScore}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full ${scorecard.proctoringIntegrityScore >= 90 ? 'bg-emerald-600' : 'bg-amber-500'}`}
              style={{ width: `${scorecard.proctoringIntegrityScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filler Words & Pacing Analytics */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-purple-600" />
          <span>Speech Delivery & Filler Word Analytics</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Detected Filler Words</span>
            <span className="text-xl font-bold text-slate-900 block">{scorecard.fillerWordsAnalytics.totalFillerCount} occurrences</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Pacing Speed</span>
            <span className="text-xl font-bold text-slate-900 block">{scorecard.fillerWordsAnalytics.wordsPerMinute} Words / Min</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Detected Words Breakdown</span>
            <div className="flex flex-wrap gap-1 pt-1">
              {scorecard.fillerWordsAnalytics.detectedWords.map((item, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-800 font-mono text-[10px] font-bold rounded-md">
                  "{item.word}": {item.count}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Question-by-Question Correctness Breakdown & AI Ideal Answer Generators */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Detailed Question Answer Correctness & AI Ideal Generator</h3>
            <p className="text-xs text-slate-500">
              Review candidate responses, correctness badges, strengths, missing concepts, and generate AI ideal answers on demand.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold rounded-lg flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {correctCount} Correct
            </span>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 font-bold rounded-lg flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              {partiallyCorrectCount} Partial
            </span>
            <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 font-bold rounded-lg flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              {incorrectCount} Incorrect
            </span>
          </div>
        </div>

        <div className="space-y-5">
          {evaluations.map((q, idx) => {
            const matchedResp = session.responses.find((r) => r.questionId === q.questionId) || session.responses[idx];
            const candidateAnswerText = matchedResp?.candidateAnswerText || q.candidateAnswer;
            const audioUrl = matchedResp?.audioUrl || q.audioUrl;

            const qKey = q.questionId || `q-${idx}`;
            const qScore = q.score ?? 80;

            const category =
              q.correctnessCategory ||
              (qScore >= 80 ? 'correct' : qScore >= 50 ? 'partially_correct' : 'incorrect');

            const isGeneratingThis = loadingQIds.includes(qKey);
            const idealAnswerObj = idealAnswersMap[qKey];

            return (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4 text-xs">
                {/* Question Title & Correctness Badge */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/80 pb-3">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        Question #{idx + 1}
                      </span>

                      {/* Correctness Status Badge */}
                      {category === 'correct' ? (
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-[10px] rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          CORRECT ANSWER
                        </span>
                      ) : category === 'partially_correct' ? (
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-black text-[10px] rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          PARTIALLY CORRECT
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-rose-100 text-rose-900 border border-rose-300 font-black text-[10px] rounded-full flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          INCORRECT / INCOMPLETE
                        </span>
                      )}
                    </div>

                    <p className="font-bold text-slate-900 text-sm leading-snug">
                      {q.questionText || matchedResp?.questionText}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1 bg-slate-900 text-white font-black text-xs rounded-lg">
                      Score: {qScore} / 100
                    </span>
                  </div>
                </div>

                {/* Candidate Voice Playback / Transcript */}
                {audioUrl ? (
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-purple-900 flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-purple-600" />
                        Candidate Voice Answer Playback
                      </span>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                        Audio Recorded
                      </span>
                    </div>
                    <audio controls src={audioUrl} className="w-full h-8 rounded-lg" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-[11px] text-slate-500 font-medium">
                    <Mic className="w-3.5 h-3.5 text-slate-400" />
                    <span>Candidate Answer captured as text transcript</span>
                  </div>
                )}

                {/* Answer Transcript */}
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block text-[11px]">Submitted Answer Transcript:</span>
                  <p className="text-slate-800 bg-white p-3 rounded-xl border border-slate-200 font-mono text-[11px] leading-relaxed">
                    "{candidateAnswerText}"
                  </p>
                </div>

                {/* Strengths & Growth Areas Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-emerald-50/90 rounded-xl border border-emerald-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-900 flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" /> What Candidate Handled Well
                    </span>
                    <ul className="list-disc list-inside text-[11px] text-emerald-950 space-y-0.5">
                      {q.strengths && q.strengths.length > 0 ? (
                        q.strengths.map((s, i) => <li key={i}>{s}</li>)
                      ) : (
                        <li>Addressed initial question topic.</li>
                      )}
                    </ul>
                  </div>

                  <div className="p-3 bg-rose-50/90 rounded-xl border border-rose-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-rose-900 flex items-center gap-1">
                      <ThumbsDown className="w-3.5 h-3.5 text-rose-600" /> Missing Concepts / Areas for Growth
                    </span>
                    <ul className="list-disc list-inside text-[11px] text-rose-950 space-y-0.5">
                      {q.improvements && q.improvements.length > 0 ? (
                        q.improvements.map((imp, i) => <li key={i}>{imp}</li>)
                      ) : (
                        <li>Could include specific quantitative metrics and trade-off details.</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* AI Ideal Answer Generator Action Bar */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => handleGenerateIdealAnswer(q, idx)}
                    disabled={isGeneratingThis}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border cursor-pointer shadow-2xs ${
                      idealAnswerObj
                        ? 'bg-purple-100 hover:bg-purple-200 text-purple-900 border-purple-300'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-purple-600'
                    }`}
                  >
                    {isGeneratingThis ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Generating Ideal AI Answer...</span>
                      </>
                    ) : idealAnswerObj ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 text-purple-700" />
                        <span>Hide Ideal AI Answer</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                        <span>Generate Ideal AI Answer for this Question</span>
                      </>
                    )}
                  </button>

                  <span className="text-[11px] text-slate-500">
                    {idealAnswerObj ? 'Ideal answer generated below' : 'Click to generate 100% ideal sample answer & key points'}
                  </span>
                </div>

                {/* Render Generated AI Ideal Answer Card */}
                {idealAnswerObj && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/90 via-indigo-50/90 to-purple-100/80 border border-purple-200 space-y-3.5 text-slate-900 animate-in fade-in duration-300 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-200 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
                          <Sparkles className="w-4 h-4 fill-amber-300 text-amber-300" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-purple-950 block">
                            Ideal AI Exemplar Response ({session.jobDescriptionTitle})
                          </span>
                          <span className="text-[10px] text-purple-700">
                            Comprehensive 100% target answer structured for maximum interview points
                          </span>
                        </div>
                      </div>

                      {/* Controls: Listen Read Aloud & Copy */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleReadAloud(qKey, idealAnswerObj.idealAnswer)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            speakingQId === qKey
                              ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                              : 'bg-white hover:bg-purple-100 text-purple-800 border-purple-300'
                          }`}
                        >
                          {speakingQId === qKey ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5" />
                              <span>Stop Voice</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-purple-600" />
                              <span>Listen to Answer</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyIdealAnswer(qKey, idealAnswerObj.idealAnswer)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300"
                        >
                          {copiedQId === qKey ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy Answer</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Ideal Answer Text */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-purple-950 block">High-Scoring Sample Response:</span>
                      <p className="text-xs text-slate-800 bg-white/90 p-3.5 rounded-xl border border-purple-200/80 leading-relaxed font-sans whitespace-pre-line shadow-2xs">
                        {idealAnswerObj.idealAnswer}
                      </p>
                    </div>

                    {/* Key Points Covered */}
                    {idealAnswerObj.keyPointsCovered && idealAnswerObj.keyPointsCovered.length > 0 && (
                      <div className="p-3 bg-white/80 rounded-xl border border-purple-200 space-y-1">
                        <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          Key Points Interviewers Expect in This Answer:
                        </span>
                        <ul className="pl-5 list-disc text-xs text-slate-800 space-y-0.5">
                          {idealAnswerObj.keyPointsCovered.map((pt, i) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* AI Coach Delivery Tip */}
                    {idealAnswerObj.expertTip && (
                      <div className="text-xs p-2.5 bg-purple-200/60 border border-purple-300 rounded-xl text-purple-950 flex items-start gap-2">
                        <Brain className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                        <span>
                          <strong>AI Delivery Tip:</strong> {idealAnswerObj.expertTip}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Targeted Micro-Learning Recommendations */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Targeted Micro-Learning & Domain Study Recommendations</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scorecard.microLearningRecommendations.map((rec, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 inline-block">
                {rec.resourceType}
              </span>
              <h4 className="font-bold text-slate-900">{rec.title}</h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
