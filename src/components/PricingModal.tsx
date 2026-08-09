import React from 'react';
import { Check, Sparkles, Zap, ShieldCheck, Building2, CreditCard } from 'lucide-react';
import { UserSubscription, PlanType } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onSelectPlan: (plan: PlanType, creditsToAdd: number) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onSelectPlan,
}) => {
  if (!isOpen) return null;

  const plans: {
    id: PlanType;
    name: string;
    target: string;
    price: string;
    badge?: string;
    popular?: boolean;
    credits: number;
    features: string[];
  }[] = [
    {
      id: 'free_explorer',
      name: 'Free Explorer',
      target: 'Casual job seekers & Trial users',
      price: '$0',
      credits: 1,
      features: [
        '1 Resume Upload or Basic Builder Template',
        '1 ATS Match report',
        '1 Mock Interview session (Tier 1 Basic questions only)',
        'Basic layout controls'
      ],
    },
    {
      id: 'pro_careerist',
      name: 'Pro Careerist',
      target: 'Active job hunters & professionals',
      price: '$24 / month',
      badge: 'Most Popular',
      popular: true,
      credits: 999,
      features: [
        'Unlimited Resume Builder across all 4 templates',
        'Unlimited ATS & JD Gap scans',
        'Unlimited AI Mock Interviews (All 4 Tiers)',
        'Voice interaction (STT / TTS)',
        'Advanced Analytics Scorecards & Proctoring Reports'
      ],
    },
    {
      id: 'pay_per_prep',
      name: 'Pay-Per-Prep',
      target: 'Intermittent users (No subscription)',
      price: '$12 / one-time',
      credits: 3,
      features: [
        '3 Full Mock Interview credits (Never expire)',
        'Full access to all difficulty tiers',
        'Proctoring Guard logs & Analytics reports',
        'PDF export downloads'
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise / Campus',
      target: 'Universities & Bootcamps',
      price: 'Custom (B2B)',
      credits: 10000,
      features: [
        'Bulk student seat management',
        'Custom white-label portal',
        'Advanced administrator dashboard & aggregate analytics',
        'Dedicated SLA & custom prompt tuning'
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900">Subscription Model & Monetization</h2>
            </div>
            <p className="text-xs text-slate-500">Flexible freemium and usage-tiered plans tailored to job hunters & enterprise campuses.</p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold p-2 rounded-xl hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Current Plan Bar */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Current Active Plan:</span>
            <span className="font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full uppercase text-[10px]">
              {subscription.plan.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-700 font-semibold">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{subscription.interviewCredits} Interview Credits Remaining</span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => {
            const isCurrent = subscription.plan === p.id;
            return (
              <div
                key={p.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all relative ${
                  p.popular
                    ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                    {p.badge}
                  </span>
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{p.target}</p>
                  </div>

                  <div className="text-xl font-black text-slate-900">{p.price}</div>

                  <ul className="space-y-2 text-xs pt-2 border-t border-slate-100">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-700 leading-snug">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-[11px]">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      onSelectPlan(p.id, p.credits);
                      onClose();
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      isCurrent
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : p.popular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isCurrent ? 'Active Plan' : `Upgrade to ${p.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
