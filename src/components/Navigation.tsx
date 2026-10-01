import React, { useState } from 'react';
import { SwarnLogo } from './SwarnLogo';
import { MessageSquare, PlusCircle, User, Menu, X, LogOut, Send, Moon, Sun, Maximize2, Minimize2, Laptop } from 'lucide-react';
import { ArtistProfile } from '../types';

interface NavigationProps {
  currentUser: ArtistProfile | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenUpload: () => void;
  onOpenProfile: () => void;
  onOpenChatList: () => void;
  onFilterRole: (role: string) => void;
  unreadCount: number;
  onLogout: () => void;
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  themeMode?: 'system' | 'dark' | 'light';
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  incomingPop?: { senderName: string; text: string } | null;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentUser,
  onOpenAuth,
  onOpenUpload,
  onOpenProfile,
  onOpenChatList,
  onFilterRole,
  unreadCount,
  onLogout,
  activeNavTab,
  setActiveNavTab,
  isDarkMode = false,
  onToggleDarkMode,
  themeMode = 'system',
  isFullscreen = false,
  onToggleFullscreen,
  incomingPop,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string, roleFilter?: string) => {
    setActiveNavTab(tab);
    if (roleFilter) {
      onFilterRole(roleFilter);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-300 ${
        isDarkMode
          ? 'bg-[#2D1A12]/92 border-white/10 text-[#FAF5EE]'
          : 'bg-white/85 border-stone-200/80 text-stone-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* ZONE 1: Brand Wordmark (Faithfully using the logo mark) */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('all', 'all');
            }}
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A131B]"
          >
            <SwarnLogo size="sm" />
            <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#7A131B] hidden sm:inline-block">
              swarnmusic
            </span>
          </a>
        </div>

        {/* ZONE 2: 4-6 Clean Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-700">
          <button
            onClick={() => handleNavClick('all', 'all')}
            className={`transition-colors hover:text-[#7A131B] cursor-pointer ${
              activeNavTab === 'all' ? 'text-[#7A131B] font-semibold underline underline-offset-8 decoration-2 decoration-[#7A131B]' : ''
            }`}
          >
            Discover All
          </button>
          <button
            onClick={() => handleNavClick('singers', 'singer')}
            className={`transition-colors hover:text-[#7A131B] cursor-pointer ${
              activeNavTab === 'singers' ? 'text-[#7A131B] font-semibold underline underline-offset-8 decoration-2 decoration-[#7A131B]' : ''
            }`}
          >
            Singers
          </button>
          <button
            onClick={() => handleNavClick('composers', 'composer')}
            className={`transition-colors hover:text-[#7A131B] cursor-pointer ${
              activeNavTab === 'composers' ? 'text-[#7A131B] font-semibold underline underline-offset-8 decoration-2 decoration-[#7A131B]' : ''
            }`}
          >
            Composers
          </button>
          <button
            onClick={() => handleNavClick('lyricists', 'lyricist')}
            className={`transition-colors hover:text-[#7A131B] cursor-pointer ${
              activeNavTab === 'lyricists' ? 'text-[#7A131B] font-semibold underline underline-offset-8 decoration-2 decoration-[#7A131B]' : ''
            }`}
          >
            Lyricists
          </button>
          <button
            onClick={() => handleNavClick('portfolios', 'all')}
            className={`transition-colors hover:text-[#7A131B] cursor-pointer ${
              activeNavTab === 'portfolios' ? 'text-[#7A131B] font-semibold underline underline-offset-8 decoration-2 decoration-[#7A131B]' : ''
            }`}
          >
            Portfolios
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('community-experiences');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="transition-colors hover:text-[#7A131B] cursor-pointer"
          >
            Experiences
          </button>
          <a
            href="https://www.instagram.com/swarn.wav?stkn=MWpmMjR2OTVzOWdkMw=="
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#7A131B]"
          >
            Join Community
          </a>
        </nav>

        {/* ZONE 3: Separate Messaging Icon & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* THEME BUTTON - SYSTEM DEFAULT BY DEFAULT */}
          <button
            onClick={onToggleDarkMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer shadow-xs active:scale-95 group ${
              isDarkMode
                ? 'bg-[#3D251A] hover:bg-[#4D2F21] text-amber-200 border-amber-500/40'
                : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-300 hover:border-amber-800'
            }`}
            title={`Theme: ${themeMode === 'system' ? 'System Default' : isDarkMode ? 'Dark' : 'Light'} (Click to cycle)`}
            aria-label="Toggle theme mode"
          >
            {themeMode === 'system' ? (
              <Laptop size={13} className={isDarkMode ? 'text-amber-400' : 'text-stone-700'} />
            ) : isDarkMode ? (
              <Sun size={13} className="text-amber-400 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon size={13} className="text-stone-700 group-hover:text-amber-800 transition-colors" />
            )}
            <span className="text-xs font-bold tracking-tight hidden sm:inline">
              {themeMode === 'system' ? `Auto (${isDarkMode ? 'Dark' : 'Light'})` : isDarkMode ? 'Dark' : 'Light'}
            </span>
            {themeMode === 'system' ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Following system theme" />
            ) : isDarkMode ? (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            ) : null}
          </button>

          {/* FULL SCREEN TOGGLE BUTTON - FITS ANY SCREEN */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer shadow-xs active:scale-95 group ${
                isFullscreen
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : isDarkMode
                  ? 'bg-[#3D251A] hover:bg-[#4D2F21] text-stone-200 border-white/20'
                  : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-300 hover:border-stone-400'
              }`}
              title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
              aria-label="Full screen mode"
            >
              {isFullscreen ? (
                <Minimize2 size={13} className="text-amber-400" />
              ) : (
                <Maximize2 size={13} className="text-stone-700 dark:text-stone-200 group-hover:scale-110 transition-transform" />
              )}
              <span className="text-xs font-bold tracking-tight hidden md:inline">
                {isFullscreen ? 'Exit Fullscreen' : 'Full Screen'}
              </span>
            </button>
          )}

          {/* SEPARATE APPROACH BUTTON (1-TO-1 MESSAGES & CALLING) - ACCESSIBLE TO ANYONE */}
          <div className="relative">
            <button
              onClick={onOpenChatList}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer shadow-xs active:scale-95 group ${
                incomingPop
                  ? 'border-amber-400 bg-amber-400/20 text-[#7A131B] ring-2 ring-amber-400/50 animate-pulse'
                  : 'border-[#DFCFC0] hover:border-[#7A131B] bg-white hover:bg-[#FAF7F2] text-stone-800 hover:text-[#7A131B]'
              }`}
              title="Open APPROACH (1-to-1 Messages & Calling)"
              aria-label="APPROACH"
            >
              <div className="relative">
                <Send size={14} className="rotate-[-20deg] text-[#7A131B] group-hover:scale-110 transition-transform" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[#7A131B] px-1 text-[9px] font-bold text-white shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold tracking-wider font-classical hidden sm:inline">APPROACH</span>
            </button>

            {/* INCOMING MESSAGE POP NEAR APPROACH/INBOX BUTTON */}
            {incomingPop && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChatList();
                }}
                className="absolute top-11 right-0 w-60 sm:w-68 p-2.5 rounded-xl border shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 cursor-pointer text-left"
                style={{
                  backgroundColor: 'rgba(28, 16, 12, 0.96)',
                  backdropFilter: 'blur(16px)',
                  borderColor: 'rgba(245, 166, 35, 0.6)',
                  boxShadow: '0 16px 36px -6px rgba(0, 0, 0, 0.7), 0 0 16px rgba(245, 166, 35, 0.25)',
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    New message from {incomingPop.senderName}
                  </span>
                </div>
                <p className="text-[11px] text-stone-200 line-clamp-1 mt-0.5 font-sans">
                  {incomingPop.text}
                </p>
                <span className="text-[9px] text-amber-400 font-bold block mt-1">
                  Tap to open chat ➔
                </span>
              </div>
            )}
          </div>

          {currentUser ? (
            <>
              {/* Upload Piece Button */}
              <button
                onClick={onOpenUpload}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#7A131B] bg-[#F7EDEE] border border-[#EAC1C5] rounded-md hover:bg-[#F0DBDE] transition-colors cursor-pointer active:scale-95"
              >
                <PlusCircle size={15} />
                <span>Upload Work</span>
              </button>

              {/* User Avatar / Profile */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-[#E5D9C8] hover:border-[#7A131B] transition-colors cursor-pointer bg-white"
                  title="My Public Portfolio"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#E5D9C8]"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="text-xs font-medium text-stone-800 hidden lg:inline-block max-w-[100px] truncate">
                    {currentUser.name}
                  </span>
                </button>

                <button
                  onClick={onLogout}
                  className="p-2 text-stone-700 hover:text-stone-900 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="text-xs font-semibold text-stone-700 hover:text-[#7A131B] px-2.5 py-2 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#7A131B] rounded-md hover:bg-[#8C1620] shadow-sm transition-all duration-150 cursor-pointer active:scale-95"
              >
                Join as Artist
              </button>
            </>
          )}

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-700 hover:text-stone-900 cursor-pointer"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-t px-4 py-4 space-y-3 transition-colors ${
            isDarkMode ? 'border-amber-900/40 bg-[#2D1A12] text-amber-50' : 'border-[#E5D9C8] bg-white text-stone-700'
          }`}
        >
          <div className="flex flex-col gap-2 text-sm font-medium">
            {/* Mobile Dark mode button */}
            <button
              onClick={() => {
                onToggleDarkMode?.();
              }}
              className={`flex items-center justify-between py-2.5 px-3 rounded-lg border font-semibold text-xs transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-[#3D251A] text-amber-200 border-amber-500/40'
                  : 'bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-200/60'
              }`}
            >
              <span className="flex items-center gap-2">
                {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-stone-700" />}
                <span className="font-bold">Dark mode (Chocolate Brown)</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isDarkMode ? 'bg-amber-400 text-stone-900' : 'bg-stone-300 text-stone-800'}`}>
                {isDarkMode ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Separate APPROACH item in mobile menu */}
            <button
              onClick={() => {
                onOpenChatList();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between py-2 px-3 bg-[#F5EFE6] text-[#7A131B] font-bold rounded"
            >
              <span className="flex items-center gap-2">
                <Send size={15} className="rotate-[-20deg]" />
                <span className="font-classical">APPROACH (1-to-1 Messages & Calls)</span>
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] bg-[#7A131B] text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleNavClick('all', 'all')}
              className="text-left py-2 px-3 hover:bg-[#F2EAE0] rounded"
            >
              Discover All
            </button>
            <button
              onClick={() => handleNavClick('singers', 'singer')}
              className="text-left py-2 px-3 hover:bg-[#F2EAE0] rounded"
            >
              Singers
            </button>
            <button
              onClick={() => handleNavClick('composers', 'composer')}
              className="text-left py-2 px-3 hover:bg-[#F2EAE0] rounded"
            >
              Composers
            </button>
            <button
              onClick={() => handleNavClick('lyricists', 'lyricist')}
              className="text-left py-2 px-3 hover:bg-[#F2EAE0] rounded"
            >
              Lyricists
            </button>
            <button
              onClick={() => handleNavClick('portfolios', 'all')}
              className="text-left py-2 px-3 hover:bg-[#F2EAE0] rounded"
            >
              Featured Portfolios
            </button>
          </div>

          {currentUser && (
            <div className="pt-2 border-t border-[#E5D9C8] flex flex-col gap-2">
              <button
                onClick={() => {
                  onOpenUpload();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2.5 text-xs font-semibold text-white bg-[#7A131B] rounded-md"
              >
                + Upload Piece of Work
              </button>
              <button
                onClick={() => {
                  onOpenProfile();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2 text-xs font-medium text-stone-700 hover:bg-[#F2EAE0] rounded"
              >
                View My Public Portfolio
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
