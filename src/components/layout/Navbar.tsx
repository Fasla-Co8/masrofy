import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Bell,
  Sparkles,
  LogOut,
  User,
  Shield,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  onOpenNotifications: () => void;
  onOpenAiAssistant: () => void;
  unreadNotificationsCount: number;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNotifications,
  onOpenAiAssistant,
  unreadNotificationsCount,
  activeView,
  setActiveView,
}) => {
  const { user, isDemoMode, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="sm:hidden flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            M
          </div>
          <span className="font-bold text-slate-900 dark:text-white tracking-tight">Masrof</span>
        </div>

        {isDemoMode && (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Demo Mode</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* AI Assistant Button */}
        <button
          onClick={onOpenAiAssistant}
          className="flex items-center space-x-1.5 py-1.5 px-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold shadow-xs hover:shadow-sm hover:scale-[1.02] transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">Ask Masrof</span>
        </button>

        {/* Notifications Button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {user?.displayName ? user.displayName.charAt(0) : 'U'}
            </div>
            <span className="hidden md:inline text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
              {user?.displayName || 'My Account'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 text-xs z-40 animate-fade-in">
              <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white truncate">{user?.displayName || 'Account'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setActiveView('settings');
                  setUserMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition text-left cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Account & Preferences</span>
              </button>

              <button
                onClick={() => {
                  signOut();
                  setUserMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 transition text-left cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
