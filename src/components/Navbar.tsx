import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Target,
  Mic,
  BarChart3,
  Container,
  Sparkles,
  Zap,
  LogIn,
  UserPlus,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';
import { UserSubscription, PlanType, AuthUser } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  subscription: UserSubscription;
  currentUser: AuthUser | null;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onOpenProfile: () => void;
  onSignOut: () => void;
  onOpenPricing: () => void;
  onOpenDockerGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  subscription,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onSignOut,
  onOpenPricing,
  onOpenDockerGuide,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getPlanBadge = (plan: PlanType) => {
    switch (plan) {
      case 'pro_careerist':
        return <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 shadow-xs"><Sparkles className="w-3 h-3" /> PRO Careerist</span>;
      case 'pay_per_prep':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-semibold border border-amber-300">Pay-Per-Prep</span>;
      case 'enterprise':
        return <span className="bg-blue-900 text-blue-100 text-xs px-2.5 py-1 rounded-full font-semibold">Enterprise</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium border border-slate-200">Free Explorer</span>;
    }
  };

  const navItems = [
    { id: 'builder', label: 'AI Resume Builder', icon: FileText },
    { id: 'upload', label: 'Upload Resume', icon: Upload },
    { id: 'ats', label: 'ATS & JD Gap Analyzer', icon: Target },
    { id: 'interview', label: 'AI Interviewer', icon: Mic },
    { id: 'analytics', label: 'Analytics Scorecards', icon: BarChart3 },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('builder')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-slate-900">ResuMock<span className="text-blue-600">.AI</span></span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200">SaaS Platform</span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">AI Resume Builder & Multi-Tier AI Interviewer</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Status & Controls */}
          <div className="flex items-center gap-2.5">
            {/* Docker Guide Button */}
            <button
              onClick={onOpenDockerGuide}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all"
              title="View Local Docker Environment Setup"
            >
              <Container className="w-3.5 h-3.5 text-slate-600" />
              <span>Local Docker Env</span>
            </button>

            {/* Plan Badge & Credits */}
            <button
              onClick={onOpenPricing}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs"
            >
              {getPlanBadge(subscription.plan)}
              <div className="hidden sm:flex items-center gap-1 text-slate-600 font-medium pl-1 border-l border-slate-200">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>{subscription.interviewCredits} credits</span>
              </div>
            </button>

            {/* Authentication Buttons / User Profile */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser.fullName}
                    className="w-7 h-7 rounded-full object-cover border border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate hidden sm:inline">
                    {currentUser.fullName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in space-y-1 text-xs">
                    <div className="px-4 py-2 border-b border-slate-100 space-y-0.5">
                      <p className="font-bold text-slate-900 truncate">{currentUser.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenProfile();
                      }}
                      className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between font-medium"
                    >
                      <span>View Profile & Settings</span>
                      <User className="w-3.5 h-3.5 text-blue-600" />
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenPricing();
                      }}
                      className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between font-medium"
                    >
                      <span>Manage Subscription</span>
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center justify-between font-bold"
                    >
                      <span>Sign Out</span>
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-xs flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center py-2.5 px-1 border-t border-slate-100 overflow-x-auto gap-1.5 no-scrollbar touch-pan-x">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 min-h-[40px] ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:bg-slate-100 bg-slate-50 border border-slate-200/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};

