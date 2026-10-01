import React, { useState } from 'react';
import {
  User,
  Music,
  Edit3,
  PlusCircle,
  Share2,
  Check,
  Star,
  ExternalLink,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  LogOut,
  LogIn,
  UserPlus,
  HardDrive,
  Loader2,
} from 'lucide-react';
import { ArtistProfile, WorkPiece } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { exportUserDetailsToDrive } from '../services/googleDriveService';
import { googleSignIn, getAccessToken } from '../services/googleDriveAuth';

interface CurrentUserPortfolioCardProps {
  currentUser: ArtistProfile | null;
  onOpenUpload: () => void;
  onOpenEditProfile: () => void;
  onRequireAuth: (mode?: 'login' | 'signup') => void;
  onLogout: () => void;
  onSelectArtist: (artist: ArtistProfile) => void;
  isDarkMode?: boolean;
}

export const CurrentUserPortfolioCard: React.FC<CurrentUserPortfolioCardProps> = ({
  currentUser,
  onOpenUpload,
  onOpenEditProfile,
  onRequireAuth,
  onLogout,
  onSelectArtist,
  isDarkMode = false,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'works' | 'credentials'>('works');
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveSaveSuccess, setDriveSaveSuccess] = useState<string | null>(null);
  const [driveSaveError, setDriveSaveError] = useState<string | null>(null);

  const handleSaveToDrive = async () => {
    if (!currentUser) return;
    setIsSavingToDrive(true);
    setDriveSaveSuccess(null);
    setDriveSaveError(null);

    try {
      let token = await getAccessToken();
      if (!token) {
        const res = await googleSignIn();
        token = res?.accessToken || null;
      }
      if (!token) throw new Error('Google Drive access token not available. Please authorize with Google.');

      const uploaded = await exportUserDetailsToDrive(currentUser);
      setDriveSaveSuccess(`Saved to Google Drive as "${uploaded.name}"`);
      setTimeout(() => setDriveSaveSuccess(null), 6000);
    } catch (err: any) {
      console.error('Save to Drive error:', err);
      setDriveSaveError(err.message || 'Failed to save to Google Drive');
      setTimeout(() => setDriveSaveError(null), 6000);
    } finally {
      setIsSavingToDrive(false);
    }
  };

  const handleCopyLink = () => {
    if (!currentUser) return;
    const url = `${window.location.origin}${window.location.pathname}?portfolio=${currentUser.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getCategoryTitle = (role?: string) => {
    switch (role) {
      case 'singer':
        return 'Singer / Vocalist';
      case 'composer':
        return 'Composer / Music Director';
      case 'lyricist':
        return 'Lyricist / Songwriter';
      case 'instrumentalist':
        return 'Instrumentalist / Soloist';
      default:
        return 'Acoustic Musician';
    }
  };

  if (!currentUser) {
    return (
      <div className="p-6 sm:p-10 space-y-8 max-w-3xl mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-[#7A131B]/15 text-[#7A131B] mx-auto flex items-center justify-center shadow-inner">
          <User size={38} className="liquid-icon" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#7A131B]/10 text-[#7A131B] border border-[#7A131B]/20">
            <Sparkles size={13} className="liquid-icon" />
            <span>My Creator Portfolio & Dashboard</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-bold">
            Sign In to Access Your Music Portfolio
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-md mx-auto leading-relaxed">
            Your portfolio displays your name, category, profile photo, verified status, uploaded acoustic pieces, and reviews.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onRequireAuth('signup')}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-full transition-all cursor-pointer shadow-md flex items-center gap-2"
          >
            <UserPlus size={15} />
            <span>Register as an Artist</span>
          </button>
          <button
            onClick={() => onRequireAuth('login')}
            className="px-6 py-2.5 text-xs font-semibold text-stone-800 dark:text-stone-100 bg-white/60 dark:bg-white/10 hover:bg-white border border-stone-300 dark:border-white/20 rounded-full transition-all cursor-pointer flex items-center gap-2"
          >
            <LogIn size={15} />
            <span>Sign In to Account</span>
          </button>
        </div>

        {/* Demo preview note */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 text-left max-w-lg mx-auto">
          <strong className="block font-bold">Quick Tip:</strong>
          You can register in 10 seconds or sign in using any of the community profiles to manage uploads, compositions, and approaches!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. TOP HERO: Current User Details (Name, Image, Category, Bio) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-white/5 border border-[#E5D9C8] dark:border-white/10 backdrop-blur-md shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* User Image / Avatar */}
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-3 border-[#7A131B] shadow-md"
            />
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-[#7A131B] text-white text-[10px] font-bold rounded shadow-xs uppercase tracking-wider">
              {currentUser.role}
            </span>
          </div>

          {/* User Info & Category */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white truncate">
                    {currentUser.name}
                  </h3>
                  {currentUser.stageName && (
                    <span className="text-xs font-medium text-stone-500 truncate">
                      ({currentUser.stageName})
                    </span>
                  )}
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Artist" />
                </div>

                {/* Category */}
                <p className="text-xs font-bold text-[#7A131B] dark:text-amber-300 uppercase tracking-wide mt-0.5">
                  Category: {getCategoryTitle(currentUser.role)}
                </p>
              </div>

              {/* Share public portfolio link */}
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-white/10 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center sm:justify-start gap-1.5 self-center sm:self-auto shrink-0"
              >
                {copiedLink ? <Check size={13} className="text-emerald-500" /> : <Share2 size={13} />}
                <span>{copiedLink ? 'Link Copied!' : 'Share Public Link'}</span>
              </button>
            </div>

            {/* Bio */}
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-sans line-clamp-3">
              {currentUser.bio || 'Authentic creator on swarnmusic sharing melodies, verses, and acoustic takes.'}
            </p>

            {/* Genre & Meta Tags */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
              {currentUser.genre?.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-[#FAF7F2] dark:bg-white/10 border border-[#DFCFC0] dark:border-white/10 text-stone-800 dark:text-stone-200"
                >
                  {g}
                </span>
              ))}
              {currentUser.location && (
                <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 px-2 py-0.5">
                  <MapPin size={11} />
                  <span>{currentUser.location}</span>
                </span>
              )}
            </div>

            {/* Profile Action Buttons */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-3">
              <button
                onClick={onOpenEditProfile}
                className="px-4 py-2 text-xs font-semibold text-stone-800 dark:text-stone-100 bg-[#EFE8DC] dark:bg-white/15 hover:bg-[#E5DBCB] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 size={13} />
                <span>Customize Profile</span>
              </button>
              <button
                onClick={onOpenUpload}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle size={13} />
                <span>Upload New Work Piece</span>
              </button>
              <button
                onClick={() => onSelectArtist(currentUser)}
                className="px-4 py-2 text-xs font-semibold text-[#7A131B] dark:text-amber-300 bg-white dark:bg-white/10 border border-[#7A131B]/30 rounded-lg hover:bg-[#F7EDEE] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ExternalLink size={13} />
                <span>View Live Portfolio View</span>
              </button>
              <button
                onClick={handleSaveToDrive}
                disabled={isSavingToDrive}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Save and backup all personal & professional details to Google Drive"
              >
                {isSavingToDrive ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <HardDrive size={13} />
                )}
                <span>{isSavingToDrive ? 'Saving to Drive...' : 'Save Details in My Drive'}</span>
              </button>
              <button
                onClick={onLogout}
                className="px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                title="Sign out of current account"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Google Drive Save Feedback */}
            {driveSaveSuccess && (
              <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                <Check size={14} className="text-emerald-500 shrink-0" />
                <span>{driveSaveSuccess}</span>
              </div>
            )}
            {driveSaveError && (
              <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                <span>⚠️ {driveSaveError}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS: Uploaded Pieces vs Credentials */}
      <div className="flex border-b border-[#E5D9C8] dark:border-white/10 gap-4 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('works')}
          className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'works'
              ? 'text-[#7A131B] dark:text-amber-400 border-b-2 border-[#7A131B] dark:border-amber-400'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          <Music size={14} />
          <span>My Uploaded Pieces ({currentUser.works.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'credentials'
              ? 'text-[#7A131B] dark:text-amber-400 border-b-2 border-[#7A131B] dark:border-amber-400'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          <Layers size={14} />
          <span>Category Credentials & Influences</span>
        </button>
      </div>

      {/* 3. TAB 1: UPLOADED PIECES */}
      {activeTab === 'works' && (
        <div className="space-y-4">
          {currentUser.works.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-white/50 dark:bg-white/5 border border-dashed border-[#DFCFC0] dark:border-white/10 space-y-3">
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                You haven't uploaded any public pieces of work yet.
              </p>
              <button
                onClick={onOpenUpload}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-full transition-all cursor-pointer shadow-sm"
              >
                Upload Your First Work Take
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {currentUser.works.map((piece) => (
                <div
                  key={piece.id}
                  className="p-5 rounded-xl bg-white/70 dark:bg-white/5 border border-[#E5D9C8] dark:border-white/10 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-inherit">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-[#7A131B] dark:text-amber-400 font-semibold uppercase tracking-wider">
                        <span>{piece.roleAttributed}</span>
                        <span>·</span>
                        <span>{piece.genre}</span>
                        {piece.ragaOrMeter && (
                          <>
                            <span>·</span>
                            <span className="font-normal font-mono">{piece.ragaOrMeter}</span>
                          </>
                        )}
                      </div>
                      <h4 className="text-base sm:text-lg font-bold font-display text-stone-900 dark:text-white mt-0.5">
                        {piece.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="flex items-center gap-1 font-mono font-bold text-[#7A131B] dark:text-amber-300 bg-white/80 dark:bg-white/10 px-2 py-0.5 rounded border border-[#E5D9C8] dark:border-white/10">
                        <Star size={12} fill="currentColor" />
                        {piece.averageRating.toFixed(1)}
                      </span>
                      <span className="text-stone-500 text-[11px]">
                        ({piece.ratingsCount} reviews)
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    {piece.description}
                  </p>

                  {/* Audio Player or Lyrics */}
                  {piece.type === 'audio' ? (
                    <AudioPlayer
                      title={piece.title}
                      artistName={currentUser.name}
                      audioUrl={piece.audioUrl}
                      synthPreset={piece.synthPreset || 'bansuri'}
                      duration={piece.duration || '2:45'}
                    />
                  ) : (
                    <div className="p-4 rounded-lg bg-[#FAF7F2] dark:bg-white/5 border border-[#E5D9C8] dark:border-white/10 text-xs font-serif leading-relaxed italic whitespace-pre-line text-stone-800 dark:text-stone-200">
                      {piece.lyricsContent}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. TAB 2: CREDENTIALS & DETAILS */}
      {activeTab === 'credentials' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/70 dark:bg-white/5 border border-[#E5D9C8] dark:border-white/10 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A131B] dark:text-amber-300">
              Musical Influences
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(currentUser.musicalInfluences || ['Pandit Bhimsen Joshi', 'Ustad Amir Khan', 'Begum Akhtar']).map((inf, i) => (
                <span key={i} className="px-2.5 py-1 bg-stone-100 dark:bg-white/10 rounded text-xs">
                  {inf}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/70 dark:bg-white/5 border border-[#E5D9C8] dark:border-white/10 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A131B] dark:text-amber-300">
              Instruments Mastered
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(currentUser.instrumentsPlayed || ['Acoustic Guitar', 'Harmonium', 'Vocals']).map((inst, i) => (
                <span key={i} className="px-2.5 py-1 bg-stone-100 dark:bg-white/10 rounded text-xs">
                  {inst}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
