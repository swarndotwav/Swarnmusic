import React, { useState, useMemo } from 'react';
import {
  Search,
  Star,
  MessageSquare,
  ExternalLink,
  Music,
  BookOpen,
  Mic,
  SlidersHorizontal,
  Share2,
  Check,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import { ArtistProfile, ArtistRole, MusicGenre, WorkPiece } from '../types';
import { AudioPlayer } from './AudioPlayer';

interface DiscoverySectionProps {
  artists: ArtistProfile[];
  onSelectArtist: (artist: ArtistProfile) => void;
  onOpenInvite: (artist: ArtistProfile) => void;
  selectedRoleFilter: string;
  onFilterRoleChange: (role: string) => void;
  onShareArtist?: (artist: ArtistProfile) => void;
  currentUserId?: string;
  onOpenUpload?: () => void;
}

const GENRE_LIST: MusicGenre[] = [
  'Indie Folk & Fusion',
  'Sufi & Ghazal',
  'Hindustani Classical',
  'Carnatic Classical',
  'Cinematic & Ambient',
  'Contemporary Bollywood',
  'Devotional & Spiritual',
  'Acoustic Lo-Fi',
];

export const DiscoverySection: React.FC<DiscoverySectionProps> = ({
  artists,
  onSelectArtist,
  onOpenInvite,
  selectedRoleFilter,
  onFilterRoleChange,
  onShareArtist,
  currentUserId,
  onOpenUpload,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'rating' | 'reviews' | 'name'>('featured');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShareClick = (e: React.MouseEvent, artist: ArtistProfile) => {
    e.stopPropagation();
    if (onShareArtist) {
      onShareArtist(artist);
    } else {
      const baseUrl = window.location.origin + window.location.pathname;
      const shareUrl = `${baseUrl}?portfolio=${artist.id}`;
      navigator.clipboard.writeText(shareUrl);
    }
    setCopiedId(artist.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered and sorted artists
  const filteredArtists = useMemo(() => {
    return artists
      .filter((artist) => {
        // Role match
        if (selectedRoleFilter !== 'all' && artist.role !== selectedRoleFilter) {
          return false;
        }

        // Genre match
        if (selectedGenre !== 'all') {
          const hasGenre = artist.genre.some((g) => g.toLowerCase() === selectedGenre.toLowerCase());
          const hasWorkGenre = artist.works.some((w) => w.genre.toLowerCase() === selectedGenre.toLowerCase());
          if (!hasGenre && !hasWorkGenre) return false;
        }

        // Search query match (name, stageName, bio, lyrics, work titles, musical influences)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const nameMatch =
            artist.name.toLowerCase().includes(q) ||
            (artist.stageName?.toLowerCase().includes(q) ?? false);
          const bioMatch = artist.bio.toLowerCase().includes(q);
          const influencesMatch = artist.musicalInfluences.some((inf) => inf.toLowerCase().includes(q));
          const workTitleMatch = artist.works.some((w) => w.title.toLowerCase().includes(q));
          const workDescMatch = artist.works.some((w) => w.description.toLowerCase().includes(q));
          const lyricsMatch = artist.works.some((w) => w.lyricsContent?.toLowerCase().includes(q));

          if (!nameMatch && !bioMatch && !influencesMatch && !workTitleMatch && !workDescMatch && !lyricsMatch) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'featured') {
          // Put logged in user or newly registered artist first
          const isANew = a.id === currentUserId || a.joinedDate === 'Just now';
          const isBNew = b.id === currentUserId || b.joinedDate === 'Just now';
          if (isANew && !isBNew) return -1;
          if (!isANew && isBNew) return 1;
          return b.overallRating - a.overallRating;
        }
        if (sortBy === 'rating') return b.overallRating - a.overallRating;
        if (sortBy === 'reviews') return b.totalReviews - a.totalReviews;
        return a.name.localeCompare(b.name);
      });
  }, [artists, selectedRoleFilter, selectedGenre, searchQuery, sortBy, currentUserId]);

  const getRoleLabel = (role: ArtistRole) => {
    switch (role) {
      case 'singer':
        return { en: 'Singer', desc: 'Vocalist & Melody', icon: Mic };
      case 'composer':
        return { en: 'Composer', desc: 'Music Director & Beats', icon: SlidersHorizontal };
      case 'lyricist':
        return { en: 'Lyricist', desc: 'Songwriter & Poet', icon: BookOpen };
      default:
        return { en: 'Instrumentalist', desc: 'Acoustic & Solo', icon: Music };
    }
  };

  return (
    <section id="discovery-section" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7A131B] mb-1">
            <span>Artist Directory</span>
            <span>·</span>
            <span>Explore Public Portfolios</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-stone-900 tracking-tight">
            Discover Original Talent
          </h2>
          <p className="text-sm text-stone-700 mt-1 max-w-2xl">
            Browse verified singers, composers, and lyricists. Listen to their audio works, read original lyrics, check ratings and reviews, and initiate direct collaborations.
          </p>
        </div>

        {/* Total Count */}
        <div className="text-xs text-stone-700 font-mono tabular-nums">
          Showing <span className="font-bold text-stone-900">{filteredArtists.length}</span> artists in directory
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-xl bg-[#F5EFE6] border border-[#E5D9C8] mb-8 space-y-4 shadow-xs">
        {/* Top: Search Input + Sorting */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by artist name, raga, lyrics, musical influences, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5D9C8] rounded-lg text-xs text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs shrink-0">
            <span className="text-stone-700 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-2 px-3 bg-white border border-[#E5D9C8] rounded-lg text-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#7A131B] cursor-pointer"
            >
              <option value="featured">Featured & Newest Artists</option>
              <option value="rating">Highest Rating (5★)</option>
              <option value="reviews">Most Reviews</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Bottom: Role Filter Tabs + Genre Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E5D9C8]">
          {/* Functional Segmented Role Control */}
          <div className="inline-flex p-1 bg-[#EBE3D7] rounded-lg gap-1 text-xs font-medium">
            {[
              { id: 'all', label: 'All Disciplines' },
              { id: 'singer', label: 'Singers' },
              { id: 'composer', label: 'Composers' },
              { id: 'lyricist', label: 'Lyricists' },
            ].map((roleTab) => (
              <button
                key={roleTab.id}
                onClick={() => onFilterRoleChange(roleTab.id)}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  selectedRoleFilter === roleTab.id
                    ? 'bg-white text-[#7A131B] font-semibold shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                {roleTab.label}
              </button>
            ))}
          </div>

          {/* Genre Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-700 font-medium">Genre:</span>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-white border border-[#E5D9C8] rounded-md text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#7A131B] cursor-pointer"
            >
              <option value="all">All Musical Genres</option>
              {GENRE_LIST.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Artist Grid */}
      {filteredArtists.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#F5EFE6] border border-[#E5D9C8] space-y-3">
          <Music className="w-10 h-10 text-stone-600 mx-auto" />
          <h3 className="text-base font-semibold text-stone-900">No artists found matching your criteria</h3>
          <p className="text-xs text-stone-700 max-w-sm mx-auto">
            Try adjusting your search query, selecting "All Disciplines", or clearing your genre filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGenre('all');
              onFilterRoleChange('all');
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#7A131B] rounded-md hover:bg-[#8C1620] cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtists.map((artist) => {
            const roleInfo = getRoleLabel(artist.role);
            const RoleIcon = roleInfo.icon;
            const primaryWork = artist.works[0];
            const isOwnCard = artist.id === currentUserId;
            const isNew = artist.joinedDate === 'Just now' || isOwnCard;

            return (
              <div
                key={artist.id}
                className={`group flex flex-col justify-between p-5 rounded-xl bg-[#F5EFE6] border transition-all duration-200 paper-card relative ${
                  isOwnCard
                    ? 'border-[#7A131B] ring-2 ring-[#7A131B]/20 shadow-md'
                    : 'border-[#E5D9C8] hover:border-[#7A131B]/50 hover:shadow-md'
                }`}
              >
                {/* Badges for New or User's own card */}
                {isNew && (
                  <div className="absolute -top-2.5 right-4 z-10 flex items-center gap-1.5">
                    {isOwnCard ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#7A131B] text-white rounded shadow-xs flex items-center gap-1">
                        <Sparkles size={10} />
                        Your Public Portfolio
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FAF7F2] text-[#7A131B] border border-[#7A131B]/30 rounded shadow-xs flex items-center gap-1">
                        <Sparkles size={10} />
                        New Artist
                      </span>
                    )}
                  </div>
                )}

                <div>
                  {/* Top Row: Avatar + Details */}
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <img
                      src={artist.avatar}
                      alt={artist.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-lg object-cover border border-[#E5D9C8] group-hover:border-[#7A131B] transition-colors shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-stone-900 truncate">
                          {artist.name}
                        </h3>
                        <span className="flex items-center gap-1 text-xs font-mono font-semibold text-[#7A131B] shrink-0">
                          <Star size={12} fill="#7A131B" />
                          {artist.overallRating.toFixed(1)}
                        </span>
                      </div>

                      {/* Role & Cultural Descriptor */}
                      <div className="flex items-center gap-1.5 text-xs text-[#7A131B] font-medium mt-0.5">
                        <RoleIcon size={12} />
                        <span>{roleInfo.en}</span>
                        <span className="text-stone-700 text-[11px]">({roleInfo.desc})</span>
                      </div>

                      {/* Location & Experience */}
                      <p className="text-[11px] text-stone-700 truncate mt-0.5">
                        {artist.location || 'India'} · {artist.experienceLevel}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-stone-700 line-clamp-2 leading-relaxed mb-4">
                    {artist.bio}
                  </p>

                  {/* Musical Influences unboxed metadata */}
                  {artist.musicalInfluences.length > 0 && (
                    <div className="text-[11px] text-stone-700 mb-4 truncate">
                      <span className="font-semibold text-stone-800">Influences: </span>
                      {artist.musicalInfluences.slice(0, 3).join(' · ')}
                    </div>
                  )}

                  {/* Snippet of Work */}
                  {primaryWork ? (
                    <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E5D9C8] mb-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-900 truncate pr-2">
                          {primaryWork.title}
                        </span>
                        <span className="text-[10px] text-stone-700 font-mono shrink-0">
                          {primaryWork.genre}
                        </span>
                      </div>

                      {primaryWork.type === 'audio' ? (
                        <AudioPlayer
                          title={primaryWork.title}
                          audioUrl={primaryWork.audioUrl}
                          synthPreset={primaryWork.synthPreset || 'bansuri'}
                          duration={primaryWork.duration || '2:45'}
                          compact={true}
                        />
                      ) : (
                        <div className="p-2 bg-[#F5EFE6] rounded text-[11px] text-stone-800 font-serif italic line-clamp-2 border border-[#E5D9C8]">
                          "{primaryWork.lyricsContent?.split('\n')[0]}..."
                        </div>
                      )}

                      {/* Rating info on piece */}
                      <div className="flex items-center justify-between text-[11px] text-stone-700 pt-1">
                        <span className="font-mono">
                          ★ {primaryWork.averageRating.toFixed(1)} ({primaryWork.ratingsCount} reviews)
                        </span>
                        <span className="text-[10px] text-stone-700">
                          {artist.works.length} {artist.works.length === 1 ? 'piece' : 'pieces'} uploaded
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-dashed border-[#CBB8A1] mb-4 text-center space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A131B]">
                        <Sparkles size={13} />
                        <span>Public Portfolio Live</span>
                      </div>
                      <p className="text-[11px] text-stone-700">
                        Open for invitations & project collaboration proposals
                      </p>
                      {isOwnCard && onOpenUpload && (
                        <button
                          onClick={onOpenUpload}
                          className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] px-3 py-1 rounded transition-colors cursor-pointer"
                        >
                          <PlusCircle size={11} />
                          <span>Upload First Piece</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Card Actions */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E5D9C8]">
                  <button
                    onClick={() => onSelectArtist(artist)}
                    className="py-2 px-2 text-xs font-semibold text-[#7A131B] bg-white border border-[#E5D9C8] hover:border-[#7A131B] rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1"
                    title="View public portfolio"
                  >
                    <span>Portfolio</span>
                    <ExternalLink size={11} />
                  </button>

                  <button
                    onClick={(e) => handleShareClick(e, artist)}
                    className="py-2 px-2 text-xs font-semibold text-stone-700 bg-white border border-[#E5D9C8] hover:border-stone-400 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1"
                    title="Share portfolio external link"
                  >
                    {copiedId === artist.id ? (
                      <>
                        <Check size={12} className="text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={11} />
                        <span>Share</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onOpenInvite(artist)}
                    className="py-2 px-2 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <MessageSquare size={11} />
                    <span>Approach</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
