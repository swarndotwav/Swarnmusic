import React, { useState } from 'react';
import { SwarnLogo } from './SwarnLogo';
import { MessageSquare, PlusCircle, User, Menu, X, LogOut, HardDrive } from 'lucide-react';
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
  onOpenGoogleDrive?: () => void;
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
  onOpenGoogleDrive,
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
    <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E5D9C8] transition-all">
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
              if (onOpenGoogleDrive) onOpenGoogleDrive();
            }}
            className="flex items-center gap-1.5 transition-colors hover:text-[#7A131B] cursor-pointer text-stone-700"
            title="Open Google Drive Studio Hub"
          >
            <HardDrive size={14} className="text-[#7A131B]" />
            <span>Google Drive</span>
          </button>
        </nav>

        {/* ZONE 3: 1-2 Primary Action Buttons */}
        <div className="flex items-center gap-3">
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

              {/* Chat Button with unread counter */}
              <button
                onClick={onOpenChatList}
                className="relative p-2 text-stone-700 hover:text-[#7A131B] hover:bg-[#F2EAE0] rounded-md transition-colors cursor-pointer"
                aria-label="Direct Messages"
              >
                <MessageSquare size={19} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#7A131B] px-1 text-[10px] font-bold text-white shadow-xs">
                    {unreadCount}
                  </span>
                )}
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
                className="text-xs font-semibold text-stone-700 hover:text-[#7A131B] px-3 py-2 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#7A131B] rounded-md hover:bg-[#8C1620] shadow-sm transition-all duration-150 cursor-pointer active:scale-95"
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
        <div className="md:hidden border-t border-[#E5D9C8] bg-[#FAF7F2] px-4 py-4 space-y-3">
          <div className="flex flex-col gap-2 text-sm font-medium text-stone-700">
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
            <button
              onClick={() => {
                if (onOpenGoogleDrive) onOpenGoogleDrive();
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 hover:bg-[#F2EAE0] rounded flex items-center gap-2 text-[#7A131B] font-medium"
            >
              <HardDrive size={14} />
              <span>Google Drive Hub</span>
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
