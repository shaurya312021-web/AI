import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ResumeWizard } from './components/ResumeBuilder/ResumeWizard';
import { ResumeUpload } from './components/ResumeUpload';
import { AtsAnalyzer } from './components/AtsAnalyzer';
import { InterviewSessionComponent } from './components/AiInterviewer/InterviewSession';
import { AnalyticsScorecard } from './components/AnalyticsScorecard';
import { PricingModal } from './components/PricingModal';
import { DockerGuideModal } from './components/DockerGuideModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { INITIAL_RESUME, SAMPLE_JOB_DESCRIPTION, INITIAL_SUBSCRIPTION } from './data/sampleData';
import { ResumeData, JobDescription, UserSubscription, InterviewSession, PlanType, AuthUser } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('builder');
  const [resume, setResume] = useState<ResumeData>(INITIAL_RESUME);
  const [jobDescription, setJobDescription] = useState<JobDescription>(SAMPLE_JOB_DESCRIPTION);
  const [subscription, setSubscription] = useState<UserSubscription>(INITIAL_SUBSCRIPTION);
  const [completedSession, setCompletedSession] = useState<InterviewSession | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isDockerGuideOpen, setIsDockerGuideOpen] = useState(false);

  // Check saved session on mount
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem('resumock_user');
      if (savedUserStr) {
        const parsedUser = JSON.parse(savedUserStr);
        if (parsedUser && parsedUser.id) {
          setCurrentUser(parsedUser);
          // Upgrade subscription view for signed-in user
          setSubscription({
            plan: 'pro_careerist',
            interviewCredits: 999,
            atsScansRemaining: 999,
            builderCreationsRemaining: -1,
            isSubscribed: true,
          });
        }
      }
    } catch (e) {
      console.error('Failed to restore user session:', e);
    }
  }, []);

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    // Grant pro credits upon sign-in
    setSubscription({
      plan: 'pro_careerist',
      interviewCredits: 999,
      atsScansRemaining: 999,
      builderCreationsRemaining: -1,
      isSubscribed: true,
    });
  };

  const handleSignOut = () => {
    localStorage.removeItem('resumock_user');
    localStorage.removeItem('resumock_token');
    setCurrentUser(null);
    setSubscription(INITIAL_SUBSCRIPTION);
  };

  // Resume update helper
  const handleUpdateResumeSkills = (newTechnicalSkills: string[]) => {
    setResume((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        technical: newTechnicalSkills,
      },
      updatedAt: new Date().toISOString(),
    }));
  };

  // Plan upgrade handler
  const handleSelectPlan = (plan: PlanType, creditsToAdd: number) => {
    setSubscription({
      plan,
      interviewCredits: plan === 'pro_careerist' ? 999 : creditsToAdd,
      atsScansRemaining: plan === 'pro_careerist' ? 999 : 10,
      builderCreationsRemaining: plan === 'pro_careerist' ? -1 : 5,
      isSubscribed: plan === 'pro_careerist' || plan === 'enterprise',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        subscription={subscription}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onOpenProfile={() => setIsProfileOpen(true)}
        onSignOut={handleSignOut}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenDockerGuide={() => setIsDockerGuideOpen(true)}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'builder' && (
          <ResumeWizard
            resume={resume}
            onChangeResume={setResume}
          />
        )}

        {activeTab === 'upload' && (
          <ResumeUpload
            currentResume={resume}
            onResumeParsed={(parsed) => setResume(parsed)}
            onNavigateToBuilder={() => setActiveTab('builder')}
          />
        )}

        {activeTab === 'ats' && (
          <AtsAnalyzer
            resume={resume}
            jobDescription={jobDescription}
            onChangeJobDescription={setJobDescription}
            onUpdateResumeSkills={handleUpdateResumeSkills}
            onNavigateToInterview={() => setActiveTab('interview')}
          />
        )}

        {activeTab === 'interview' && (
          <InterviewSessionComponent
            resume={resume}
            jobDescription={jobDescription}
            onFinishSession={(session) => {
              setCompletedSession(session);
              setActiveTab('analytics');
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsScorecard
            session={completedSession}
            onRetakeInterview={() => setActiveTab('interview')}
          />
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authMode}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        subscription={subscription}
        onUpdateUser={(updated) => setCurrentUser(updated)}
        onSignOut={handleSignOut}
        onOpenPricing={() => setIsPricingOpen(true)}
      />

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        subscription={subscription}
        onSelectPlan={handleSelectPlan}
      />

      <DockerGuideModal
        isOpen={isDockerGuideOpen}
        onClose={() => setIsDockerGuideOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ResuMock AI Platform © 2026 — End-to-End AI Career Prep SaaS</span>
          <div className="flex items-center gap-3 text-slate-400">
            <button onClick={() => setIsDockerGuideOpen(true)} className="hover:text-slate-600">
              Docker Env Specs
            </button>
            <span>•</span>
            <button onClick={() => setIsPricingOpen(true)} className="hover:text-slate-600">
              Pricing Tiers
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}

