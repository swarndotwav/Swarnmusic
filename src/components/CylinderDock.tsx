import React from 'react';
import { Home, MessageCircle, User, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { ArtistProfile } from '../types';

export type FlashCardId = 'home' | 'approach' | 'portfolio';

interface CylinderDockProps {
  activeCard: FlashCardId;
  onSelectCard: (card: FlashCardId) => void;
  currentUser: ArtistProfile | null;
  unreadCount?: number;
  onSwipeNext: () => void;
  onSwipePrev: () => void;
  currentIndex: number;
  totalCards: number;
}

export const CylinderDock: React.FC<CylinderDockProps> = ({
  activeCard,
  onSelectCard,
  currentUser,
  unreadCount = 0,
  onSwipeNext,
  onSwipePrev,
  currentIndex,
  totalCards,
}) => {
  const dockItems: { id: FlashCardId; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home size={19} className="liquid-icon" />,
    },
    {
      id: 'approach',
      label: 'Approach',
      icon: <MessageCircle size={19} className="liquid-icon" />,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: currentUser ? (
        <div className="relative">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-5 h-5 rounded-full object-cover border border-white/60 shadow-xs"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
        </div>
      ) : (
        <User size={19} className="liquid-icon" />
      ),
      badge: currentUser ? currentUser.role : undefined,
    },
  ];

  return (
    <div className="fixed bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 select-none pointer-events-auto">
      {/* Quick swipe previous button */}
      <button
        onClick={onSwipePrev}
        className="w-10 h-10 rounded-full cylinder-dock-150 flex items-center justify-center text-stone-700 dark:text-stone-200 hover:text-[#7A131B] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg hidden sm:flex"
        title="Swipe to previous flash card"
        aria-label="Previous card"
      >
        <ChevronLeft size={18} />
      </button>

      {/* 150% LIQUID GLASS CYLINDER DOCK */}
      <nav
        className="cylinder-dock-150 rounded-full px-2.5 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1.5 sm:gap-2 relative shadow-2xl"
        role="navigation"
        aria-label="Flash Card Navigation"
      >
        {dockItems.map((item) => {
          const isActive = activeCard === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectCard(item.id)}
              className={`relative px-3 sm:px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'cylinder-liquid-bubble text-white shadow-md'
                  : 'text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white hover:bg-white/20'
              }`}
              style={{
                willChange: 'transform, opacity',
                transform: 'translate3d(0, 0, 0)',
              }}
            >
              {/* Icon */}
              <span className="shrink-0">{item.icon}</span>

              {/* Label */}
              <span className="tracking-wide hidden xs:inline sm:inline">
                {item.label}
              </span>

              {/* Optional unread badge or role pill */}
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono uppercase font-bold shrink-0 ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-[#7A131B] text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick swipe next button */}
      <button
        onClick={onSwipeNext}
        className="w-10 h-10 rounded-full cylinder-dock-150 flex items-center justify-center text-stone-700 dark:text-stone-200 hover:text-[#7A131B] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg hidden sm:flex"
        title="Swipe to next flash card"
        aria-label="Next card"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};
