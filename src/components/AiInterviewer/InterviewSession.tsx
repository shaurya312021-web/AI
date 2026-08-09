import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ArrowRight,
  Sparkles,
  Loader2,
  Clock,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  PanelRightClose,
  PanelRightOpen,
  Target,
  CheckSquare,
  Briefcase,
  FileText,
  BookOpen,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Brain,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { ResumeData, JobDescription, InterviewTier, RoleCategory, InterviewQuestion, InterviewResponse, InterviewSession, ProctoringEvent, SingleAnswerCheckResult } from '../../types';
import { fetchInterviewQuestions, checkAnswerCorrectness } from '../../utils/aiService';
import { ProctoringGuard } from './ProctoringGuard';

interface InterviewSessionProps {
  resume: ResumeData;
  jobDescription: JobDescription;
  onFinishSession: (session: InterviewSession) => void;
}

export const InterviewSessionComponent: React.FC<InterviewSessionProps> = ({
  resume,
  jobDescription,
  onFinishSession,
}) => {
  // Auto-detect role category from JD title or Resume
  const autoDetectRoleCategory = (): RoleCategory => {
    const jdTitle = (jobDescription?.title || '').toLowerCase();
    if (jdTitle.includes('test') || jdTitle.includes('qa') || jdTitle.includes('sdet') || jdTitle.includes('quality')) return 'tester';
    if (jdTitle.includes('manager') || jdTitle.includes('head') || jdTitle.includes('director') || jdTitle.includes('pmo')) return 'manager';
    if (jdTitle.includes('lead') || jdTitle.includes('architect') || jdTitle.includes('staff') || jdTitle.includes('principal')) return 'lead';
    if (jdTitle.includes('hr') || jdTitle.includes('recruiter') || jdTitle.includes('people') || jdTitle.includes('talent')) return 'hr';
    if (jdTitle.includes('product') || jdTitle.includes('pm') || jdTitle.includes('owner')) return 'product';
    if (jdTitle.includes('data') || jdTitle.includes('analytics') || jdTitle.includes('ml') || jdTitle.includes('ai')) return 'data';
    if (jdTitle.includes('designer') || jdTitle.includes('ux') || jdTitle.includes('ui')) return 'designer';
    return 'developer';
  };

  const [selectedRoleCategory, setSelectedRoleCategory] = useState<RoleCategory>(autoDetectRoleCategory());
  const [interviewMode, setInterviewMode] = useState<'45min_full' | 'express' | 'custom'>('45min_full');
  const [selectedTier, setSelectedTier] = useState<InterviewTier>('intermediate');
  const [questionCount, setQuestionCount] = useState<number>(7);
  const [interviewerVoiceGender, setInterviewerVoiceGender] = useState<'female' | 'male'>('female');
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [isInitializing, setIsInitializing] = useState(false);
  const [session, setSession] = useState<InterviewSession | null>(null);

  // Active Question index & answers
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [currentAnswerText, setCurrentAnswerText] = useState('');
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [proctoringEvents, setProctoringEvents] = useState<ProctoringEvent[]>([]);

  // Speech Recognition (STT), Speech Synthesis (TTS), and MediaRecorder Audio Recording
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false);
  const [answerCheckResult, setAnswerCheckResult] = useState<SingleAnswerCheckResult | null>(null);
  const [questionTimer, setQuestionTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);

  // Stop recording cleanup helper with promise to await onstop
  const stopAudioRecordingStreamAndGetUrl = (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
        recognitionRef.current = null;
      }

      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== 'inactive') {
        const mimeTypeUsed = mr.mimeType || 'audio/webm';
        mr.onstop = () => {
          let recordedUrl: string | null = null;
          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeTypeUsed });
            recordedUrl = URL.createObjectURL(audioBlob);
          }
          audioChunksRef.current = [];
          if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach((track) => track.stop());
            audioStreamRef.current = null;
          }
          mediaRecorderRef.current = null;
          resolve(recordedUrl);
        };
        try {
          mr.stop();
        } catch (e) {
          console.error('Error stopping MediaRecorder:', e);
          resolve(currentAudioUrl);
        }
      } else {
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => track.stop());
          audioStreamRef.current = null;
        }
        resolve(currentAudioUrl);
      }
    });
  };

  const stopAudioRecordingStream = () => {
    stopAudioRecordingStreamAndGetUrl();
  };

  // 1. Initialize Interview Questions
  const handleStartInterview = async () => {
    setIsInitializing(true);
    try {
      const qCountToUse = interviewMode === '45min_full' ? 7 : (interviewMode === 'express' ? 4 : questionCount);
      const questions = await fetchInterviewQuestions(
        resume,
        jobDescription,
        selectedTier,
        qCountToUse,
        selectedRoleCategory,
        interviewMode
      );

      const newSession: InterviewSession = {
        id: `session-${Date.now()}`,
        resumeId: resume.id,
        jobDescriptionTitle: jobDescription.title || 'Target Role',
        tier: selectedTier,
        roleCategory: selectedRoleCategory,
        interviewMode: interviewMode,
        questions,
        responses: [],
        proctoringEvents: [],
        startedAt: new Date().toISOString(),
        status: 'in_progress',
      };

      setSession(newSession);
      setCurrentQuestionIdx(0);
      setCurrentAnswerText('');
      setResponses([]);
      setProctoringEvents([]);
      setQuestionTimer(0);
      
      // Auto TTS read first question
      if (questions.length > 0) {
        speakQuestionText(questions[0].question);
      }
    } catch (err) {
      console.error(err);
      alert('Error initializing interview session.');
    } finally {
      setIsInitializing(false);
    }
  };

  // Timer tick for current question duration
  useEffect(() => {
    if (session && session.status === 'in_progress') {
      timerRef.current = setInterval(() => {
        setQuestionTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session, currentQuestionIdx]);

  // Ensure browser voices are loaded
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Helper to select the most natural browser voice based on gender
  const getBestVoiceForGender = (gender: 'female' | 'male') => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const femaleKeywords = ['female', 'samantha', 'victoria', 'karen', 'zira', 'google us english', 'natural', 'fiona', 'siri', 'samantha'];
    const maleKeywords = ['male', 'daniel', 'alex', 'david', 'aaron', 'george', 'google uk english male', 'fred'];

    const targetKeywords = gender === 'female' ? femaleKeywords : maleKeywords;
    const englishVoices = voices.filter((v) => v.lang.startsWith('en'));

    for (const kw of targetKeywords) {
      const match = englishVoices.find((v) => v.name.toLowerCase().includes(kw));
      if (match) return match;
    }

    if (englishVoices.length > 1) {
      return gender === 'female' ? englishVoices[0] : englishVoices[1];
    }

    return englishVoices[0] || voices[0] || null;
  };

  // TTS Helper using Web SpeechSynthesis with genuine voice characteristics
  const speakQuestionText = (text: string, overrideGender?: 'female' | 'male') => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const genderToUse = overrideGender || interviewerVoiceGender;

    const selectedVoice = getBestVoiceForGender(genderToUse);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Natural cadence & pitch adjustments
    utterance.rate = speechRate;
    if (genderToUse === 'female') {
      utterance.pitch = 1.12; // Warm, professional female tone
    } else {
      utterance.pitch = 0.88; // Deep, confident male tone
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleTestVoiceSample = (gender: 'female' | 'male') => {
    const sampleText = gender === 'female'
      ? "Hello! I am Sarah, your AI Senior Hiring Manager today. I'll be asking you structured technical questions to evaluate your skill alignment."
      : "Hello! I am David, your Principal Tech Lead interviewer today. Let's begin your mock interview session.";
    speakQuestionText(sampleText, gender);
  };

  const toggleTTS = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (session && session.questions[currentQuestionIdx]) {
      speakQuestionText(session.questions[currentQuestionIdx].question);
    }
  };

  // STT & Audio MediaRecorder Helper
  const toggleSpeechToText = async () => {
    if (isListening) {
      // Stop Recording & Speech Recognition
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      stopAudioRecordingStream();
      setIsListening(false);
    } else {
      // Start Recording Microphone Audio + STT
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Microphone access is not supported by your browser environment.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        audioChunksRef.current = [];

        // Safe MediaRecorder constructor with supported mimeTypes check
        let mediaRecorder: MediaRecorder;
        let mimeTypeUsed = 'audio/webm';

        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeTypeUsed = 'audio/webm;codecs=opus';
            mediaRecorder = new MediaRecorder(stream, { mimeType: mimeTypeUsed });
          } else if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/webm')) {
            mimeTypeUsed = 'audio/webm';
            mediaRecorder = new MediaRecorder(stream, { mimeType: mimeTypeUsed });
          } else if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeTypeUsed = 'audio/mp4';
            mediaRecorder = new MediaRecorder(stream, { mimeType: mimeTypeUsed });
          } else {
            mediaRecorder = new MediaRecorder(stream);
            mimeTypeUsed = mediaRecorder.mimeType || 'audio/wav';
          }

          mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            if (audioChunksRef.current.length > 0) {
              const audioBlob = new Blob(audioChunksRef.current, { type: mimeTypeUsed });
              const audioUrl = URL.createObjectURL(audioBlob);
              setCurrentAudioUrl(audioUrl);
            }
          };

          mediaRecorder.start(250); // Record in 250ms chunks
          mediaRecorderRef.current = mediaRecorder;
        }

        // Also start browser speech recognition if supported
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          try {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            const baseText = currentAnswerText;

            recognition.onresult = (event: any) => {
              let finalTranscript = '';
              let interimTranscript = '';

              for (let i = 0; i < event.results.length; i++) {
                const res = event.results[i];
                if (res && res[0]) {
                  if (res.isFinal) {
                    finalTranscript += res[0].transcript;
                  } else {
                    interimTranscript += res[0].transcript;
                  }
                }
              }

              const totalSpeech = (finalTranscript + interimTranscript).trim();
              if (totalSpeech) {
                setCurrentAnswerText(baseText ? `${baseText} ${totalSpeech}` : totalSpeech);
              }
            };

            recognition.onerror = (err: any) => {
              console.warn('STT SpeechRecognition warning:', err);
            };

            recognitionRef.current = recognition;
            recognition.start();
          } catch (sttErr) {
            console.warn('SpeechRecognition initialization error:', sttErr);
          }
        }

        setIsListening(true);
      } catch (err: any) {
        console.error('Microphone access error:', err);
        alert(`Microphone error: ${err.message || 'Please enable microphone access in your browser.'}`);
        setIsListening(false);
      }
    }
  };

  // Check Answer Correctness with AI
  const handleCheckAnswerWithAi = async () => {
    if (!currentAnswerText.trim()) {
      alert('Please speak or type your response first before asking AI to verify correctness.');
      return;
    }
    const currentQ = session?.questions[currentQuestionIdx];
    if (!currentQ) return;

    setIsCheckingAnswer(true);
    try {
      const result = await checkAnswerCorrectness(
        currentQ.question,
        currentAnswerText,
        currentQ.sampleAnswer,
        currentQ.hints,
        selectedRoleCategory
      );
      setAnswerCheckResult(result);
    } catch (err) {
      console.error('Check answer error:', err);
    } finally {
      setIsCheckingAnswer(false);
    }
  };

  // Next Question / Complete Interview
  const handleSaveAndNextQuestion = async () => {
    if (!session) return;

    let finalAudioUrl = currentAudioUrl;

    if (isListening) {
      setIsListening(false);
      const recordedUrl = await stopAudioRecordingStreamAndGetUrl();
      if (recordedUrl) {
        finalAudioUrl = recordedUrl;
      }
    } else {
      await stopAudioRecordingStreamAndGetUrl();
    }

    window.speechSynthesis.cancel();

    const currentQ = session.questions[currentQuestionIdx];
    const newResponse: InterviewResponse = {
      questionId: currentQ.id,
      questionText: currentQ.question,
      candidateAnswerText: currentAnswerText.trim() || 'Candidate passed on this question.',
      durationSeconds: questionTimer,
      audioRecorded: Boolean(finalAudioUrl),
      audioUrl: finalAudioUrl || undefined,
      proctoringFlagsDuringQuestion: proctoringEvents.length,
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    // Reset current state clean for the next question
    setCurrentAnswerText('');
    setCurrentAudioUrl(null);
    setAnswerCheckResult(null);
    setQuestionTimer(0);

    if (currentQuestionIdx < session.questions.length - 1) {
      const nextIdx = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIdx);
      speakQuestionText(session.questions[nextIdx].question);
    } else {
      // Completed Session
      const completedSession: InterviewSession = {
        ...session,
        responses: updatedResponses,
        proctoringEvents,
        completedAt: new Date().toISOString(),
        status: 'completed',
      };
      setSession(completedSession);
      onFinishSession(completedSession);
    }
  };

  const handleProctoringFlag = (evt: ProctoringEvent) => {
    setProctoringEvents((prev) => [...prev, evt]);
  };

  // Setup View
  if (!session) {
    const roleCategories: { id: RoleCategory; label: string; icon: string; desc: string }[] = [
      { id: 'tester', label: 'Tester / QA Automation', icon: '🧪', desc: 'Selenium, Cypress, test strategy, bug triage & edge cases.' },
      { id: 'developer', label: 'Software Developer', icon: '💻', desc: 'Code architecture, algorithms, API design & async logic.' },
      { id: 'lead', label: 'Tech Lead / Architect', icon: '🚀', desc: 'System design, technical debt, code reviews & mentorship.' },
      { id: 'manager', label: 'Engineering Manager', icon: '👔', desc: 'Delivery management, performance reviews & team leadership.' },
      { id: 'hr', label: 'HR / Recruiter', icon: '👥', desc: 'Talent acquisition, employee relations, compliance & onboarding.' },
      { id: 'product', label: 'Product Manager', icon: '🎯', desc: 'Roadmapping, feature prioritization, PRDs & stakeholder alignment.' },
      { id: 'data', label: 'Data & AI Specialist', icon: '📊', desc: 'Data pipelines, ML validation, SQL optimization & analytics.' },
      { id: 'designer', label: 'UI/UX Designer', icon: '🎨', desc: 'User journeys, wireframes, design systems & usability testing.' },
      { id: 'general', label: 'General / Other Role', icon: '💼', desc: 'Custom domain competency, scenario execution & problem solving.' },
    ];

    const tiers: { id: InterviewTier; title: string; desc: string; badge: string }[] = [
      { id: 'basic', title: 'Tier 1: Basic / Fundamentals', desc: 'Core language syntax, terminology & fundamental concepts.', badge: 'Entry Level' },
      { id: 'intermediate', title: 'Tier 2: Intermediate / Practical', desc: 'Real-world problem solving, execution & framework integration.', badge: 'Mid Level' },
      { id: 'scenario', title: 'Tier 3: High-Level / Scenario', desc: 'Incident response, trade-offs & domain leadership.', badge: 'Senior Level' },
      { id: 'system_design', title: 'Tier 4: Coding & System Design', desc: 'Scalable architecture, database design & microservices.', badge: 'Principal / Staff' },
    ];

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">AI Mock Interview Generator & Voice Simulator</h2>
                <p className="text-xs text-slate-500">Auto-crafts a structured 45-Minute Interview Loop based on Resume & Target Job Description.</p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full border border-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Targeting: {jobDescription.title || 'Selected Role'}</span>
            </span>
          </div>
        </div>

        {/* Setup Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">

          {/* 1. Target Role Category Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">1. Select Target Candidate Role</h3>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Auto-Detected: {selectedRoleCategory.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {roleCategories.map((rc) => {
                const isSelected = selectedRoleCategory === rc.id;
                return (
                  <div
                    key={rc.id}
                    onClick={() => setSelectedRoleCategory(rc.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl shrink-0 leading-none mt-0.5">{rc.icon}</span>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{rc.label}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">{rc.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. 45-Min Interview Blueprint & Mode Card */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">2. Select Interview Mode & Structure</h3>
              <span className="text-xs text-slate-500 font-medium">Auto-planned session agenda</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => setInterviewMode('45min_full')}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-1 relative ${
                  interviewMode === '45min_full'
                    ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    45-Min Full Loop
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-600 text-white rounded-full">RECOMMENDED</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Complete 7-question interview loop across 4 distinct stages tailored to JD & Resume.
                </p>
              </div>

              <div
                onClick={() => setInterviewMode('express')}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-1 relative ${
                  interviewMode === 'express'
                    ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">20-Min Express Screen</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">Quick</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Fast 4-question technical screening focused on primary domain skills.
                </p>
              </div>

              <div
                onClick={() => setInterviewMode('custom')}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-1 relative ${
                  interviewMode === 'custom'
                    ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Custom Loop</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">Flexible</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Select custom question counts (5-8 questions) and difficulty tiers.
                </p>
              </div>
            </div>

            {/* 45-Min Interview Agenda Agenda Preview Card */}
            {interviewMode === '45min_full' && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
                  <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    45-Minute Interview Agenda & Stage Allocation
                  </span>
                  <span className="text-[10px] font-bold text-purple-700">7 Total Questions • 4 Stages</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white/80 p-2.5 rounded-lg border border-purple-100 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-purple-900">
                      <span>Stage 1</span>
                      <span className="text-purple-600">5 Mins</span>
                    </div>
                    <p className="font-bold text-slate-800 text-[11px]">Warm-up & Intro</p>
                    <p className="text-[10px] text-slate-500">Resume background & career progression.</p>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-purple-100 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-purple-900">
                      <span>Stage 2</span>
                      <span className="text-purple-600">20 Mins</span>
                    </div>
                    <p className="font-bold text-slate-800 text-[11px]">Domain Deep Dive</p>
                    <p className="text-[10px] text-slate-500">Core role tools, frameworks & job criteria.</p>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-purple-100 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-purple-900">
                      <span>Stage 3</span>
                      <span className="text-purple-600">15 Mins</span>
                    </div>
                    <p className="font-bold text-slate-800 text-[11px]">Scenarios & Leadership</p>
                    <p className="text-[10px] text-slate-500">Real-world incidents, edge cases & trade-offs.</p>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-purple-100 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-purple-900">
                      <span>Stage 4</span>
                      <span className="text-purple-600">5 Mins</span>
                    </div>
                    <p className="font-bold text-slate-800 text-[11px]">Behavioral & Q&A</p>
                    <p className="text-[10px] text-slate-500">Culture fit, collaboration & candidate questions.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Difficulty Tier Selection */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">3. Select Primary Difficulty Tier</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tiers.map((t) => {
                const isSelected = selectedTier === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTier(t.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1 relative ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{t.title}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {t.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{t.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. AI Interviewer Voice Persona */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">4. Select AI Interviewer Voice Persona</h3>
              <span className="text-[11px] text-slate-500 font-medium">Select genuine female or male voice</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Female Voice */}
              <div
                onClick={() => setInterviewerVoiceGender('female')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 relative ${
                  interviewerVoiceGender === 'female'
                    ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      👩
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Sarah (Female AI)</p>
                      <p className="text-[10px] text-slate-500">Senior Hiring Manager</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInterviewerVoiceGender('female');
                      handleTestVoiceSample('female');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-purple-700 font-bold rounded-lg text-[10px] shadow-2xs"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Test Voice</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-600">Warm, articulate conversational tone with professional cadence.</p>
              </div>

              {/* Male Voice */}
              <div
                onClick={() => setInterviewerVoiceGender('male')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 relative ${
                  interviewerVoiceGender === 'male'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      👨
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">David (Male AI)</p>
                      <p className="text-[10px] text-slate-500">Principal Tech Lead</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInterviewerVoiceGender('male');
                      handleTestVoiceSample('male');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-indigo-700 font-bold rounded-lg text-[10px] shadow-2xs"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Test Voice</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-600">Deep, confident technical tone with clear pronunciation.</p>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              {interviewMode === 'custom' && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Questions count:</span>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-xs bg-slate-50"
                  >
                    <option value={5}>5 Questions</option>
                    <option value={6}>6 Questions</option>
                    <option value={7}>7 Questions</option>
                    <option value={8}>8 Questions</option>
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">TTS Speed:</span>
                <select
                  value={speechRate}
                  onChange={(e) => setSpeechRate(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold text-xs bg-slate-50"
                >
                  <option value={0.85}>0.85x (Slower)</option>
                  <option value={0.95}>0.95x (Natural)</option>
                  <option value={1.1}>1.10x (Faster)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleStartInterview}
              disabled={isInitializing}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-md transition-all active:scale-95 shrink-0"
            >
              {isInitializing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
              <span>Start 45-Min AI Interview</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Active Session View
  const currentQuestion = session.questions[currentQuestionIdx];

  // Helper for 45-min interview stage detection
  const getQuestionStageInfo = () => {
    if (currentQuestion?.stageName) {
      return currentQuestion.stageName;
    }
    const ratio = (currentQuestionIdx + 1) / session.questions.length;
    if (ratio <= 0.25) return 'Stage 1: Warm-up & Resume Intro (5m)';
    if (ratio <= 0.65) return 'Stage 2: Core Domain Deep Dive (20m)';
    if (ratio <= 0.90) return 'Stage 3: Scenarios & Problem Solving (15m)';
    return 'Stage 4: Cultural Fit & Behavioral (5m)';
  };

  const getStageAndJdTips = () => {
    const stageInfo = getQuestionStageInfo();
    const jdTitle = jobDescription?.title || 'Target Role';
    const role = session?.roleCategory || selectedRoleCategory || 'developer';

    let stageTips: { title: string; bullets: string[]; framework: string } = {
      title: 'Stage Strategy',
      bullets: [],
      framework: 'STAR Method (Situation, Task, Action, Result)'
    };

    if (stageInfo.includes('Stage 1') || stageInfo.includes('Warm-up')) {
      stageTips = {
        title: 'Stage 1: Warm-up & Resume Intro',
        bullets: [
          'Keep introduction concise (60–90s max). Focus on career trajectory.',
          `Connect key milestones directly to the core requirements of ${jdTitle}.`,
          'Highlight elevator pitch without reading your resume line-by-line.'
        ],
        framework: 'Elevator Pitch: Hook → Core Wins → Role Alignment'
      };
    } else if (stageInfo.includes('Stage 2') || stageInfo.includes('Core Domain')) {
      stageTips = {
        title: `Stage 2: Core Domain Deep Dive (${role.toUpperCase()})`,
        bullets: [
          'Demonstrate hands-on mastery of primary frameworks & tools.',
          'Discuss architectural design trade-offs (e.g., latency vs consistency, test coverage).',
          `Explicitly cite key technologies required in ${jdTitle}.`
        ],
        framework: 'Technical Framing: Context → Strategy → Trade-offs → Outcome'
      };
    } else if (stageInfo.includes('Stage 3') || stageInfo.includes('Scenarios')) {
      stageTips = {
        title: 'Stage 3: Real-World Scenarios & Incidents',
        bullets: [
          'Walk through root-cause analysis step-by-step for complex issues.',
          'Demonstrate crisis management under tight deadlines or ambiguity.',
          'Highlight preventative actions implemented to prevent recurring bugs.'
        ],
        framework: 'STAR Framework: Situation → Task → Action → Measured Result'
      };
    } else {
      stageTips = {
        title: 'Stage 4: Behavioral & Team Culture',
        bullets: [
          'Emphasize active listening, empathy, and cross-functional alignment.',
          'Show adaptability when requirements or business roadmaps shift.',
          'Highlight mentorship, team psychological safety, and growth mindset.'
        ],
        framework: 'Behavioral Model: Conflict/Challenge → Approach → Growth & Outcome'
      };
    }

    const roleTipsMap: Record<string, string[]> = {
      tester: [
        'Reference test pyramid balance (Unit, Integration, E2E).',
        'Discuss automation frameworks (Selenium/Cypress) & CI/CD pipeline triggers.',
        'Explain risk-based bug triage and edge case identification.'
      ],
      developer: [
        'Detail code modularity, API contract design, and error handling.',
        'Explain performance bottlenecks, database queries, or state management.',
        'Mention unit test coverage and automated deployment safety checks.'
      ],
      lead: [
        'Highlight technical debt allocation (~20% refactoring buffer).',
        'Discuss system architecture decisions, code reviews, and developer mentorship.',
        'Show how you balance engineering velocity with business deliverables.'
      ],
      manager: [
        'Emphasize 1-on-1 feedback loops, performance coaching, and team morale.',
        'Discuss resource allocation, sprint capacity planning, and stakeholder updates.',
        'Focus on talent retention and cross-team alignment.'
      ],
      hr: [
        'Discuss structured behavioral interviewing rubrics to eliminate bias.',
        'Explain employee relations mediation, compliance, and workplace policy.',
        'Highlight employer branding and talent pipeline retention metrics.'
      ],
      product: [
        'Reference product prioritization frameworks (RICE, MoSCoW, Kano model).',
        'Explain PRD creation, user telemetry tracking, and stakeholder buy-in.',
        'Focus on customer impact metrics and ROI.'
      ],
      data: [
        'Discuss data pipeline ETL reliability, SQL optimizations, and data quality checks.',
        'Explain model validation metrics (precision, recall, F1, RMSE).',
        'Detail handling missing data, scalability, and telemetry.'
      ],
      designer: [
        'Discuss design system consistency, accessibility (WCAG AA), and user research.',
        'Explain wireframing to high-fidelity prototype handoffs.',
        'Highlight usability testing feedback loops.'
      ],
      general: [
        'Provide structured, methodical answers.',
        'Quantify results using metrics (%, $ saved, latency reduction).',
        'Demonstrate clear communication and proactive problem solving.'
      ]
    };

    const roleBullets = roleTipsMap[role.toLowerCase()] || roleTipsMap.general;

    const extractedJdKeywords: string[] = [];
    if (jobDescription?.rawText) {
      const text = jobDescription.rawText.toLowerCase();
      const candidates = ['react', 'typescript', 'javascript', 'node', 'express', 'python', 'java', 'sql', 'aws', 'docker', 'kubernetes', 'selenium', 'cypress', 'testing', 'ci/cd', 'agile', 'scrum', 'system design', 'rest api', 'graphql', 'microservices'];
      candidates.forEach((kw) => {
        if (text.includes(kw) && !extractedJdKeywords.includes(kw.toUpperCase())) {
          extractedJdKeywords.push(kw.toUpperCase());
        }
      });
    }

    return { stageTips, roleBullets, extractedJdKeywords };
  };

  const { stageTips, roleBullets, extractedJdKeywords } = getStageAndJdTips();

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      
      {/* Proctoring Guard Component */}
      <ProctoringGuard
        isActive={session.status === 'in_progress'}
        onFlagEvent={handleProctoringFlag}
        eventCount={proctoringEvents.length}
      />

      {/* 45-Minute Interview Stage Tracker Header & Sidebar Toggle */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Question {currentQuestionIdx + 1} of {session.questions.length}</span>
            <span className="text-slate-300">•</span>
            <span className="text-purple-700 font-semibold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 uppercase text-[10px]">
              {session.roleCategory?.toUpperCase() || 'ROLE'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 uppercase text-[10px]">
              {session.tier}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs transition-all shadow-2xs cursor-pointer"
              title="Toggle Stage & JD Coaching Sidebar"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span className="hidden sm:inline">{isSidebarOpen ? 'Hide Stage Coach Tips' : 'Show Stage Tips & JD Coaching'}</span>
              <span className="sm:hidden">{isSidebarOpen ? 'Hide Tips' : 'Tips'}</span>
              {isSidebarOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
            </button>

            {/* Interviewer Persona Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700 text-xs">
              <span>{interviewerVoiceGender === 'female' ? '👩 Sarah' : '👨 David'}</span>
              <span className="text-[10px] text-slate-400">({interviewerVoiceGender === 'female' ? 'Female AI' : 'Male AI'})</span>
            </div>

            <div className="flex items-center gap-1 font-mono text-slate-600 font-bold bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>{Math.floor(questionTimer / 60)}:{(questionTimer % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* Stage Progress Banner */}
        <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <span className="font-bold text-purple-900 block">{getQuestionStageInfo()}</span>
              <span className="text-[10px] text-purple-700">Auto-tailored to Candidate Resume & Job Description requirements</span>
            </div>
          </div>

          <div className="text-[11px] font-bold text-purple-800 bg-white px-2.5 py-1 rounded-lg border border-purple-200 shrink-0 self-start sm:self-auto">
            Target Allocation: ~{currentQuestion?.timeAllocationMins || 6} Mins
          </div>
        </div>
      </div>

      {/* Grid Container for Main Active Session & Collapsible Sidebar */}
      <div className={`grid grid-cols-1 ${isSidebarOpen ? 'lg:grid-cols-12' : ''} gap-5 transition-all`}>
        
        {/* Main Active Question & Answer Column */}
        <div className={isSidebarOpen ? 'lg:col-span-7 xl:col-span-8 space-y-5' : 'space-y-5'}>
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                    Category: {currentQuestion?.category || 'Domain Competency'}
                  </span>
                  {isSpeaking && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[10px] animate-pulse">
                      <Volume2 className="w-3 h-3 text-purple-600" />
                      AI Interviewer Speaking...
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {currentQuestion?.question}
                </h3>

                {/* Answer Hints Preview */}
                {currentQuestion?.hints && currentQuestion.hints.length > 0 && (
                  <div className="pt-2">
                    <details className="text-xs text-slate-500 cursor-pointer group">
                      <summary className="font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>View Key Evaluation Focus & Hints</span>
                      </summary>
                      <ul className="mt-2 pl-5 list-disc text-[11px] text-slate-600 space-y-1 bg-purple-50/50 p-2.5 rounded-lg border border-purple-100">
                        {currentQuestion.hints.map((hint, hIdx) => (
                          <li key={hIdx}>{hint}</li>
                        ))}
                      </ul>
                    </details>
                  </div>
                )}
              </div>

              {/* TTS Audio Controls */}
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <select
                  value={interviewerVoiceGender}
                  onChange={(e) => {
                    const newGender = e.target.value as 'female' | 'male';
                    setInterviewerVoiceGender(newGender);
                    speakQuestionText(currentQuestion.question, newGender);
                  }}
                  className="px-2.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 min-h-[40px]"
                  title="Change AI Interviewer Voice"
                >
                  <option value="female">👩 Sarah (Female)</option>
                  <option value="male">👨 David (Male)</option>
                </select>

                <button
                  onClick={toggleTTS}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-center min-w-[40px] min-h-[40px] ${
                    isSpeaking
                      ? 'bg-purple-600 text-white border-purple-600 animate-pulse'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title="Replay / Mute AI Voice"
                >
                  {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Speech to Text Answer Input */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800">Candidate Answer (Voice or Typing):</label>
                
                <button
                  onClick={toggleSpeechToText}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs min-h-[44px] ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isListening ? 'Stop Recording' : 'Start Voice Capturing'}</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={currentAnswerText}
                onChange={(e) => setCurrentAnswerText(e.target.value)}
                placeholder="Speak into your microphone or type your structured response here..."
                className="w-full p-3.5 sm:p-4 rounded-xl border border-slate-200 text-xs font-mono leading-relaxed outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 bg-slate-50/50"
              />

              {/* Voice Audio Recording Preview */}
              {currentAudioUrl && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-900 flex items-center gap-1.5">
                      <Mic className="w-4 h-4 text-purple-600" />
                      Recorded Voice Answer Preview
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                      Audio Captured
                    </span>
                  </div>
                  <audio controls src={currentAudioUrl} className="w-full h-9 rounded-lg" />
                </div>
              )}

              {/* Instant AI Correctness Verification Button */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleCheckAnswerWithAi}
                  disabled={isCheckingAnswer || !currentAnswerText.trim()}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border cursor-pointer shadow-2xs ${
                    !currentAnswerText.trim()
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-300 hover:border-purple-400'
                  }`}
                  title="Ask AI to evaluate if your response is correct, missing concepts, or complete"
                >
                  {isCheckingAnswer ? (
                    <>
                      <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                      <span>AI Is Evaluating Answer Correctness...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                      <span>Verify Answer Correctness with AI</span>
                    </>
                  )}
                </button>

                {answerCheckResult && (
                  <button
                    type="button"
                    onClick={() => setAnswerCheckResult(null)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Hide AI Feedback</span>
                  </button>
                )}
              </div>

              {/* AI Answer Verification Card */}
              {answerCheckResult && (
                <div className={`p-4 rounded-2xl border space-y-3 animate-in fade-in duration-200 ${
                  answerCheckResult.score >= 80
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : answerCheckResult.score >= 50
                    ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                    : 'bg-rose-50/80 border-rose-200 text-rose-950'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 border-black/10">
                    <div className="flex items-center gap-2">
                      {answerCheckResult.score >= 80 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : answerCheckResult.score >= 50 ? (
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-sm block leading-tight">
                          {answerCheckResult.verdictTitle}
                        </span>
                        <span className="text-[11px] opacity-80">
                          Instant AI Answer Evaluation & Correctness Report
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                        answerCheckResult.score >= 80
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : answerCheckResult.score >= 50
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}>
                        Score: {answerCheckResult.score} / 100
                      </span>
                    </div>
                  </div>

                  {/* Strengths / What You Got Right */}
                  {answerCheckResult.strengths && answerCheckResult.strengths.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-bold flex items-center gap-1 text-emerald-900">
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                        Key Points Addressed Well:
                      </span>
                      <ul className="pl-5 list-disc text-xs space-y-0.5">
                        {answerCheckResult.strengths.map((str, idx) => (
                          <li key={idx}>{str}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Missing Concepts or Errors */}
                  {answerCheckResult.missingConcepts && answerCheckResult.missingConcepts.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-bold flex items-center gap-1 text-rose-900">
                        <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
                        Missing Key Concepts / Inaccuracies:
                      </span>
                      <ul className="pl-5 list-disc text-xs space-y-0.5">
                        {answerCheckResult.missingConcepts.map((m, idx) => (
                          <li key={idx}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Ideal Key Answer Points */}
                  {answerCheckResult.idealKeyPoints && answerCheckResult.idealKeyPoints.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-white/70 border border-black/5 space-y-1">
                      <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        Ideal Key Points Expected by Interviewer:
                      </span>
                      <ul className="pl-5 list-disc text-[11px] text-slate-700 space-y-0.5">
                        {answerCheckResult.idealKeyPoints.map((pt, idx) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* AI Suggestion */}
                  {answerCheckResult.suggestion && (
                    <div className="text-xs font-semibold p-2 bg-purple-100/70 border border-purple-200 rounded-lg text-purple-900 flex items-start gap-1.5">
                      <Brain className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                      <span><strong>AI Coach Tip:</strong> {answerCheckResult.suggestion}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="text-[11px] text-slate-400">
                * Browser Speech-To-Text active for real-time transcript capture.
              </div>

              <button
                onClick={handleSaveAndNextQuestion}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-md transition-all min-h-[44px]"
              >
                <span>{currentQuestionIdx < session.questions.length - 1 ? 'Save & Next Question' : 'Finish & Generate Scorecard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Collapsible Stage Tips & JD Coaching Sidebar */}
        {isSidebarOpen && (
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            
            {/* Sidebar Header Card */}
            <div className="bg-gradient-to-br from-amber-50/90 via-purple-50/80 to-indigo-50/90 p-4 rounded-2xl border border-amber-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Lightbulb className="w-4 h-4 text-amber-600 fill-amber-400" />
                  <span>Real-Time Stage Coach & JD Tips</span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-white/60 transition-all"
                  title="Close Tips Sidebar"
                >
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Stage Strategy Card */}
              <div className="bg-white/90 p-3.5 rounded-xl border border-amber-200/60 space-y-2">
                <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-purple-600" />
                    {stageTips.title}
                  </span>
                </div>

                <div className="inline-block bg-purple-50 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-purple-200">
                  Framework: {stageTips.framework}
                </div>

                <ul className="space-y-1.5 text-xs text-slate-600">
                  {stageTips.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-snug">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 2. Target Job Description & Role Competency Card */}
              <div className="bg-white/90 p-3.5 rounded-xl border border-purple-200/60 space-y-2.5">
                <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    JD Target Alignment ({jobDescription?.title || 'Selected Role'})
                  </span>
                </div>

                {extractedJdKeywords.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target JD Key Tech Focus:</span>
                    <div className="flex flex-wrap gap-1">
                      {extractedJdKeywords.map((kw, kIdx) => (
                        <span key={kIdx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[10px] rounded-md border border-indigo-200">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Domain Best Practices:</span>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {roleBullets.map((rb, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                        <span className="text-[11px] leading-snug">{rb}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 3. Candidate Self-Checklist Before Submitting Answer */}
              <div className="bg-white/90 p-3.5 rounded-xl border border-indigo-200/60 space-y-2">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-1.5">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                    Answer Self-Check
                  </span>
                  <span className="text-[10px] text-slate-400">Before Submitting</span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                    <input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                    <span>Included quantitative metric (%, $, time saved)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                    <input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                    <span>Referenced core JD tools & frameworks</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                    <input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                    <span>Maintained structured, clear communication</span>
                  </label>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
