import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Mic,
  SlidersHorizontal,
  BookOpen,
  Music,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Radio,
  Users,
} from 'lucide-react';
import { ArtistProfile, ArtistRole } from '../types';

interface ArtistSearchMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  artists: ArtistProfile[];
  onSelectArtist: (artist: ArtistProfile) => void;
  onOpenMessage: (artist: ArtistProfile) => void;
  currentUserId?: string;
  isDarkMode?: boolean;
}

export const ArtistSearchMenuModal: React.FC<ArtistSearchMenuModalProps> = ({
  isOpen,
  onClose,
  artists,
  onSelectArtist,
  onOpenMessage,
  currentUserId,
  isDarkMode = false,
}) => {
  const [query, setQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | ArtistRole | 'active' | 'inactive'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state on close (do not auto-focus input so keyboard doesn't pop up automatically)
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedRole('all');
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter artists by Stage Name, Real Name, and Role
  const filteredArtists = artists.filter((artist) => {
    const isOnline =
      artist.isOnline ??
      (artist.id === currentUserId ||
        ['artist-1', 'artist-2', 'artist-4', 'artist-5'].includes(artist.id));

    // Role / Status Filter
    if (selectedRole === 'active' && !isOnline) return false;
    if (selectedRole === 'inactive' && isOnline) return false;
    if (
      selectedRole !== 'all' &&
      selectedRole !== 'active' &&
      selectedRole !== 'inactive' &&
      artist.role !== selectedRole
    ) {
      return false;
    }

    // Text Query Search: Stage Name, Name, Role, Genres, Musical Influences
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      const nameMatch = artist.name.toLowerCase().includes(q);
      const stageNameMatch = (artist.stageName || '').toLowerCase().includes(q);
      const roleMatch = artist.role.toLowerCase().includes(q);
      const genreMatch = (artist.genre || []).some((g) => g.toLowerCase().includes(q));
      const influencesMatch = (artist.musicalInfluences || []).some((inf) =>
        inf.toLowerCase().includes(q)
      );

      if (!nameMatch && !stageNameMatch && !roleMatch && !genreMatch && !influencesMatch) {
        return false;
      }
    }

    return true;
  });

  const getRoleIcon = (role: ArtistRole) => {
    switch (role) {
      case 'singer':
        return <Mic size={12} className="text-[#7A131B]" />;
      case 'composer':
        return <SlidersHorizontal size={12} className="text-amber-600" />;
      case 'lyricist':
        return <BookOpen size={12} className="text-emerald-600" />;
      default:
        return <Music size={12} className="text-stone-600" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-14 px-4 pb-28 sm:pb-32 overflow-y-auto animate-in fade-in duration-200"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Search Artists Menu"
    >
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden transition-all duration-300 transform scale-100 ${
          isDarkMode
            ? 'bg-[#1E120D]/95 border-white/15 text-stone-100'
            : 'bg-[#FAF7F2]/95 border-[#E5D9C8] text-stone-900'
        }`}
        style={{
          backdropFilter: 'blur(28px) saturate(190%)',
          WebkitBackdropFilter: 'blur(28px) saturate(190%)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Search Header & Input */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-white/10 relative">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-[#7A131B] dark:text-amber-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by artist stage name, name, or role (e.g., Singer, Composer)..."
              className="flex-1 bg-transparent border-none text-sm sm:text-base font-medium placeholder:text-stone-400 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 px-2 py-1 rounded cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-full hover:bg-stone-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Close search (Esc)"
            >
              <X size={18} />
            </button>
          </div>

          {/* Role and Status Quick Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'singer', label: 'Singers' },
              { id: 'composer', label: 'Composers' },
              { id: 'lyricist', label: 'Lyricists' },
              { id: 'active', label: 'Active', isPill: true },
              { id: 'inactive', label: 'Inactive', isPill: true },
            ].map((chip) => {
              const isSelected = selectedRole === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setSelectedRole(chip.id as any)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#7A131B] text-white shadow-xs'
                      : 'bg-stone-200/70 dark:bg-white/10 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-white/15'
                  }`}
                >
                  {chip.id === 'active' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />}
                  {chip.id === 'inactive' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-stone-400 mr-1.5" />}
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 sm:p-4 space-y-2">
          {filteredArtists.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center mx-auto text-stone-400">
                <Search size={22} />
              </div>
              <h4 className="text-sm font-bold">No artists found matching "{query}"</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Try searching by stage name, real name, or role category like Singer, Composer, or Lyricist.
              </p>
            </div>
          ) : (
            filteredArtists.map((artist) => {
              const isOnline =
                artist.isOnline ??
                (artist.id === currentUserId ||
                  ['artist-1', 'artist-2', 'artist-4', 'artist-5'].includes(artist.id));

              return (
                <div
                  key={artist.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isDarkMode
                      ? 'bg-[#291811]/70 hover:bg-[#342017] border-white/10'
                      : 'bg-white hover:bg-[#F5EFE6] border-[#EAE0D2]'
                  }`}
                >
                  <div
                    onClick={() => {
                      onSelectArtist(artist);
                      onClose();
                    }}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    {/* Avatar with Status Ring */}
                    <div className="relative shrink-0">
                      <img
                        src={artist.avatar}
                        alt={artist.name}
                        className="w-11 h-11 rounded-full object-cover border border-white/30 shadow-xs"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#1E120D] ${
                          isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
                        }`}
                        title={isOnline ? 'Active' : 'Inactive'}
                      />
                    </div>

                    {/* Artist Details: Name, Stage Name, Role */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold truncate">
                          {artist.name}
                        </h4>

                        {/* Stage Name Badge */}
                        {artist.stageName && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold border border-amber-400/25">
                            Stage: "{artist.stageName}"
                          </span>
                        )}

                        {/* Role Badge */}
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-300 flex items-center gap-1">
                          {getRoleIcon(artist.role)}
                          <span>{artist.role}</span>
                        </span>

                        {/* Active / Inactive Status Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOnline
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25'
                              : 'bg-stone-500/15 text-stone-600 dark:text-stone-400 border border-stone-500/25'
                          }`}
                        >
                          {isOnline ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {/* Bio or Genre snippet */}
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                        {artist.genre?.join(', ') || 'Classical & Acoustic Creator'} · {artist.works?.length || 0} works uploaded
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        onOpenMessage(artist);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:text-[#7A131B] bg-stone-100 dark:bg-white/10 hover:bg-[#7A131B]/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      title="Direct Approach Message"
                    >
                      <MessageSquare size={13} />
                      <span className="hidden sm:inline">Message</span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectArtist(artist);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                      title="View Public Portfolio"
                    >
                      <span>Portfolio</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary */}
        <div className="px-5 py-3 border-t border-stone-200 dark:border-white/10 bg-stone-100/50 dark:bg-white/5 flex items-center justify-between text-xs text-stone-500">
          <span>
            Found <strong className="text-stone-900 dark:text-white font-mono">{filteredArtists.length}</strong> matching creators
          </span>
          <span className="text-[11px] text-stone-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-white/10 font-mono text-[10px]">Esc</kbd> to exit
          </span>
        </div>
      </div>
    </div>
  );
};
