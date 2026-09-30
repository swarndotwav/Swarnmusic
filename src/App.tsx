import React, { useState, useEffect } from 'react';
import { INITIAL_ARTISTS } from './data/mockArtists';
import { ArtistProfile, WorkPiece, Conversation, ChatMessage, Review, ArtistRole } from './types';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { DiscoverySection } from './components/DiscoverySection';
import { PortfolioModal } from './components/PortfolioModal';
import { UploadPieceModal } from './components/UploadPieceModal';
import { AuthModal } from './components/AuthModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { ChatBox } from './components/ChatBox';
import { HelpDeskModal } from './components/HelpDeskModal';
import { GoogleDriveHubModal } from './components/GoogleDriveHubModal';
import { SwarnLogo } from './components/SwarnLogo';
import { Sparkles, MessageSquare, Music, Shield, ArrowUpRight, Heart, Share2, Check } from 'lucide-react';

const STORAGE_KEY_ARTISTS = 'swarn_artists_v4';
const STORAGE_KEY_USER = 'swarn_current_user_v4';
const STORAGE_KEY_CONVOS = 'swarn_conversations_v4';

export default function App() {
  // 1. Persistent Artists State (Merged with mock artists so new registered users appear immediately on Discover)
  const [artists, setArtists] = useState<ArtistProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ARTISTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge to guarantee all default mock artists remain plus all user additions
          const ids = new Set(parsed.map((a: ArtistProfile) => a.id));
          const missingMocks = INITIAL_ARTISTS.filter((mock) => !ids.has(mock.id));
          return [...parsed, ...missingMocks];
        }
      }
    } catch {}
    return INITIAL_ARTISTS;
  });

  // 2. Persistent Current User State
  const [currentUser, setCurrentUser] = useState<ArtistProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // 3. Persistent 1-on-1 Conversations State
  const [conversations, setConversations] = useState<Record<string, Conversation>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONVOS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      'artist-1': {
        artistId: 'artist-1',
        artistName: 'Aarav Sharma',
        artistRole: 'singer',
        artistAvatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        lastMessage: 'Hello! Welcome to swarnmusic. Would love to collaborate on acoustic melodies.',
        lastTimestamp: 'Yesterday',
        unreadCount: 1,
        messages: [
          {
            id: 'init-msg-1',
            senderId: 'artist-1',
            senderName: 'Aarav Sharma',
            receiverId: 'user-guest',
            text: 'Hello! Welcome to swarnmusic. Feel free to browse through my vocal takes and message me anytime for projects.',
            timestamp: 'Yesterday, 6:40 PM',
          },
        ],
      },
    };
  });

  // Navigation and Filtering State
  const [activeNavTab, setActiveNavTab] = useState<string>('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  // Modal Visibility States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
  const [selectedArtistForPortfolio, setSelectedArtistForPortfolio] = useState<ArtistProfile | null>(null);
  const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
  const [activeChatTarget, setActiveChatTarget] = useState<ArtistProfile | null>(null);
  const [isGoogleDriveOpen, setIsGoogleDriveOpen] = useState(false);

  // Link copy toast feedback
  const [copyFeedback, setCopyFeedback] = useState('');

  // Handle external link sharing query param on load: ?portfolio=ARTIST_ID
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const portfolioId = params.get('portfolio');
      if (portfolioId) {
        const found = artists.find((a) => a.id === portfolioId);
        if (found) {
          setSelectedArtistForPortfolio(found);
        }
      }
    } catch {}
  }, [artists]);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ARTISTS, JSON.stringify(artists));
    } catch {}
  }, [artists]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONVOS, JSON.stringify(conversations));
    } catch {}
  }, [conversations]);

  // Calculate unread chat messages
  const totalUnreadCount = Object.values(conversations).reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0
  );

  // Action Handlers
  const handleOpenAuth = (mode: 'login' | 'signup' = 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Crucial requirement: "Any new user registers, show his portfolio on discover menu. New users are not showing in the app."
  const handleAuthSuccess = (newUser: ArtistProfile) => {
    setCurrentUser(newUser);

    // Explicitly add newly registered user right to the TOP of the artists directory and save
    setArtists((prev) => {
      const filtered = prev.filter(
        (a) => a.id !== newUser.id && a.email.toLowerCase() !== newUser.email.toLowerCase()
      );
      const updated = [newUser, ...filtered];
      try {
        localStorage.setItem(STORAGE_KEY_ARTISTS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Automatically navigate to Discover so the user immediately sees their own portfolio card
    setSelectedRoleFilter('all');
    setActiveNavTab('all');

    setCopyFeedback(`Welcome to swarnmusic, ${newUser.name}! Your portfolio is now live on the Discover board.`);
    setTimeout(() => setCopyFeedback(''), 5000);

    setTimeout(() => {
      scrollToDiscovery();
    }, 200);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleOpenUpload = () => {
    if (!currentUser) {
      handleOpenAuth('signup');
      return;
    }
    setIsUploadModalOpen(true);
  };

  const handleSavePiece = (piece: WorkPiece) => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      works: [piece, ...currentUser.works],
    };
    setCurrentUser(updatedUser);

    // Update in artists directory and ensure persists at the top
    setArtists((prev) => {
      const updated = prev.map((artist) => {
        if (artist.id === currentUser.id) {
          return {
            ...artist,
            works: [piece, ...artist.works],
          };
        }
        return artist;
      });
      try {
        localStorage.setItem(STORAGE_KEY_ARTISTS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (selectedArtistForPortfolio?.id === currentUser.id) {
      setSelectedArtistForPortfolio(updatedUser);
    }
  };

  const handleSaveProfile = (updatedProfile: ArtistProfile) => {
    setCurrentUser(updatedProfile);
    setArtists((prev) => {
      const updated = prev.map((a) => (a.id === updatedProfile.id ? updatedProfile : a));
      try {
        localStorage.setItem(STORAGE_KEY_ARTISTS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (selectedArtistForPortfolio?.id === updatedProfile.id) {
      setSelectedArtistForPortfolio(updatedProfile);
    }
  };

  // Rating and review submission
  const handleAddReview = (
    artistId: string,
    pieceId: string,
    rating: number,
    comment: string
  ) => {
    const reviewerName = currentUser?.name || 'Acoustic Collaborator';
    const reviewerRole = currentUser?.role || 'singer';

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      pieceId,
      authorName: reviewerName,
      authorRole: reviewerRole,
      rating,
      comment,
      createdAt: 'Just now',
    };

    setArtists((prevArtists) => {
      const updatedList = prevArtists.map((art) => {
        if (art.id !== artistId) return art;

        const updatedWorks = art.works.map((w) => {
          if (w.id !== pieceId) return w;
          const updatedReviews = [newRev, ...w.reviews];
          const newAvg =
            updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
          return {
            ...w,
            reviews: updatedReviews,
            ratingsCount: updatedReviews.length,
            averageRating: Number(newAvg.toFixed(1)),
          };
        });

        const allRevs = updatedWorks.flatMap((w) => w.reviews);
        const overallAvg =
          allRevs.length > 0
            ? allRevs.reduce((sum, r) => sum + r.rating, 0) / allRevs.length
            : 5.0;

        const updatedArtist = {
          ...art,
          works: updatedWorks,
          totalReviews: allRevs.length,
          overallRating: Number(overallAvg.toFixed(1)),
        };

        if (selectedArtistForPortfolio?.id === artistId) {
          setSelectedArtistForPortfolio(updatedArtist);
        }

        return updatedArtist;
      });

      try {
        localStorage.setItem(STORAGE_KEY_ARTISTS, JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });
  };

  // Approach / Invite Flow
  const handleOpenInvite = (artist: ArtistProfile) => {
    if (!currentUser) {
      handleOpenAuth('signup');
      return;
    }
    setActiveChatTarget(artist);
    setIsChatBoxOpen(true);
  };

  // Direct share portfolio via external link: ?portfolio=ARTIST_ID
  const handleSharePortfolioLink = (artist: ArtistProfile) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareableUrl = `${baseUrl}?portfolio=${artist.id}`;
    navigator.clipboard.writeText(shareableUrl);
    setCopyFeedback(`Copied shareable link for ${artist.name}'s portfolio!`);
    setTimeout(() => setCopyFeedback(''), 3500);
  };

  // 1-on-1 Chat Messaging with simulated artist replies
  const handleSendMessage = (
    artistId: string,
    text: string,
    isInvite?: boolean,
    inviteData?: any
  ) => {
    const sender = currentUser || {
      id: 'guest-session',
      name: 'Independent Musician',
      role: 'composer' as ArtistRole,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    };

    const target = artists.find((a) => a.id === artistId);
    if (!target) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: sender.id,
      senderName: sender.name,
      receiverId: artistId,
      text,
      timestamp: 'Just now',
      isInvite,
      inviteDetails: inviteData,
    };

    setConversations((prev) => {
      const existing = prev[artistId] || {
        artistId: target.id,
        artistName: target.name,
        artistRole: target.role,
        artistAvatar: target.avatar,
        lastMessage: text,
        lastTimestamp: 'Just now',
        unreadCount: 0,
        messages: [],
      };

      return {
        ...prev,
        [artistId]: {
          ...existing,
          lastMessage: text,
          lastTimestamp: 'Just now',
          unreadCount: 0,
          messages: [...existing.messages, newMsg],
        },
      };
    });

    // Simulate response from artist in pure English
    setTimeout(() => {
      let replyText = '';
      if (target.role === 'singer') {
        replyText = `Hello ${sender.name}! Thank you for reaching out. I would be thrilled to lay down vocal tracks or alaap for this piece. What key and tempo do you envision?`;
      } else if (target.role === 'lyricist') {
        replyText = `Hello ${sender.name}! I received your message. I love the concept and have some thoughts on the meter and emotional imagery. Let's discuss the verse structure!`;
      } else if (target.role === 'composer') {
        replyText = `Hello! Wonderful to connect on swarnmusic. Your musical direction resonates with me. Let me assemble a quick acoustic progression in my studio and share back with you.`;
      } else {
        replyText = `Hello! Glad to connect. I am available for this musical venture. Let's create something soulful together.`;
      }

      const replyMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        senderId: target.id,
        senderName: target.name,
        receiverId: sender.id,
        text: replyText,
        timestamp: 'Just now',
      };

      setConversations((prev) => {
        const convo = prev[artistId];
        if (!convo) return prev;
        return {
          ...prev,
          [artistId]: {
            ...convo,
            lastMessage: replyText,
            lastTimestamp: 'Just now',
            messages: [...convo.messages, replyMsg],
          },
        };
      });
    }, 1200);
  };

  const handleSelectConversation = (artistId: string) => {
    const artist = artists.find((a) => a.id === artistId);
    if (artist) {
      setActiveChatTarget(artist);
      setConversations((prev) => {
        if (!prev[artistId]) return prev;
        return {
          ...prev,
          [artistId]: {
            ...prev[artistId],
            unreadCount: 0,
          },
        };
      });
    }
  };

  const scrollToDiscovery = () => {
    const el = document.getElementById('discovery-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] paper-texture flex flex-col font-sans selection:bg-[#7A131B] selection:text-white relative">
      {/* Toast Notification for Link Copying */}
      {copyFeedback && (
        <div className="fixed top-20 right-6 z-50 bg-[#7A131B] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check size={14} className="text-emerald-300" />
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* 1. TOP NAVIGATION BAR */}
      <Navigation
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onOpenUpload={handleOpenUpload}
        onOpenProfile={() => {
          if (currentUser) {
            setSelectedArtistForPortfolio(currentUser);
          } else {
            handleOpenAuth('signup');
          }
        }}
        onOpenChatList={() => {
          if (!currentUser) {
            handleOpenAuth('signup');
            return;
          }
          const firstConvoKey = Object.keys(conversations)[0];
          if (firstConvoKey) {
            handleSelectConversation(firstConvoKey);
          }
          setIsChatBoxOpen(true);
        }}
        onFilterRole={(role) => {
          setSelectedRoleFilter(role);
          scrollToDiscovery();
        }}
        unreadCount={totalUnreadCount}
        onLogout={handleLogout}
        activeNavTab={activeNavTab}
        setActiveNavTab={setActiveNavTab}
        onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
      />

      {/* 2. SPLIT HERO SECTION WITH ANIMATED SLIDES */}
      <main className="flex-1">
        <HeroSection
          artists={artists}
          onSelectArtist={(artist) => setSelectedArtistForPortfolio(artist)}
          onOpenInvite={handleOpenInvite}
          onOpenAuth={handleOpenAuth}
          onExploreClick={scrollToDiscovery}
        />

        {/* 3. ARTISANAL MANIFESTO & THEMATIC EMBLEM BANNER */}
        <section className="py-12 border-b border-[#E5D9C8] bg-[#F5EFE6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Emblem Stamp */}
              <div className="shrink-0">
                <SwarnLogo size="lg" withPaperSeal={true} showSubtext={true} />
              </div>

              {/* Editorial Statement in pure English */}
              <div className="space-y-2 text-center lg:text-left max-w-2xl">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#7A131B]">
                  Our Philosophy · Melody, Rhythm & Verses
                </span>
                <h3 className="text-2xl font-display font-bold text-stone-900 leading-snug">
                  "Every pure musical note deserves its poet, and every lyric seeks its melody."
                </h3>
                <p className="text-sm text-stone-700 leading-relaxed">
                  swarnmusic connects the sacred triangle of sound: the vocalist's breath,
                  the composer's harmonic architecture, and the songwriter's words. No algorithmic
                  distractions — only verified artists, authentic work pieces, and direct 1-on-1 collaboration rooms.
                </p>
              </div>

              {/* Quick Action */}
              <div className="shrink-0 flex flex-col items-center sm:items-start gap-2">
                <button
                  onClick={() => handleOpenAuth('signup')}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-md transition-colors shadow-sm cursor-pointer"
                >
                  Join the Community
                </button>
                <span className="text-[11px] text-stone-700">Free public portfolio hosting for all creators</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. DISCOVERY BOARD & SEARCH FEATURE */}
        <DiscoverySection
          artists={artists}
          onSelectArtist={(artist) => setSelectedArtistForPortfolio(artist)}
          onOpenInvite={handleOpenInvite}
          selectedRoleFilter={selectedRoleFilter}
          onFilterRoleChange={(role) => setSelectedRoleFilter(role)}
          onShareArtist={handleSharePortfolioLink}
          currentUserId={currentUser?.id}
          onOpenUpload={handleOpenUpload}
        />
      </main>

      {/* 5. FOOTER */}
      <footer className="border-t border-[#E5D9C8] bg-[#F5EFE6] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-stone-700">
          <div className="flex items-center gap-3">
            <SwarnLogo size="sm" />
            <span>swarnmusic · An Artisanal Stage for Music Creators</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setSelectedRoleFilter('singer');
                scrollToDiscovery();
              }}
              className="hover:text-stone-900 cursor-pointer"
            >
              Singers
            </button>
            <button
              onClick={() => {
                setSelectedRoleFilter('composer');
                scrollToDiscovery();
              }}
              className="hover:text-stone-900 cursor-pointer"
            >
              Composers
            </button>
            <button
              onClick={() => {
                setSelectedRoleFilter('lyricist');
                scrollToDiscovery();
              }}
              className="hover:text-stone-900 cursor-pointer"
            >
              Lyricists
            </button>
            <button onClick={() => handleOpenAuth('signup')} className="hover:text-[#7A131B] font-semibold cursor-pointer">
              Create Portfolio
            </button>
          </div>

          <div className="text-[11px] text-stone-700">
            © {new Date().getFullYear()} swarnmusic. All rights reserved to respective creators.
          </div>
        </div>
      </footer>

      {/* FLOATING HELP DESK: Connects user directly to creator (Sundram) through a live chat box */}
      <HelpDeskModal userEmail={currentUser?.email} userName={currentUser?.name} />

      {/* MODALS */}
      {/* 1. Artist Public Portfolio Modal with Animated Slides & Extended Credentials */}
      {selectedArtistForPortfolio && (
        <PortfolioModal
          artist={selectedArtistForPortfolio}
          isOpen={!!selectedArtistForPortfolio}
          onClose={() => setSelectedArtistForPortfolio(null)}
          onOpenInvite={handleOpenInvite}
          onAddReview={handleAddReview}
          isCurrentUser={currentUser?.id === selectedArtistForPortfolio.id}
          onOpenUpload={handleOpenUpload}
          onOpenEditProfile={() => setIsProfileEditModalOpen(true)}
        />
      )}

      {/* 2. Upload Piece of Work Modal */}
      {currentUser && (
        <UploadPieceModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          currentUser={currentUser}
          onSavePiece={handleSavePiece}
          onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
        />
      )}

      {/* 3. Auth Modal (Password Based, No OTP) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authModalMode}
        existingArtists={artists}
      />

      {/* 4. Profile Customization & Expanded Portfolio Modal */}
      {currentUser && (
        <ProfileEditModal
          isOpen={isProfileEditModalOpen}
          onClose={() => setIsProfileEditModalOpen(false)}
          currentUser={currentUser}
          onSaveProfile={handleSaveProfile}
        />
      )}

      {/* 5. 1-on-1 Chat Box Between Artists */}
      {currentUser && (
        <ChatBox
          isOpen={isChatBoxOpen}
          onClose={() => setIsChatBoxOpen(false)}
          currentUser={currentUser}
          targetArtist={activeChatTarget}
          conversations={conversations}
          onSendMessage={handleSendMessage}
          onSelectConversation={handleSelectConversation}
        />
      )}

      {/* 6. Google Drive Studio Hub Modal */}
      <GoogleDriveHubModal
        isOpen={isGoogleDriveOpen}
        onClose={() => setIsGoogleDriveOpen(false)}
        currentUser={currentUser}
        onImportPieceToPortfolio={(piece) => {
          handleSavePiece(piece);
          setCopyFeedback(`Imported "${piece.title}" from Google Drive into your portfolio!`);
          setTimeout(() => setCopyFeedback(''), 4500);
        }}
      />
    </div>
  );
}
