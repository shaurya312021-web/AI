import React, { useState } from 'react';
import {
  User,
  Mail,
  Briefcase,
  Calendar,
  Shield,
  Zap,
  LogOut,
  Edit2,
  Check,
  X,
  Camera,
  Sparkles,
  Award,
  Clock,
  FileText
} from 'lucide-react';
import { AuthUser, UserSubscription } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  subscription: UserSubscription;
  onUpdateUser: (updated: AuthUser) => void;
  onSignOut: () => void;
  onOpenPricing: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  subscription,
  onUpdateUser,
  onSignOut,
  onOpenPricing,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [role, setRole] = useState(user?.role || 'Senior Software Engineer');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  ];

  if (!isOpen || !user) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AuthUser = {
      ...user,
      fullName: fullName.trim() || user.fullName,
      role: role.trim() || 'Software Developer',
      email: email.trim() || user.email,
      avatarUrl,
    };

    localStorage.setItem('resumock_user', JSON.stringify(updated));
    onUpdateUser(updated);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden space-y-6">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">User Account Profile</h2>
              <p className="text-xs text-slate-500">Manage candidate details, preferences, and subscription status</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold p-2 rounded-xl hover:bg-slate-100 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Profile Details Header Card */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            
            <div className="relative group">
              <img
                src={avatarUrl}
                alt={user.fullName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
              />
              {isEditing && (
                <div className="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-center justify-center text-white">
                  <Camera className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-base font-bold text-slate-900">{fullName || user.fullName}</h3>
                <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                  Verified Candidate
                </span>
              </div>
              
              <p className="text-xs text-slate-600 font-medium flex items-center justify-center sm:justify-start gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>{role}</span>
              </p>

              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{email || user.email}</span>
              </p>
            </div>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : null}

          </div>

          {/* Avatar Selector in Edit Mode */}
          {isEditing && (
            <div className="space-y-2 pt-2 border-t border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-700 block">Choose Avatar Photo:</span>
              <div className="flex gap-2">
                {sampleAvatars.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt="avatar option"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-10 h-10 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                      avatarUrl === url ? 'border-blue-600 scale-105 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs bg-white p-4 rounded-2xl border border-slate-200">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Target Job Title / Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        ) : null}

        {/* Account Statistics Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Subscription Tier</span>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 capitalize">{subscription.plan.replace('_', ' ')}</span>
              <button onClick={onOpenPricing} className="text-[10px] font-bold text-blue-600 hover:underline">
                Manage
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">AI Mock Credits</span>
            <div className="flex items-center gap-1 font-bold text-slate-900">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{subscription.interviewCredits} Remaining</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-all"
          >
            <LogOut className="w-4 h-4 text-red-600" />
            <span>Sign Out Account</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
