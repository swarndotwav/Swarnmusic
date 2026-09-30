import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SwarnLogo } from './SwarnLogo';
import { Play, Pause, ChevronLeft, ChevronRight, Star, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { ArtistProfile, WorkPiece } from '../types';
import { proceduralAudio } from '../utils/audioSynth';

interface HeroSectionProps {
  artists: ArtistProfile[];
  onSelectArtist: (artist: ArtistProfile) => void;
  onOpenInvite: (artist: ArtistProfile) => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  artists,
  onSelectArtist,
  onOpenInvite,
  onOpenAuth,
  onExploreClick,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlayingSnippet, setIsPlayingSnippet] = useState(false);

  const activeArtist = artists[currentSlideIndex % artists.length];
  const featuredWork: WorkPiece | undefined = activeArtist?.works[0];

  // Auto rotate slides every 8 seconds unless user is playing audio
  useEffect(() => {
    if (isPlayingSnippet) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % artists.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [artists.length, isPlayingSnippet]);

  const handleNext = () => {
    proceduralAudio.stop();
    setIsPlayingSnippet(false);
    setCurrentSlideIndex((prev) => (prev + 1) % artists.length);
  };

  const handlePrev = () => {
    proceduralAudio.stop();
    setIsPlayingSnippet(false);
    setCurrentSlideIndex((prev) => (prev - 1 + artists.length) % artists.length);
  };

  const toggleSnippetAudio = () => {
    if (isPlayingSnippet) {
      proceduralAudio.stop();
      setIsPlayingSnippet(false);
    } else {
      proceduralAudio.playPreset(featuredWork?.synthPreset || 'bansuri', () => {
        setIsPlayingSnippet(false);
      });
      setIsPlayingSnippet(true);
    }
  };

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'singer':
        return 'Singer / Vocalist';
      case 'composer':
        return 'Composer / Music Director';
      case 'lyricist':
        return 'Lyricist / Songwriter';
      default:
        return 'Instrumentalist';
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#E5D9C8]">
      {/* Decorative textured background elements */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-12 left-10 w-96 h-96 bg-[#7A131B]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#E5D9C8]/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Grand Typographic Impact */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Curated Kicker */}
            <div className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-stone-700">
              <span className="w-2 h-2 rounded-full bg-[#7A131B]" />
              <span>Dedicated Platform for Music Creators</span>
              <span>·</span>
              <span className="font-classical text-[#7A131B] font-semibold">Artist Showcase</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-stone-900 tracking-tight leading-[1.12] text-balance">
                Where soulful melodies meet their{' '}
                <span className="text-[#7A131B] underline decoration-[#7A131B]/30 underline-offset-8">
                  composers & lyricists
                </span>.
              </h1>
              <p className="text-base sm:text-lg text-stone-700 font-normal leading-relaxed max-w-xl">
                Showcase your original vocal recordings, composed melodies, and poetic lyrics in an artisanal public portfolio.
                Discover kindred creators and collaborate through private, dedicated artist rooms.
              </p>
            </div>

            {/* Domain Roles Line (Clean typography, zero pill) */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-medium text-stone-700 pt-1">
              <span className="text-stone-900 font-semibold">Roles Welcomed:</span>
              <span className="text-[#7A131B]">Singers</span>
              <span>/</span>
              <span className="text-[#7A131B]">Composers</span>
              <span>/</span>
              <span className="text-[#7A131B]">Lyricists</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-6 py-3 text-sm font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-md shadow-md transition-all duration-150 cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <span>Create Your Public Portfolio</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={onExploreClick}
                className="px-5 py-3 text-sm font-semibold text-stone-800 bg-[#F4EEE5] hover:bg-[#EAE0D2] border border-[#E5D9C8] rounded-md transition-colors cursor-pointer"
              >
                Discover Artists & Works
              </button>
            </div>

            {/* Quantitative Proof Adjacency */}
            <div className="pt-6 border-t border-[#E5D9C8]/80 grid grid-cols-3 gap-4 text-left">
              <div>
                <div className="text-2xl font-bold font-mono tabular-nums text-stone-900">450+</div>
                <div className="text-xs text-stone-700 mt-0.5">Original Works</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono tabular-nums text-stone-900">100%</div>
                <div className="text-xs text-stone-700 mt-0.5">Direct 1-on-1 Chat</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#7A131B]">4.9 ★</div>
                <div className="text-xs text-stone-700 mt-0.5">Community Rated</div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Animated Artist Slide Showcase Deck */}
          <div className="lg:col-span-6 relative">
            
            {/* Visual Deck Frame */}
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Paper Deckle Backing Card */}
              <div className="p-5 sm:p-7 rounded-xl bg-[#F5EFE6] border border-[#E5D9C8] paper-deckle transition-all">
                
                {/* Header of the slide with artist identity and navigation */}
                <div className="flex items-center justify-between pb-4 border-b border-[#E5D9C8]">
                  <div className="flex items-center gap-2">
                    <SwarnLogo size="sm" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                      Featured Artist Slide
                    </span>
                  </div>

                  {/* Slide controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePrev}
                      className="p-1.5 rounded-md hover:bg-[#E8DDCF] text-stone-700 transition-colors cursor-pointer"
                      aria-label="Previous artist slide"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-xs font-mono text-stone-700 tabular-nums px-1">
                      {currentSlideIndex + 1}/{artists.length}
                    </span>
                    <button
                      onClick={handleNext}
                      className="p-1.5 rounded-md hover:bg-[#E8DDCF] text-stone-700 transition-colors cursor-pointer"
                      aria-label="Next artist slide"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Animated Slide Content (motion.div) */}
                <div className="relative min-h-[380px] pt-5">
                  <AnimatePresence mode="wait">
                    {activeArtist && (
                      <motion.div
                        key={activeArtist.id}
                        initial={{ opacity: 0, x: 24, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -24, scale: 0.98 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-5"
                      >
                        {/* Top: Artist Avatar + Metadata */}
                        <div className="flex items-center gap-4">
                          <img
                            src={activeArtist.avatar}
                            alt={activeArtist.name}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border-2 border-[#7A131B]/30 shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-bold text-stone-900 truncate">
                                {activeArtist.name}
                              </h3>
                              <span className="text-xs font-mono text-[#7A131B] font-semibold flex items-center gap-0.5">
                                <Star size={12} fill="#7A131B" />
                                {activeArtist.overallRating.toFixed(1)}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-[#7A131B] mt-0.5">
                              {getRoleTitle(activeArtist.role)}
                            </p>
                            <p className="text-xs text-stone-700 truncate mt-1">
                              {activeArtist.location} · {activeArtist.experienceLevel}
                            </p>
                          </div>
                        </div>

                        {/* Bio snippet */}
                        <p className="text-xs sm:text-sm text-stone-700 line-clamp-2 italic leading-relaxed">
                          "{activeArtist.bio}"
                        </p>

                        {/* Featured Work Snippet Box */}
                        {featuredWork && (
                          <div className="p-4 rounded-lg bg-[#EFE7DC] border border-[#DFCFC0] space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="min-w-0">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-700 block">
                                  Work Sample · {featuredWork.genre}
                                </span>
                                <h4 className="text-sm font-bold text-stone-900 truncate">
                                  {featuredWork.title}
                                </h4>
                              </div>
                              <span className="text-xs font-mono text-stone-700">
                                {featuredWork.ragaOrMeter || featuredWork.duration}
                              </span>
                            </div>

                            {/* Playable or readable work snippet */}
                            {featuredWork.type === 'audio' ? (
                              <div className="flex items-center gap-3 bg-[#FAF7F2] p-2.5 rounded-md border border-[#DFCFC0]">
                                <button
                                  onClick={toggleSnippetAudio}
                                  className="w-8 h-8 rounded-full bg-[#7A131B] text-white flex items-center justify-center hover:bg-[#8C1620] cursor-pointer shrink-0 transition-transform active:scale-95 shadow-xs"
                                  aria-label={isPlayingSnippet ? 'Pause audio' : 'Play audio snippet'}
                                >
                                  {isPlayingSnippet ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium text-stone-800 truncate">
                                    {isPlayingSnippet ? 'Acoustic Soundscape Playing...' : 'Click to preview musical piece'}
                                  </div>
                                  <div className="text-[10px] text-stone-700">
                                    Procedural Melodic Sample · {featuredWork.synthPreset || 'bansuri'}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-[#FAF7F2] p-3 rounded-md border border-[#DFCFC0] text-xs text-stone-800 font-serif leading-relaxed line-clamp-3 whitespace-pre-line italic">
                                {featuredWork.lyricsContent}
                              </div>
                            )}

                            {/* Rating and review indicator */}
                            <div className="flex items-center justify-between text-xs text-stone-700 pt-1">
                              <span className="flex items-center gap-1 font-mono">
                                <Star size={13} fill="#7A131B" textAnchor="middle" className="text-[#7A131B]" />
                                <strong>{featuredWork.averageRating.toFixed(1)}</strong>
                                <span>({featuredWork.ratingsCount} reviews)</span>
                              </span>
                              <span className="text-[11px] text-stone-700">
                                Latest review: "{featuredWork.reviews[0]?.comment.slice(0, 35)}..."
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons for this artist */}
                        <div className="flex items-center gap-3 pt-2">
                          <button
                            onClick={() => onSelectArtist(activeArtist)}
                            className="flex-1 py-2.5 px-4 text-xs font-semibold text-[#7A131B] bg-white border border-[#7A131B]/40 hover:bg-[#7A131B] hover:text-white rounded-md transition-all cursor-pointer text-center"
                          >
                            Explore Public Portfolio
                          </button>
                          <button
                            onClick={() => onOpenInvite(activeArtist)}
                            className="py-2.5 px-4 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                          >
                            <MessageCircle size={14} />
                            <span>Invite & Chat</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Slide indicator dots */}
                <div className="flex items-center justify-center gap-1.5 pt-4 mt-2 border-t border-[#E5D9C8]">
                  {artists.map((artist, idx) => (
                    <button
                      key={artist.id}
                      onClick={() => {
                        proceduralAudio.stop();
                        setIsPlayingSnippet(false);
                        setCurrentSlideIndex(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === currentSlideIndex % artists.length
                          ? 'w-6 bg-[#7A131B]'
                          : 'w-2 bg-[#D9CBBA] hover:bg-stone-400'
                      }`}
                      aria-label={`Go to slide for ${artist.name}`}
                    />
                  ))}
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
