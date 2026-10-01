import React, { useRef, useEffect, useState } from 'react';
import { ArtistProfile } from '../types';

export type MainNavTab = 'home' | 'search' | 'inbox' | 'profile';

export interface IncomingMessageNotification {
  senderId?: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp?: string;
}

interface FloatingPillNavigationProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  currentUser: ArtistProfile | null;
  unreadCount?: number;
  isVisible?: boolean;
  incomingPop?: IncomingMessageNotification | null;
  onOpenIncomingPop?: (senderId?: string) => void;
  onDismissIncomingPop?: () => void;
}

export const FloatingPillNavigation: React.FC<FloatingPillNavigationProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  unreadCount = 0,
  isVisible = true,
  incomingPop = null,
  onOpenIncomingPop,
  onDismissIncomingPop,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const capsuleRef = useRef<HTMLDivElement>(null);
  const prevTabRef = useRef<MainNavTab>(activeTab);
  const [isStretching, setIsStretching] = useState<'left' | 'right' | null>(null);

  const tabs: { id: MainNavTab; label: string; icon: React.ReactNode; badge?: boolean }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <svg
          className="w-5 h-5 stroke-current fill-none stroke-[2] stroke-linecap-round stroke-linejoin-round"
          viewBox="0 0 24 24"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: 'search',
      label: 'Search',
      icon: (
        <svg
          className="w-5 h-5 stroke-current fill-none stroke-[2] stroke-linecap-round stroke-linejoin-round"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      id: 'inbox',
      label: 'Inbox',
      icon: (
        <svg
          className="w-5 h-5 stroke-current fill-none stroke-[2] stroke-linecap-round stroke-linejoin-round"
          viewBox="0 0 24 24"
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      badge: unreadCount > 0,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: currentUser?.avatar ? (
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-5 h-5 rounded-full object-cover border border-white/60 shadow-xs"
        />
      ) : (
        <svg
          className="w-5 h-5 stroke-current fill-none stroke-[2] stroke-linecap-round stroke-linejoin-round"
          viewBox="0 0 24 24"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  // Re-calculate active capsule bounds on active tab change
  useEffect(() => {
    if (!containerRef.current || !capsuleRef.current) return;

    const tabOrder: MainNavTab[] = ['home', 'search', 'inbox', 'profile'];
    const prevIndex = tabOrder.indexOf(prevTabRef.current);
    const nextIndex = tabOrder.indexOf(activeTab);

    const activeBtn = containerRef.current.querySelector<HTMLButtonElement>(
      `[data-tab-id="${activeTab}"]`
    );

    if (activeBtn) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();

      const targetLeft = btnRect.left - containerRect.left;
      const targetWidth = btnRect.width;

      // Apply viscous fluid stretch during transit
      if (prevIndex !== -1 && prevIndex !== nextIndex) {
        setIsStretching(nextIndex > prevIndex ? 'right' : 'left');
        setTimeout(() => setIsStretching(null), 240);
      }

      capsuleRef.current.style.left = `${targetLeft}px`;
      capsuleRef.current.style.width = `${targetWidth}px`;
    }

    prevTabRef.current = activeTab;
  }, [activeTab]);

  return (
    <aside
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] select-none transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-24 opacity-0 pointer-events-none'
      }`}
      role="region"
      aria-label="Floating Navigation Dock"
    >
      {/* SVG Optical Magnifying Lens Distortion Filter */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="liquid-glass-magnify" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* INCOMING MESSAGE POP NEAR INBOX */}
      {incomingPop && (
        <div
          className="absolute -top-26 sm:-top-28 left-1/2 -translate-x-1/2 w-72 sm:w-84 p-3 rounded-2xl border shadow-2xl z-50 animate-in zoom-in-95 slide-in-from-bottom-3 duration-200 cursor-pointer group"
          style={{
            backgroundColor: 'rgba(28, 16, 12, 0.95)',
            backdropFilter: 'blur(20px) saturate(180%)',
            borderColor: 'rgba(245, 166, 35, 0.55)',
            boxShadow:
              '0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 25px rgba(245, 166, 35, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
          }}
          onClick={() => onOpenIncomingPop?.(incomingPop.senderId)}
          role="alert"
          aria-live="assertive"
        >
          {/* Arrow pointing directly to Inbox button (3rd tab) */}
          <div
            className="absolute -bottom-2 right-20 sm:right-24 w-4 h-4 rotate-45 border-r border-b border-amber-400/50"
            style={{ backgroundColor: 'rgba(28, 16, 12, 0.98)' }}
          />

          <div className="flex items-start gap-2.5">
            <div className="relative shrink-0">
              <img
                src={
                  incomingPop.senderAvatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                }
                alt={incomingPop.senderName}
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#1C100C] rounded-full animate-ping" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#1C100C] rounded-full" />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/15 px-1.5 py-0.2 rounded border border-amber-400/30">
                  New Message
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  {incomingPop.timestamp || 'Just now'}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white truncate mt-1">
                {incomingPop.senderName}
              </h4>
              <p className="text-[11px] text-stone-300 line-clamp-1 mt-0.5 font-sans">
                {incomingPop.text}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-amber-300 font-semibold mt-1.5 group-hover:underline">
                <span>Tap to open inbox & reply</span>
                <span>➔</span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismissIncomingPop?.();
              }}
              className="text-stone-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Dismiss notification"
              aria-label="Dismiss notification"
            >
              <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating Switch Bar with Optical Magnification & 70% Liquid Glass Transparency */}
      <nav
        ref={containerRef}
        aria-label="Floating Pill Navigation"
        className="relative flex items-center p-1.5 rounded-full border shadow-2xl transition-all overflow-hidden"
        style={{
          backgroundColor: 'rgba(18, 18, 20, 0.30)', // 70% transparent
          backdropFilter: 'blur(8px) saturate(160%) contrast(108%) brightness(106%)',
          WebkitBackdropFilter: 'blur(8px) saturate(160%) contrast(108%) brightness(106%)',
          borderColor: 'rgba(255, 255, 255, 0.20)',
          boxShadow:
            '0 18px 40px -8px rgba(0, 0, 0, 0.45), 0 6px 14px -2px rgba(0, 0, 0, 0.25), inset 0 1.5px 2px rgba(255, 255, 255, 0.30), inset 0 -1.5px 2px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* OPTICAL CONVEX MAGNIFYING LENS REFRACTION LAYER (70% Transparent) */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(ellipse 120% 85% at 50% 35%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(0, 0, 0, 0.08) 100%)',
            boxShadow:
              'inset 0 1px 1.5px rgba(255, 255, 255, 0.30), inset 0 -1px 2px rgba(0, 0, 0, 0.20)',
            transform: 'scale(1.02)',
          }}
        />

        {/* SUSPENDED WATER BUBBLES IN LIQUID GLASS */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full z-0">
          <span
            className="water-bubble"
            style={{
              width: '7px',
              height: '7px',
              left: '12%',
              bottom: '9px',
              animation: 'bubble-drift-1 4.2s infinite ease-in-out',
            }}
          />
          <span
            className="water-bubble"
            style={{
              width: '4.5px',
              height: '4.5px',
              left: '28%',
              bottom: '12px',
              animation: 'bubble-drift-2 3.8s infinite ease-in-out 0.7s',
            }}
          />
          <span
            className="water-bubble"
            style={{
              width: '8.5px',
              height: '8.5px',
              left: '46%',
              bottom: '7px',
              animation: 'bubble-drift-3 5.0s infinite ease-in-out 1.2s',
            }}
          />
          <span
            className="water-bubble"
            style={{
              width: '5px',
              height: '5px',
              left: '64%',
              bottom: '11px',
              animation: 'bubble-drift-1 4.0s infinite ease-in-out 2.1s',
            }}
          />
          <span
            className="water-bubble"
            style={{
              width: '8px',
              height: '8px',
              left: '79%',
              bottom: '8px',
              animation: 'bubble-drift-2 4.6s infinite ease-in-out 0.4s',
            }}
          />
          <span
            className="water-bubble"
            style={{
              width: '4px',
              height: '4px',
              left: '90%',
              bottom: '14px',
              animation: 'bubble-drift-3 3.9s infinite ease-in-out 1.6s',
            }}
          />
          {/* Micro-shimmer water droplets */}
          <span
            className="water-bubble"
            style={{
              width: '3.5px',
              height: '3.5px',
              left: '37%',
              top: '9px',
              animation: 'bubble-shimmer 3.0s infinite ease-in-out 0.3s',
            }}
          />
          <span
            className="water-bubble"
            style={{
              width: '3px',
              height: '3px',
              left: '72%',
              top: '8px',
              animation: 'bubble-shimmer 3.4s infinite ease-in-out 1.1s',
            }}
          />
        </div>

        {/* Active Liquid Elevated Capsule with Top-Down Specular Gradient */}
        <div
          ref={capsuleRef}
          className={`absolute top-1.5 bottom-1.5 left-0 rounded-full pointer-events-none z-0 transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] ${
            isStretching === 'right'
              ? 'scale-x-115 scale-y-90'
              : isStretching === 'left'
              ? 'scale-x-115 scale-y-90'
              : 'scale-100'
          }`}
          style={{
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.08) 45%, rgba(255, 255, 255, 0.02) 100%), linear-gradient(135deg, rgba(122, 19, 27, 0.90) 0%, rgba(158, 27, 37, 0.96) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.36)',
            boxShadow:
              '0 8px 20px -3px rgba(122, 19, 27, 0.60), 0 2px 6px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.75), inset 0 -1px 2px rgba(0, 0, 0, 0.3)',
            willChange: 'transform, left, width',
          }}
        >
          {/* Top-down Specular Reflection highlight */}
          <div
            className="absolute top-0.5 left-3 right-3 h-2.5 rounded-full pointer-events-none opacity-80"
            style={{
              background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0) 100%)',
            }}
          />
        </div>

        {/* The 4 Tabs (Icons Only, Expanded Touch Targets) */}
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isInbox = tab.id === 'inbox';
          const hasIncomingPop = isInbox && Boolean(incomingPop);

          return (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative z-10 flex items-center justify-center py-2.5 px-5 sm:px-6 rounded-full transition-all duration-200 cursor-pointer ${
                isActive ? 'text-white' : 'text-white/60 hover:text-white'
              } ${hasIncomingPop ? 'animate-bounce' : ''}`}
              style={{
                WebkitTapHighlightColor: 'transparent',
              }}
              title={tab.label}
              aria-label={tab.label}
            >
              {/* Icon Container with Muted -> 100% Transition */}
              <span
                className={`flex items-center justify-center shrink-0 transition-all duration-200 ${
                  isActive
                    ? 'opacity-100 scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]'
                    : 'opacity-65 hover:opacity-95 scale-95'
                }`}
              >
                {tab.icon}
              </span>

              {/* Unread Badge / Pulsing Pop Ring */}
              {(tab.badge || hasIncomingPop) && !isActive && (
                <span
                  className={`absolute top-2.5 right-4 rounded-full transition-all ${
                    hasIncomingPop
                      ? 'w-2.5 h-2.5 bg-amber-400 shadow-[0_0_12px_#F5A623] animate-ping'
                      : 'w-2 h-2 bg-amber-400 shadow-[0_0_8px_#F5A623]'
                  }`}
                />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
