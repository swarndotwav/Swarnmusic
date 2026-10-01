import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SwarnLogo } from './SwarnLogo';
import { Play, Pause, ChevronLeft, ChevronRight, Star, Sparkles, MessageCircle, ArrowRight, Instagram, PlusCircle } from 'lucide-react';
import { ArtistProfile, WorkPiece } from '../types';
import { proceduralAudio } from '../utils/audioSynth';

export const SWARN_INSTAGRAM_COMMUNITY_URL = "https://www.instagram.com/swarn.wav?stkn=MWpmMjR2OTVzOWdkMw==";

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
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [isPlayingSnippet, setIsPlayingSnippet] = useState(false);

  const hasArtists = artists.length > 0;
  const activeArtist = hasArtists ? artists[currentSlideIndex % artists.length] : undefined;
  const featuredWork: WorkPiece | undefined = activeArtist?.works[0];

  // Auto rotate slides every 7 seconds if multiple artists exist
  useEffect(() => {
    if (!hasArtists || artists.length <= 1 || isPlayingSnippet) return;
    const timer = setInterval(() => {
      setSlideDirection('next');
      setCurrentSlideIndex((prev) => (prev + 1) % artists.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [artists.length, hasArtists, isPlayingSnippet]);

  const handleNext = () => {
    if (!hasArtists) return;
    proceduralAudio.stop();
    setIsPlayingSnippet(false);
    setSlideDirection('next');
    setCurrentSlideIndex((prev) => (prev + 1) % artists.length);
  };

  const handlePrev = () => {
    if (!hasArtists) return;
    proceduralAudio.stop();
    setIsPlayingSnippet(false);
    setSlideDirection('prev');
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

  const getRoleTitle = (role?: string) => {
    switch (role) {
      case 'singer':
        return 'Singer / Vocalist';
      case 'composer':
        return 'Composer / Music Director';
      case 'lyricist':
        return 'Lyricist / Songwriter';
      default:
        return 'Musician';
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#E5D9C8]">
      {/* Decorative background blurs */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-12 left-10 w-96 h-96 bg-[#7A131B]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#E5D9C8]/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Main Typography & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Kicker */}
            <div className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-stone-700">
              <span className="w-2 h-2 rounded-full bg-[#7A131B]" />
              <span>Authentic Music Platform</span>
              <span>·</span>
              <span className="text-[#7A131B] font-semibold">100% Real Creators</span>
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
                Discover kindred creators and connect directly with other artists.
              </p>
            </div>

            {/* Roles */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-medium text-stone-700 pt-1">
              <span className="text-stone-900 font-semibold">Roles Welcomed:</span>
              <span className="text-[#7A131B]">Singers</span>
              <span>/</span>
              <span className="text-[#7A131B]">Composers</span>
              <span>/</span>
              <span className="text-[#7A131B]">Lyricists</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-6 py-3 text-sm font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-md shadow-md transition-all duration-150 cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <span>Create Your Public Portfolio</span>
                <ArrowRight size={16} />
              </button>

              <a
                href={SWARN_INSTAGRAM_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 text-sm font-semibold text-[#7A131B] bg-white border border-[#7A131B]/30 hover:bg-[#F7EDEE] rounded-md transition-colors cursor-pointer flex items-center gap-2"
              >
                <Instagram size={15} />
                <span>Join the Community</span>
              </a>

              <button
                onClick={onExploreClick}
                className="px-4 py-3 text-sm font-semibold text-stone-800 bg-[#F4EEE5] hover:bg-[#EAE0D2] border border-[#E5D9C8] rounded-md transition-colors cursor-pointer"
              >
                Discover Artists
              </button>
            </div>

            {/* Stats row */}
            <div className="pt-6 border-t border-[#E5D9C8]/80 grid grid-cols-3 gap-4 text-left">
              <div>
                <div className="text-2xl font-bold font-mono tabular-nums text-stone-900">
                  {hasArtists ? artists.length : 'Join'}
                </div>
                <div className="text-xs text-stone-700 mt-0.5">Registered Creators</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono tabular-nums text-stone-900">100%</div>
                <div className="text-xs text-stone-700 mt-0.5">Direct 1-on-1 Chat</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#7A131B]">5.0 ★</div>
                <div className="text-xs text-stone-700 mt-0.5">Community Rated</div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Real Registered Artists Slide Deck or Empty State */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              <div className="p-5 sm:p-7 rounded-xl bg-[#F5EFE6] border border-[#E5D9C8] paper-deckle transition-all">
                
                {hasArtists && activeArtist ? (
                  <>
                    {/* Header of the slide with artist identity and navigation */}
                    <div className="flex items-center justify-between pb-4 border-b border-[#E5D9C8]">
                      <div className="flex items-center gap-2">
                        <SwarnLogo size="sm" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                          Registered Community Artist
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

                    {/* 60FPS Hardware-Accelerated Animated Slide Content */}
                    <div className="relative min-h-[380px] pt-5 overflow-hidden">
                      <AnimatePresence mode="wait" custom={slideDirection}>
                        <motion.div
                          key={activeArtist.id}
                          custom={slideDirection}
                          variants={{
                            enter: (dir: 'next' | 'prev') => ({
                              x: dir === 'next' ? 65 : -65,
                              opacity: 0,
                              scale: 0.985,
                            }),
                            center: {
                              x: 0,
                              opacity: 1,
                              scale: 1,
                              transition: {
                                x: { type: 'spring', stiffness: 360, damping: 30, mass: 0.8 },
                                opacity: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
                                scale: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
                              },
                            },
                            exit: (dir: 'next' | 'prev') => ({
                              x: dir === 'next' ? -65 : 65,
                              opacity: 0,
                              scale: 0.985,
                              transition: {
                                x: { type: 'spring', stiffness: 360, damping: 30, mass: 0.8 },
                                opacity: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
                                scale: { duration: 0.2 },
                              },
                            }),
                          }}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          style={{ willChange: 'transform, opacity' }}
                          className="space-y-5"
                        >
                          {/* Top: Artist Avatar + Metadata */}
                          <div className="flex items-center gap-4">
                            <img
                              src={activeArtist.avatar}
                              alt={activeArtist.name}
                              referrerPolicy="no-referrer"
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border-2 border-[#7A131B]/30 shadow-sm"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg sm:text-xl font-bold text-stone-900 truncate">
                                  {activeArtist.name}
                                </h3>
                                {activeArtist.stageName && (
                                  <span className="text-xs font-medium text-stone-600 truncate hidden sm:inline">
                                    ({activeArtist.stageName})
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-semibold text-[#7A131B] uppercase tracking-wide">
                                {getRoleTitle(activeArtist.role)}
                              </p>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {activeArtist.genre?.slice(0, 3).map((g) => (
                                  <span
                                    key={g}
                                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#FAF7F2] border border-[#DFCFC0] text-stone-800"
                                  >
                                    {g}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Bio Snippet */}
                          <p className="text-xs sm:text-sm text-stone-700 line-clamp-2 italic leading-relaxed">
                            "{activeArtist.bio}"
                          </p>

                          {/* Featured Work Snippet Box if available */}
                          {featuredWork ? (
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
                            </div>
                          ) : (
                            <div className="p-4 rounded-lg bg-[#FAF7F2] border border-dashed border-[#DFCFC0] text-center space-y-1">
                              <span className="text-xs font-semibold text-stone-800 block">Public Portfolio Ready</span>
                              <span className="text-[11px] text-stone-600 block">Open for collaboration and direct artist invitations</span>
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
                              <span>Connect & Chat</span>
                            </button>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Indicator dots */}
                    <div className="flex items-center justify-center gap-1.5 pt-4 mt-2 border-t border-[#E5D9C8]">
                      {artists.map((artist, idx) => (
                        <button
                          key={artist.id}
                          onClick={() => {
                            proceduralAudio.stop();
                            setIsPlayingSnippet(false);
                            setSlideDirection(idx > currentSlideIndex % artists.length ? 'next' : 'prev');
                            setCurrentSlideIndex(idx);
                          }}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            idx === currentSlideIndex % artists.length
                              ? 'w-7 bg-[#7A131B] shadow-xs'
                              : 'w-2 bg-[#D9CBBA] hover:bg-stone-400'
                          }`}
                          aria-label={`Go to slide for ${artist.name}`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  /* Welcoming Card when no users have registered yet */
                  <div className="py-8 px-4 text-center space-y-5">
                    <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border-2 border-[#7A131B]/30 flex items-center justify-center mx-auto text-[#7A131B]">
                      <Sparkles size={24} />
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A131B]">
                        An Artisanal Stage For Creators
                      </span>
                      <h3 className="text-xl font-bold font-display text-stone-900">
                        Zero Fake Profiles. Real Musicians Only.
                      </h3>
                      <p className="text-xs text-stone-700 max-w-sm mx-auto leading-relaxed">
                        We removed all mock personas so that every profile on swarnmusic belongs to an authentic singer, composer, or lyricist. Be among the first to register and showcase your craft!
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={() => onOpenAuth('signup')}
                        className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-md shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <PlusCircle size={14} />
                        <span>Register Your Public Portfolio</span>
                      </button>

                      <a
                        href={SWARN_INSTAGRAM_COMMUNITY_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-stone-800 bg-white border border-[#E5D9C8] hover:bg-[#FAF7F2] rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Instagram size={14} />
                        <span>Join Community</span>
                      </a>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
