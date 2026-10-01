import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Star,
  MessageCircle,
  Share2,
  Calendar,
  MapPin,
  Award,
  Globe,
  Youtube,
  Instagram,
  Music,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Edit3,
  Send,
  MessageSquare,
  Sparkles,
  Briefcase,
  CheckCircle,
  Layers,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { ArtistProfile, WorkPiece, Review } from '../types';
import { AudioPlayer } from './AudioPlayer';

interface PortfolioModalProps {
  artist: ArtistProfile;
  isOpen: boolean;
  onClose: () => void;
  onOpenInvite: (artist: ArtistProfile) => void;
  onAddReview: (artistId: string, pieceId: string, rating: number, comment: string) => void;
  isCurrentUser: boolean;
  onOpenUpload?: () => void;
  onOpenEditProfile?: () => void;
  isDarkMode?: boolean;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  artist,
  isOpen,
  onClose,
  onOpenInvite,
  onAddReview,
  isCurrentUser,
  onOpenUpload,
  onOpenEditProfile,
  isDarkMode = false,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [activeTab, setActiveTab] = useState<'works' | 'extended'>('works');

  // Review submission state for the active piece
  const [userRating, setUserRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareBar, setShowShareBar] = useState(false);

  // Sync portfolio ID in query params for easy sharing and browser URL preservation
  useEffect(() => {
    if (isOpen && artist) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('portfolio', artist.id);
        window.history.replaceState({}, '', url.toString());
      } catch {}
    }
    return () => {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('portfolio');
        window.history.replaceState({}, '', url.toString());
      } catch {}
    };
  }, [isOpen, artist]);

  if (!isOpen) return null;

  const currentPiece = artist.works[currentSlideIndex] || artist.works[0];
  const shareableUrl = `${window.location.origin}${window.location.pathname}?portfolio=${artist.id}`;

  const handleNextSlide = () => {
    if (artist.works.length <= 1) return;
    setSlideDirection('next');
    const nextIdx = (currentSlideIndex + 1) % artist.works.length;
    setCurrentSlideIndex(nextIdx);
    setReviewSuccessMsg('');
  };

  const handlePrevSlide = () => {
    if (artist.works.length <= 1) return;
    setSlideDirection('prev');
    const prevIdx = (currentSlideIndex - 1 + artist.works.length) % artist.works.length;
    setCurrentSlideIndex(prevIdx);
    setReviewSuccessMsg('');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim() || !currentPiece) return;

    setIsSubmittingReview(true);
    onAddReview(artist.id, currentPiece.id, userRating, reviewComment.trim());

    setReviewComment('');
    setIsSubmittingReview(false);
    setReviewSuccessMsg('Your review and rating were published to this public portfolio!');
    setTimeout(() => setReviewSuccessMsg(''), 4000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-5xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors duration-300 ${
          isDarkMode
            ? 'bg-[#2D1A12] border-amber-900/40 text-[#FAF5EE]'
            : 'bg-[#FAF7F2] border-[#E5D9C8] text-stone-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b transition-colors ${
            isDarkMode ? 'border-white/10 bg-[#24150E] text-stone-200' : 'border-[#E5D9C8] bg-[#F5EFE6] text-stone-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7A131B]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Artist Public Portfolio · Verified Artist
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShareBar(!showShareBar)}
              className={`p-2 rounded-md transition-colors cursor-pointer text-xs flex items-center gap-1.5 ${
                showShareBar ? 'bg-[#7A131B] text-white' : 'text-stone-700 hover:text-stone-900 hover:bg-[#EBE2D5]'
              }`}
              title="Share portfolio external link"
            >
              <Share2 size={15} />
              <span className="hidden sm:inline">Share Portfolio</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-700 hover:text-stone-900 rounded-md hover:bg-[#EBE2D5] transition-colors cursor-pointer"
              aria-label="Close portfolio modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* EXPANDABLE EXTERNAL LINK SHARING SHEET */}
        {showShareBar && (
          <div className="px-6 py-3.5 bg-[#FAF3E8] border-b border-[#E5D9C8] space-y-2.5 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Share2 size={13} className="text-[#7A131B]" />
                <span>Share {artist.name}'s Public Portfolio Link</span>
              </span>
              <span className="text-[11px] text-stone-600">Anyone with this link can view this portfolio</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="flex-1 px-3 py-1.5 bg-white border border-[#E5D9C8] rounded text-xs font-mono text-stone-800 select-all focus:outline-none"
              />
              <button
                onClick={handleShare}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedLink ? 'Copied to Clipboard!' : 'Copy Link'}</span>
              </button>
            </div>

            {/* Quick social share buttons */}
            <div className="flex items-center gap-2 pt-1 text-[11px] text-stone-700">
              <span className="font-medium">Direct share:</span>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Check out ${artist.name}'s (${artist.role}) music portfolio on swarnmusic: ${shareableUrl}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded font-medium transition-colors"
              >
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Listen to ${artist.name} on swarnmusic: ${shareableUrl}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-0.5 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded font-medium transition-colors"
              >
                Twitter / X
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(
                  `${artist.name} - swarnmusic Public Portfolio`
                )}&body=${encodeURIComponent(
                  `Explore ${artist.name}'s musical works and reviews on swarnmusic:\n\n${shareableUrl}`
                )}`}
                className="px-2 py-0.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded font-medium transition-colors"
              >
                Email
              </a>
            </div>
          </div>
        )}

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Section 1: Artist Bio & Customization Card */}
          <div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-[#E5D9C8]">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={artist.avatar}
                alt={artist.name}
                referrerPolicy="no-referrer"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border-2 border-[#7A131B]/40 shadow-md"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-[#7A131B] text-white text-[10px] font-bold rounded shadow-xs uppercase tracking-wider">
                {artist.role}
              </span>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 leading-tight">
                    {artist.name}
                  </h1>
                  {artist.stageName && (
                    <p className="text-xs font-classical text-[#7A131B] font-semibold mt-0.5">
                      {artist.stageName}
                    </p>
                  )}
                </div>

                {/* Rating badge & Status */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-[#FAF7F2] px-3 py-1.5 rounded-lg border border-[#E5D9C8]">
                    <Star size={16} fill="#7A131B" textAnchor="middle" className="text-[#7A131B]" />
                    <span className="font-mono text-base font-bold text-stone-900">
                      {artist.overallRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-stone-700">({artist.totalReviews} reviews)</span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded text-[11px] font-medium border ${
                      artist.isOpenForCollaboration !== false
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    {artist.isOpenForCollaboration !== false ? '● Open to Collab' : 'Busy'}
                  </span>
                </div>
              </div>

              {/* Meta details */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-700 pt-1">
                {artist.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-[#7A131B]" />
                    <span>{artist.location}</span>
                  </span>
                )}
                {artist.experienceLevel && (
                  <span className="flex items-center gap-1">
                    <Award size={13} className="text-[#7A131B]" />
                    <span>{artist.experienceLevel}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-[#7A131B]" />
                  <span>Member since {artist.joinedDate}</span>
                </span>
              </div>

              {/* Biography */}
              <p className="text-sm text-stone-800 leading-relaxed pt-2">
                {artist.bio}
              </p>

              {/* Musical Influences */}
              {artist.musicalInfluences.length > 0 && (
                <div className="text-xs text-stone-700 pt-1">
                  <strong className="text-stone-900">Musical Influences: </strong>
                  <span>{artist.musicalInfluences.join(' · ')}</span>
                </div>
              )}

              {/* Social Media and Contact Links */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                {artist.socialLinks.spotify && (
                  <a
                    href={artist.socialLinks.spotify}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-medium"
                  >
                    <Music size={13} />
                    <span>Spotify</span>
                  </a>
                )}
                {artist.socialLinks.youtube && (
                  <a
                    href={artist.socialLinks.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-800 font-medium"
                  >
                    <Youtube size={13} />
                    <span>YouTube</span>
                  </a>
                )}
                {artist.socialLinks.instagram && (
                  <a
                    href={artist.socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-pink-700 hover:text-pink-800 font-medium"
                  >
                    <Instagram size={13} />
                    <span>Instagram</span>
                  </a>
                )}
                {artist.socialLinks.website && (
                  <a
                    href={artist.socialLinks.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-stone-700 hover:text-stone-900 font-medium"
                  >
                    <Globe size={13} />
                    <span>Website</span>
                  </a>
                )}
              </div>

              {/* Owner Profile Actions or Approach button */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                {isCurrentUser ? (
                  <>
                    <button
                      onClick={onOpenEditProfile}
                      className="px-3.5 py-1.5 text-xs font-semibold text-stone-800 bg-[#EFE8DC] hover:bg-[#E5DBCB] rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit3 size={13} />
                      <span>Customize Profile & Details</span>
                    </button>
                    {onOpenUpload && (
                      <button
                        onClick={onOpenUpload}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <PlusCircle size={13} />
                        <span>Upload New Work Piece</span>
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenInvite(artist);
                    }}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-md transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                  >
                    <MessageCircle size={15} />
                    <span>Approach in Private Chat (1-on-1)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* EXPANDED PORTFOLIO NAVIGATION TABS */}
          <div className="flex border-b border-[#E5D9C8] gap-4 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('works')}
              className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'works'
                  ? 'text-[#7A131B] border-b-2 border-[#7A131B]'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <Music size={14} />
              <span>Uploaded Work Pieces ({artist.works.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('extended')}
              className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'extended'
                  ? 'text-[#7A131B] border-b-2 border-[#7A131B]'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <Layers size={14} />
              <span>Full Portfolio & Credentials</span>
            </button>
          </div>

          {/* TAB 1: WORK PIECES ANIMATED SLIDES */}
          {activeTab === 'works' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold font-display text-stone-900">
                    Uploaded Pieces of Work
                  </h3>
                  <p className="text-xs text-stone-700">
                    Slide through this artist's original recordings, lyrical compositions, and audio takes.
                  </p>
                </div>

                {/* Slide controls */}
                {artist.works.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevSlide}
                      className="p-1.5 rounded-md bg-[#EBE2D5] hover:bg-[#DFD3C3] text-stone-700 transition-colors cursor-pointer"
                      aria-label="Previous work piece"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-mono tabular-nums text-stone-700 px-1">
                      Slide {currentSlideIndex + 1} of {artist.works.length}
                    </span>
                    <button
                      onClick={handleNextSlide}
                      className="p-1.5 rounded-md bg-[#EBE2D5] hover:bg-[#DFD3C3] text-stone-700 transition-colors cursor-pointer"
                      aria-label="Next work piece"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              {artist.works.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#F5EFE6] border border-[#E5D9C8]">
                  <p className="text-sm text-stone-700">No public pieces uploaded yet.</p>
                  {isCurrentUser && onOpenUpload && (
                    <button
                      onClick={onOpenUpload}
                      className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-[#7A131B] rounded-md hover:bg-[#8C1620]"
                    >
                      Upload Your First Piece
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative overflow-hidden">
                  <AnimatePresence mode="wait" custom={slideDirection}>
                    {currentPiece && (
                      <motion.div
                        key={currentPiece.id}
                        custom={slideDirection}
                        variants={{
                          enter: (dir: 'next' | 'prev') => ({
                            x: dir === 'next' ? 80 : -80,
                            opacity: 0,
                            scale: 0.985,
                          }),
                          center: {
                            x: 0,
                            opacity: 1,
                            scale: 1,
                            transition: {
                              x: { type: 'spring', stiffness: 380, damping: 32, mass: 0.8 },
                              opacity: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
                              scale: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
                            },
                          },
                          exit: (dir: 'next' | 'prev') => ({
                            x: dir === 'next' ? -80 : 80,
                            opacity: 0,
                            scale: 0.985,
                            transition: {
                              x: { type: 'spring', stiffness: 380, damping: 32, mass: 0.8 },
                              opacity: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
                              scale: { duration: 0.2 },
                            },
                          }),
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        style={{ willChange: 'transform, opacity' }}
                        className="p-5 sm:p-6 rounded-xl bg-[#F5EFE6] border border-[#E5D9C8] space-y-5 paper-card"
                      >
                        {/* Piece Title & Role Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5D9C8]">
                          <div>
                            <div className="flex items-center gap-2 text-xs text-[#7A131B] font-semibold uppercase tracking-wider">
                              <span>{currentPiece.roleAttributed}</span>
                              <span>·</span>
                              <span>{currentPiece.genre}</span>
                              {currentPiece.ragaOrMeter && (
                                <>
                                  <span>·</span>
                                  <span className="font-normal font-mono text-stone-700">
                                    {currentPiece.ragaOrMeter}
                                  </span>
                                </>
                              )}
                            </div>
                            <h4 className="text-xl font-bold font-display text-stone-900 mt-0.5">
                              {currentPiece.title}
                            </h4>
                          </div>

                          {/* Rating for this specific piece */}
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="flex items-center gap-1 font-mono font-bold text-[#7A131B] bg-white px-2.5 py-1 rounded border border-[#E5D9C8]">
                              <Star size={13} fill="#7A131B" />
                              {currentPiece.averageRating.toFixed(1)} / 5.0
                            </span>
                            <span className="text-stone-700">({currentPiece.ratingsCount} reviews)</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                          {currentPiece.description}
                        </p>

                        {/* Content Preview: Audio or Lyrics */}
                        {currentPiece.type === 'audio' ? (
                          <div className="space-y-2">
                            <AudioPlayer
                              title={currentPiece.title}
                              artistName={artist.name}
                              audioUrl={currentPiece.audioUrl}
                              synthPreset={currentPiece.synthPreset || 'bansuri'}
                              duration={currentPiece.duration || '2:45'}
                            />
                          </div>
                        ) : (
                          <div className="p-5 bg-[#FAF7F2] rounded-lg border border-[#E5D9C8] shadow-inner">
                            <h5 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                              Lyrical Composition & Poetry
                            </h5>
                            <div className="text-sm sm:text-base font-serif text-stone-900 whitespace-pre-line leading-loose">
                              {currentPiece.lyricsContent}
                            </div>
                          </div>
                        )}

                        {/* Rating & Review Section for this Piece */}
                        <div className="pt-4 border-t border-[#E5D9C8] space-y-4">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                              <MessageSquare size={14} className="text-[#7A131B]" />
                              <span>Public Ratings & Reviews ({currentPiece.reviews.length})</span>
                            </h5>
                            <span className="text-xs text-stone-700">
                              Community verified feedback
                            </span>
                          </div>

                          {/* Interactive Review Form */}
                          <form
                            onSubmit={handleReviewSubmit}
                            className="p-4 bg-[#FAF7F2] rounded-lg border border-[#E5D9C8] space-y-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-medium text-stone-800">
                                Rate this piece (1-5 Stars):
                              </span>

                              {/* Star Selector */}
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setUserRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 text-stone-700 hover:text-[#7A131B] transition-colors cursor-pointer"
                                    aria-label={`Rate ${star} star`}
                                  >
                                    <Star
                                      size={18}
                                      fill={(hoverRating || userRating) >= star ? '#7A131B' : 'transparent'}
                                      className={(hoverRating || userRating) >= star ? 'text-[#7A131B]' : 'text-stone-400'}
                                    />
                                  </button>
                                ))}
                                <span className="text-xs font-mono font-bold text-[#7A131B] ml-2">
                                  {userRating}.0 Stars
                                </span>
                              </div>
                            </div>

                            <div className="relative">
                              <textarea
                                rows={2}
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Write a constructive review or appreciation for this artist's work..."
                                className="w-full p-2.5 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 placeholder:text-stone-700 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                                required
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              {reviewSuccessMsg ? (
                                <span className="text-xs text-emerald-800 font-medium">
                                  ✓ {reviewSuccessMsg}
                                </span>
                              ) : (
                                <span className="text-[11px] text-stone-700">
                                  Reviews are public and help artists discover collaborators.
                                </span>
                              )}
                              <button
                                type="submit"
                                disabled={isSubmittingReview || !reviewComment.trim()}
                                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] disabled:opacity-50 rounded transition-colors cursor-pointer flex items-center gap-1.5"
                              >
                                <Send size={12} />
                                <span>Submit Review</span>
                              </button>
                            </div>
                          </form>

                          {/* Existing Reviews List */}
                          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                            {currentPiece.reviews.length === 0 ? (
                              <p className="text-xs text-stone-700 italic">
                                No reviews yet. Be the first to rate and review this piece!
                              </p>
                            ) : (
                              currentPiece.reviews.map((rev) => (
                                <div
                                  key={rev.id}
                                  className="p-3 bg-white rounded border border-[#E5D9C8] text-xs space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-stone-900">{rev.authorName}</span>
                                      <span className="text-[10px] text-stone-700 capitalize">
                                        ({rev.authorRole})
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="flex text-[#7A131B]">
                                        {Array.from({ length: rev.rating }).map((_, i) => (
                                          <Star key={i} size={11} fill="#7A131B" />
                                        ))}
                                      </div>
                                      <span className="text-[10px] text-stone-700 font-mono ml-1">
                                        {rev.createdAt}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-stone-700 leading-normal">{rev.comment}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 60FPS Hardware-Accelerated Interactive Slide Indicator Dots */}
                  {artist.works.length > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-3">
                      {artist.works.map((piece, idx) => (
                        <button
                          key={piece.id}
                          onClick={() => {
                            setSlideDirection(idx > currentSlideIndex ? 'next' : 'prev');
                            setCurrentSlideIndex(idx);
                            setReviewSuccessMsg('');
                          }}
                          className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                            idx === currentSlideIndex
                              ? 'w-8 bg-[#7A131B] shadow-xs'
                              : 'w-2 bg-stone-300 hover:bg-stone-400'
                          }`}
                          title={`Slide ${idx + 1}: ${piece.title}`}
                          aria-label={`Jump to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXTENDED PORTFOLIO CREDENTIALS & CAPABILITIES */}
          {activeTab === 'extended' && (
            <div className="p-6 rounded-xl bg-[#F5EFE6] border border-[#E5D9C8] space-y-6">
              <div>
                <h3 className="text-lg font-bold font-display text-stone-900">
                  Comprehensive Artist Credentials
                </h3>
                <p className="text-xs text-stone-700">
                  Detailed capabilities, equipment, awards, and booking information for producers and directors.
                </p>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Instruments */}
                <div className="p-4 bg-white rounded-lg border border-[#E5D9C8] space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A131B] flex items-center gap-1.5">
                    <Music size={14} />
                    <span>Instruments Mastered</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(artist.instrumentsPlayed || ['Acoustic Guitar', 'Vocals', 'Keyboard / Harmonizer']).map((inst, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-[#FAF7F2] border border-[#E5D9C8] rounded text-xs text-stone-800 font-medium">
                        {inst}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Languages */}
                <div className="p-4 bg-white rounded-lg border border-[#E5D9C8] space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A131B] flex items-center gap-1.5">
                    <Globe size={14} />
                    <span>Linguistic Proficiency</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(artist.languagesSpokenOrWritten || ['English', 'Hindi', 'Urdu']).map((lang, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-[#FAF7F2] border border-[#E5D9C8] rounded text-xs text-stone-800 font-medium">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. Studio Gear / Software */}
                <div className="p-4 bg-white rounded-lg border border-[#E5D9C8] space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A131B] flex items-center gap-1.5">
                    <Briefcase size={14} />
                    <span>Studio Gear & DAWs</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(artist.equipmentOrSoftware || ['Logic Pro X', 'Shure SM7B', 'Universal Audio Interface']).map((gear, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-[#FAF7F2] border border-[#E5D9C8] rounded text-xs text-stone-800 font-medium">
                        {gear}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. Contact & Booking */}
                <div className="p-4 bg-white rounded-lg border border-[#E5D9C8] space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A131B] flex items-center gap-1.5">
                    <CheckCircle size={14} />
                    <span>Official Booking Contact</span>
                  </h4>
                  <p className="text-xs text-stone-700">
                    Direct Contact: <strong className="text-stone-900">{artist.bookingEmailOrContact || artist.email}</strong>
                  </p>
                  <p className="text-[11px] text-stone-700">
                    Phone: <span className="font-mono">{artist.phone}</span>
                  </p>
                </div>

                {/* 5. Achievements */}
                <div className="p-4 bg-white rounded-lg border border-[#E5D9C8] space-y-2 md:col-span-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A131B] flex items-center gap-1.5">
                    <Award size={14} />
                    <span>Notable Milestones & Past Collaborations</span>
                  </h4>
                  <ul className="text-xs text-stone-800 space-y-1.5 list-disc pl-4">
                    {(artist.achievementsOrAwards || [
                      'Featured on Independent Acoustic Spotlight 2025',
                      'Over 40k organic streams on independent musical releases',
                    ]).map((ach, idx) => (
                      <li key={idx}>{ach}</li>
                    ))}
                    {(artist.collaborationsHistory || [
                      'Collaborated on diverse cross-genre fusion sessions with independent artists',
                    ]).map((collab, idx) => (
                      <li key={`collab-${idx}`}>{collab}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
