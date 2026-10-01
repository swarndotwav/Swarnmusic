import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArtistProfile, WorkPiece, Conversation, ChatMessage, Review, ArtistRole } from './types';
import { Navigation } from './components/Navigation';
import { HeroSection, SWARN_INSTAGRAM_COMMUNITY_URL } from './components/HeroSection';
import { DiscoverySection } from './components/DiscoverySection';
import { PortfolioModal } from './components/PortfolioModal';
import { UploadPieceModal } from './components/UploadPieceModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { ChatBox } from './components/ChatBox';
import { HelpDeskModal } from './components/HelpDeskModal';
import { RegistrationPage } from './components/RegistrationPage';
import { LoginPage } from './components/LoginPage';
import { ConnectUserModal } from './components/ConnectUserModal';
import { InstagramDmBox } from './components/InstagramDmBox';
import { SwarnUpiModal, FloatingSwarnButton } from './components/SwarnUpiModal';
import { SwarnLogo } from './components/SwarnLogo';
import { ClickAnimationProvider } from './components/ClickAnimationProvider';
import { CommunityExperiencesSection } from './components/CommunityExperiencesSection';
import { FloatingPillNavigation, MainNavTab } from './components/FloatingPillNavigation';
import { CurrentUserPortfolioCard } from './components/CurrentUserPortfolioCard';
import { ArtistSearchMenuModal } from './components/ArtistSearchMenuModal';
import { Sparkles, MessageSquare, Music, Shield, ArrowUpRight, Heart, Share2, Check, Instagram, Send } from 'lucide-react';
import { api } from './services/api';

const STORAGE_KEY_USER = 'swarn_current_user_v5';

type AppView = 'home' | 'register' | 'login';

export default function App() {
  // Page view routing (Home page and Registration page are cleanly separated)
  const [currentView, setCurrentView] = useState<AppView>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const page = params.get('page');
      if (page === 'register') return 'register';
      if (page === 'login') return 'login';
    } catch {}
    return 'home';
  });

  // 1. Registered Artists State (Shared from server backend)
  const [artists, setArtists] = useState<ArtistProfile[]>([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState<boolean>(true);

  // 2. Logged-in User State
  const [currentUser, setCurrentUser] = useState<ArtistProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // 3. User-to-User Conversations State
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});

  // Navigation and Filtering State
  const [activeNavTab, setActiveNavTab] = useState<string>('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  // Modals & Active Targets
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
  const [selectedArtistForPortfolio, setSelectedArtistForPortfolio] = useState<ArtistProfile | null>(null);
  const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
  const [isDmBoxOpen, setIsDmBoxOpen] = useState(false);
  const [isSwarnUpiModalOpen, setIsSwarnUpiModalOpen] = useState(false);
  const [activeChatTarget, setActiveChatTarget] = useState<ArtistProfile | null>(null);
  const [connectTargetArtist, setConnectTargetArtist] = useState<ArtistProfile | null>(null);

  // Floating Pill Navigation Dock Active Tab ('home' | 'search' | 'inbox' | 'profile')
  const [activeDockTab, setActiveDockTab] = useState<MainNavTab>('home');
  const [isSearchMenuOpen, setIsSearchMenuOpen] = useState(false);
  const [isInboxChatActive, setIsInboxChatActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  // Real-time incoming message pop notification near inbox
  const [incomingMessagePop, setIncomingMessagePop] = useState<{
    senderId?: string;
    senderName: string;
    senderAvatar?: string;
    text: string;
    timestamp?: string;
  } | null>(null);

  const prevMessageIdsRef = useRef<Set<string>>(new Set());
  const isInitialConnectionsLoadRef = useRef(true);
  const popDismissTimerRef = useRef<any>(null);

  // Pure Web Audio acoustic notification chime
  const playIncomingChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      // D5 note (587.33Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // A5 note (880Hz) harmonic bell
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0.25, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.65);
    } catch {}
  }, []);

  const triggerIncomingPop = useCallback(
    (msg: {
      senderId?: string;
      senderName: string;
      senderAvatar?: string;
      text: string;
      timestamp?: string;
    }) => {
      setIncomingMessagePop(msg);
      playIncomingChime();

      if (popDismissTimerRef.current) clearTimeout(popDismissTimerRef.current);
      popDismissTimerRef.current = setTimeout(() => {
        setIncomingMessagePop(null);
      }, 8000);
    },
    [playIncomingChime]
  );

  const handleOpenIncomingMessage = (senderId?: string) => {
    setIncomingMessagePop(null);
    if (senderId) {
      const match = artists.find((a) => a.id === senderId);
      if (match) {
        setActiveChatTarget(match);
      }
    }
    setIsDmBoxOpen(true);
    setActiveDockTab('inbox');
  };

  const handleSelectDockTab = (tab: MainNavTab) => {
    setActiveDockTab(tab);
    if (tab === 'home') {
      setIsDmBoxOpen(false);
      setIsSearchMenuOpen(false);
      setIsInboxChatActive(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'search') {
      setIsSearchMenuOpen((prev) => !prev);
      setIsDmBoxOpen(false);
      setIsInboxChatActive(false);
    } else if (tab === 'inbox') {
      setIsSearchMenuOpen(false);
      setActiveChatTarget(null);
      setIsInboxChatActive(false);
      setIsDmBoxOpen(true);
    } else if (tab === 'profile') {
      setIsSearchMenuOpen(false);
      setIsDmBoxOpen(false);
      setIsInboxChatActive(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper to detect device system color scheme
  const getSystemIsDark = (): boolean => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Theme mode: 'system' | 'dark' | 'light' (Default is 'system')
  const [themeMode, setThemeMode] = useState<'system' | 'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('swarn_theme_mode');
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        return saved;
      }
    } catch {}
    return 'system'; // Default to system!
  });

  // Dark mode state: default follows system preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('swarn_theme_mode');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
    } catch {}
    return getSystemIsDark();
  });

  // Real-time listener for OS system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (themeMode === 'system') {
        setIsDarkMode(e.matches);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleSystemThemeChange);
      return () => (mediaQuery as any).removeListener(handleSystemThemeChange);
    }
  }, [themeMode]);

  // Cycle theme: system -> dark -> light -> system
  const toggleDarkMode = () => {
    let nextMode: 'system' | 'dark' | 'light';
    let nextIsDark: boolean;

    if (themeMode === 'system') {
      nextMode = isDarkMode ? 'light' : 'dark';
      nextIsDark = !isDarkMode;
    } else if (themeMode === 'dark') {
      nextMode = 'light';
      nextIsDark = false;
    } else if (themeMode === 'light') {
      nextMode = 'system';
      nextIsDark = getSystemIsDark();
    } else {
      nextMode = 'system';
      nextIsDark = getSystemIsDark();
    }

    setThemeMode(nextMode);
    setIsDarkMode(nextIsDark);

    try {
      localStorage.setItem('swarn_theme_mode', nextMode);
    } catch {}
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('chocolate-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('chocolate-mode');
    }
  }, [isDarkMode]);

  // Link copy toast feedback
  const [copyFeedback, setCopyFeedback] = useState('');

  // Navigation router helper
  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    try {
      const url = new URL(window.location.href);
      if (view === 'home') {
        url.searchParams.delete('page');
      } else {
        url.searchParams.set('page', view);
      }
      window.history.pushState({}, '', url.toString());
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to browser popstate (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const page = params.get('page');
        if (page === 'register') setCurrentView('register');
        else if (page === 'login') setCurrentView('login');
        else setCurrentView('home');
      } catch {
        setCurrentView('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch real registered artists from the backend server and ensure all registered creators persist forever
  const loadArtists = useCallback(async () => {
    try {
      const serverArtists = await api.getArtists();

      // Read local persistent registry of all registered users
      let localRegistry: ArtistProfile[] = [];
      try {
        const raw = localStorage.getItem('swarn_registered_artists_registry');
        if (raw) localRegistry = JSON.parse(raw);
      } catch {}

      // Combine server artists and local registry deduplicated by ID
      const combinedMap = new Map<string, ArtistProfile>();
      for (const a of serverArtists) {
        if (a && a.id) combinedMap.set(a.id, a);
      }
      for (const a of localRegistry) {
        if (a && a.id && !combinedMap.has(a.id)) {
          combinedMap.set(a.id, a);
          // Sync missing registered artist to server so they are visible to all devices
          api.registerArtist(a).catch(() => {});
        }
      }

      if (currentUser && currentUser.id) {
        if (!combinedMap.has(currentUser.id)) {
          combinedMap.set(currentUser.id, currentUser);
          api.registerArtist(currentUser).catch(() => {});
        }
      }

      const allRegistered = Array.from(combinedMap.values());
      try {
        localStorage.setItem('swarn_registered_artists_registry', JSON.stringify(allRegistered));
      } catch {}

      setArtists(allRegistered);
      setIsLoadingArtists(false);

      // Check if external portfolio link parameter exists: ?portfolio=ARTIST_ID
      const params = new URLSearchParams(window.location.search);
      const portfolioId = params.get('portfolio');
      if (portfolioId) {
        let match: ArtistProfile | null | undefined = allRegistered.find((a) => a.id === portfolioId);
        if (!match) {
          match = await api.getArtistById(portfolioId);
        }
        if (match) {
          setSelectedArtistForPortfolio(match);
        }
      }
    } catch (err) {
      console.warn('Failed to load artists from server:', err);
      setIsLoadingArtists(false);
    }
  }, [currentUser]);

  // Fetch user connections and chat threads from server
  const loadUserConnections = useCallback(async (userId?: string) => {
    try {
      const effectiveId = userId || currentUser?.id;
      const threads = await api.getConnections(effectiveId);
      const convMap: Record<string, Conversation> = {};

      const currentMsgIds = new Set<string>();
      let latestIncoming: { senderId: string; senderName: string; senderAvatar?: string; text: string; timestamp?: string } | null = null;

      for (const t of threads) {
        const otherId = (t.participantIds || []).find((id: string) => id !== effectiveId);
        if (!otherId) continue;
        const otherInfo = t.participants?.[otherId] || {};

        convMap[otherId] = {
          artistId: otherId,
          artistName: otherInfo.name || 'Fellow Artist',
          artistRole: (otherInfo.role as ArtistRole) || 'singer',
          artistAvatar: otherInfo.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          lastMessage: t.lastMessage || 'Connected on swarnmusic',
          lastTimestamp: t.lastTimestamp || 'Recently',
          unreadCount: (t.unreadBy || []).includes(effectiveId || '') ? 1 : 0,
          messages: (t.messages || []).map((m: any) => ({
            id: m.id || `msg-${Math.random()}`,
            senderId: m.senderId,
            senderName: m.senderName,
            receiverId: m.receiverId,
            text: m.text,
            timestamp: m.timestamp,
            audioUrl: m.audioUrl,
            audioDuration: m.audioDuration,
            imageUrl: m.imageUrl,
            imageCaption: m.imageCaption,
          })),
        };

        for (const m of (t.messages || [])) {
          currentMsgIds.add(m.id);

          // Detect newly arrived incoming message
          if (
            !isInitialConnectionsLoadRef.current &&
            !prevMessageIdsRef.current.has(m.id) &&
            (!effectiveId || m.receiverId === effectiveId || (m.senderId !== effectiveId && (t.unreadBy || []).includes(effectiveId)))
          ) {
            latestIncoming = {
              senderId: m.senderId,
              senderName: m.senderName || otherInfo.name || 'Fellow Artist',
              senderAvatar: otherInfo.avatar || m.senderAvatar,
              text: m.text,
              timestamp: m.timestamp,
            };
          }
        }
      }

      setConversations(convMap);
      prevMessageIdsRef.current = currentMsgIds;
      isInitialConnectionsLoadRef.current = false;

      // When a new message arrives from another user, pop notification near inbox
      if (latestIncoming && !isDmBoxOpen) {
        triggerIncomingPop(latestIncoming);
      }
    } catch (err) {
      console.warn('Failed to load connections:', err);
    }
  }, [currentUser?.id, isDmBoxOpen, triggerIncomingPop]);

  // Initial data load + automatic sync to server
  useEffect(() => {
    loadArtists();

    // Auto-sync current user to server if they were in localStorage
    if (currentUser) {
      api.registerArtist(currentUser).then(() => {
        loadArtists();
      });
      loadUserConnections(currentUser.id);
    } else {
      loadUserConnections();
    }

    // Regular responsive polling every 2.5s so new registered artists & incoming messages appear with zero delay
    const pollInterval = setInterval(() => {
      loadArtists();
      loadUserConnections(currentUser?.id);
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [loadArtists, loadUserConnections, currentUser?.id]);

  // Persist current user in local storage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch {}
  }, [currentUser]);

  // Unread badge counter
  const totalUnreadCount = Object.values(conversations).reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0
  );

  const scrollToDiscovery = () => {
    const el = document.getElementById('discovery-board');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Successful Registration Handler (from separate RegistrationPage)
  const handleRegisterSuccess = (newUser: ArtistProfile) => {
    setCurrentUser(newUser);
    // Add to top of artists state
    setArtists((prev) => [newUser, ...prev.filter((a) => a.id !== newUser.id)]);
    // Navigate to Home view
    navigateTo('home');
    setSelectedRoleFilter('all');
    setActiveNavTab('all');

    setCopyFeedback(`Welcome to swarnmusic, ${newUser.name}! Your public portfolio is now active.`);
    setTimeout(() => setCopyFeedback(''), 5000);

    setTimeout(() => {
      scrollToDiscovery();
    }, 300);
  };

  // Successful Login Handler (from separate LoginPage)
  const handleLoginSuccess = (user: ArtistProfile) => {
    setCurrentUser(user);
    navigateTo('home');
    loadArtists();
    loadUserConnections(user.id);

    setCopyFeedback(`Signed in as ${user.name}`);
    setTimeout(() => setCopyFeedback(''), 3000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setConversations({});
    setCopyFeedback('Signed out successfully');
    setTimeout(() => setCopyFeedback(''), 2500);
  };

  const handleOpenUpload = () => {
    if (!currentUser) {
      navigateTo('register');
      return;
    }
    setIsUploadModalOpen(true);
  };

  const handleSavePiece = async (piece: WorkPiece) => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      works: [piece, ...currentUser.works],
    };
    setCurrentUser(updatedUser);

    setArtists((prev) =>
      prev.map((artist) => (artist.id === currentUser.id ? updatedUser : artist))
    );

    // Save to server
    await api.addWorkPiece(currentUser.id, piece);

    if (selectedArtistForPortfolio?.id === currentUser.id) {
      setSelectedArtistForPortfolio(updatedUser);
    }
  };

  const handleSaveProfile = async (updatedProfile: ArtistProfile) => {
    setCurrentUser(updatedProfile);
    setArtists((prev) =>
      prev.map((a) => (a.id === updatedProfile.id ? updatedProfile : a))
    );
    // Save to server
    await api.updateProfile(updatedProfile.id, updatedProfile);

    if (selectedArtistForPortfolio?.id === updatedProfile.id) {
      setSelectedArtistForPortfolio(updatedProfile);
    }
  };

  // Submit review to piece
  const handleAddReview = async (
    artistId: string,
    pieceId: string,
    rating: number,
    comment: string
  ) => {
    const reviewerName = currentUser?.name || 'Fellow Creator';
    const reviewerRole: ArtistRole = currentUser?.role || 'singer';

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      pieceId,
      authorName: reviewerName,
      authorRole: reviewerRole,
      authorAvatar: currentUser?.avatar,
      rating,
      comment,
      createdAt: 'Just now',
    };

    setArtists((prevArtists) => {
      return prevArtists.map((art) => {
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
    });

    // Save review to server
    await api.addReview(artistId, {
      pieceId,
      rating,
      comment,
      authorName: reviewerName,
      authorRole: reviewerRole,
      authorAvatar: currentUser?.avatar,
    });
  };

  // Open 1-to-1 conversation directly in Instagram DM Box with connecting artist
  const handleOpenConnect = (artist: ArtistProfile) => {
    setActiveChatTarget(artist);
    setIsDmBoxOpen(true);
  };

  // Handle direct 1-on-1 message sending between users
  const handleSendMessage = async (
    targetArtistId: string,
    text: string,
    isInvite?: boolean,
    inviteData?: any
  ) => {
    if (!currentUser) {
      navigateTo('register');
      return;
    }

    const timestamp =
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ', ' +
      new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: targetArtistId,
      text,
      timestamp,
      isInvite,
      inviteDetails: inviteData,
    };

    setConversations((prev) => {
      const existing = prev[targetArtistId];
      const targetArtistObj = artists.find((a) => a.id === targetArtistId) || activeChatTarget;

      return {
        ...prev,
        [targetArtistId]: {
          artistId: targetArtistId,
          artistName: targetArtistObj?.name || existing?.artistName || 'Artist',
          artistRole: targetArtistObj?.role || existing?.artistRole || 'singer',
          artistAvatar:
            targetArtistObj?.avatar ||
            existing?.artistAvatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          lastMessage: text,
          lastTimestamp: 'Just now',
          unreadCount: 0,
          messages: existing ? [...existing.messages, newMsg] : [newMsg],
        },
      };
    });

    // Send to server so target artist receives it on their account
    const targetArtistObj = artists.find((a) => a.id === targetArtistId);
    await api.sendConnection({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: currentUser.role,
      receiverId: targetArtistId,
      receiverName: targetArtistObj?.name || 'Artist',
      receiverAvatar: targetArtistObj?.avatar,
      receiverRole: targetArtistObj?.role || 'musician',
      projectType: inviteData?.projectTitle,
      messageText: text,
    });
  };

  const handleSelectConversation = (artistId: string) => {
    const artist = artists.find((a) => a.id === artistId);
    if (artist) {
      setActiveChatTarget(artist);
    }
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
  };

  // External link share copying helper
  const handleSharePortfolioLink = (artist: ArtistProfile) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?portfolio=${artist.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopyFeedback(`Link for ${artist.name}'s portfolio copied to clipboard!`);
    setTimeout(() => setCopyFeedback(''), 3000);
  };

  // VIEW 1: DEDICATED SEPARATE REGISTRATION PAGE
  if (currentView === 'register') {
    return (
      <RegistrationPage
        onSuccess={handleRegisterSuccess}
        onNavigateHome={() => navigateTo('home')}
        onNavigateLogin={() => navigateTo('login')}
      />
    );
  }

  // VIEW 2: DEDICATED SEPARATE LOGIN PAGE
  if (currentView === 'login') {
    return (
      <LoginPage
        onSuccess={handleLoginSuccess}
        onNavigateHome={() => navigateTo('home')}
        onNavigateRegister={() => navigateTo('register')}
      />
    );
  }

  // VIEW 3: HOME PAGE
  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-[#7A131B] selection:text-white transition-colors duration-300 ${
        isDarkMode ? 'bg-[#2D1A12] text-[#FAF5EE]' : 'bg-white text-stone-900'
      }`}
    >
      {/* Toast Feedback Banner */}
      {copyFeedback && (
        <div className="fixed top-20 right-6 z-50 bg-[#7A131B] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-3 duration-200">
          <Check size={14} className="text-amber-300" />
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* 1. TOP STICKY NAVIGATION */}
      <Navigation
        currentUser={currentUser}
        onOpenAuth={(mode) => navigateTo(mode === 'login' ? 'login' : 'register')}
        onOpenUpload={handleOpenUpload}
        onOpenProfile={() => {
          if (currentUser) {
            setSelectedArtistForPortfolio(currentUser);
          } else {
            navigateTo('register');
          }
        }}
        onOpenChatList={() => {
          setIsDmBoxOpen(true);
        }}
        onFilterRole={(role) => {
          setSelectedRoleFilter(role);
          scrollToDiscovery();
        }}
        unreadCount={totalUnreadCount}
        onLogout={handleLogout}
        activeNavTab={activeNavTab}
        setActiveNavTab={setActiveNavTab}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        themeMode={themeMode}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        incomingPop={incomingMessagePop}
      />

      {/* 2. SPLIT HERO SECTION WITH REAL REGISTERED ARTISTS */}
      <main className="flex-1">
        {activeDockTab === 'profile' ? (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E5D9C8] dark:border-white/10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 dark:text-white">
                  User Profile & Portfolio
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                  Personal details, verified category credentials, uploaded musical takes, and artistic influences.
                </p>
              </div>
              <button
                onClick={() => handleSelectDockTab('home')}
                className="px-4 py-2 text-xs font-semibold rounded-full bg-stone-200 dark:bg-white/10 text-stone-800 dark:text-stone-100 hover:bg-stone-300 transition-colors cursor-pointer"
              >
                ← Back to Home
              </button>
            </div>
            <CurrentUserPortfolioCard
              currentUser={currentUser}
              onOpenUpload={handleOpenUpload}
              onOpenEditProfile={() => setIsProfileEditModalOpen(true)}
              onRequireAuth={(mode) => navigateTo(mode === 'login' ? 'login' : 'register')}
              onLogout={handleLogout}
              onSelectArtist={(artist) => setSelectedArtistForPortfolio(artist)}
              isDarkMode={isDarkMode}
            />
          </div>
        ) : (
          <>
            <HeroSection
              artists={artists}
              onSelectArtist={(artist) => setSelectedArtistForPortfolio(artist)}
              onOpenInvite={handleOpenConnect}
              onOpenAuth={(mode) => navigateTo(mode === 'login' ? 'login' : 'register')}
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

                  {/* Editorial Statement */}
                  <div className="space-y-2 text-center lg:text-left max-w-2xl">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#7A131B]">
                      Our Philosophy · Melody, Rhythm & Verses
                    </span>
                    <h3 className="text-2xl font-display font-bold text-stone-900 leading-snug">
                      "Every pure musical note deserves its poet, and every lyric seeks its melody."
                    </h3>
                    <p className="text-sm text-stone-700 leading-relaxed">
                      swarnmusic connects the sacred triangle of sound: the vocalist's breath,
                      the composer's harmonic architecture, and the songwriter's words. Zero fake AI profiles —
                      only authentic artists, published public portfolios, and direct creator connections.
                    </p>
                  </div>

                  {/* Quick Action: Join Community on Instagram */}
                  <div className="shrink-0 flex flex-col items-center sm:items-start gap-2">
                    <a
                      href={SWARN_INSTAGRAM_COMMUNITY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-md transition-colors shadow-sm cursor-pointer flex items-center gap-2"
                    >
                      <Instagram size={14} />
                      <span>Join the Community</span>
                    </a>
                    <span className="text-[11px] text-stone-600">Follow our Instagram community updates</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. DISCOVERY BOARD & SEARCH FEATURE */}
            <div id="discovery-board">
              <DiscoverySection
                artists={artists}
                onSelectArtist={(artist) => setSelectedArtistForPortfolio(artist)}
                onOpenInvite={handleOpenConnect}
                selectedRoleFilter={selectedRoleFilter}
                onFilterRoleChange={(role) => setSelectedRoleFilter(role)}
                onShareArtist={handleSharePortfolioLink}
                currentUserId={currentUser?.id}
                onOpenUpload={handleOpenUpload}
                onOpenRegister={() => navigateTo('register')}
              />
            </div>

            {/* 5. AT THE BOTTOM OF THE WEBSITE: COMMUNITY EXPERIENCES & COMMENTS SECTION */}
            <CommunityExperiencesSection
              currentUser={currentUser}
              onRequireAuth={(mode) => navigateTo(mode === 'login' ? 'login' : 'register')}
              isDarkMode={isDarkMode}
            />
          </>
        )}
      </main>

      {/* 6. FOOTER */}
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
            <button
              onClick={() => {
                const el = document.getElementById('community-experiences');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-stone-900 cursor-pointer"
            >
              Experiences
            </button>
            <a
              href={SWARN_INSTAGRAM_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#7A131B] font-semibold hover:underline"
            >
              Join the Community
            </a>
            <button
              onClick={() => navigateTo('register')}
              className="hover:text-[#7A131B] font-semibold cursor-pointer"
            >
              Create Portfolio
            </button>
          </div>

          <div className="text-[11px] text-stone-600">
            © {new Date().getFullYear()} swarnmusic. Real music creators only.
          </div>
        </div>
      </footer>

      {/* FLOATING HELP DESK: Small Button, AI Bot Named SHUREN, With Option to Redirect to Person in Inbox */}
      <HelpDeskModal
        userEmail={currentUser?.email}
        userName={currentUser?.name}
        onRedirectToPerson={() => {
          // Connect user to "me" (creator/admin with email sundram230810@gmail.com or named DoDo / Sundram)
          let targetPerson = artists.find(
            (a) =>
              a.email === 'sundram230810@gmail.com' ||
              a.name?.toLowerCase().includes('dodo') ||
              a.name?.toLowerCase().includes('sundram') ||
              a.id === 'artist-1790766038879'
          );
          if (!targetPerson || targetPerson.id === currentUser?.id) {
            targetPerson = artists.find((a) => a.id !== currentUser?.id) || targetPerson;
          }

          if (targetPerson) {
            setActiveChatTarget(targetPerson);
          }
          setActiveDockTab('inbox');
          setIsDmBoxOpen(true);
        }}
      />

      {/* MODALS */}
      {/* 1. Artist Public Portfolio Modal with Share & Reviews */}
      {selectedArtistForPortfolio && (
        <PortfolioModal
          artist={selectedArtistForPortfolio}
          isOpen={!!selectedArtistForPortfolio}
          onClose={() => setSelectedArtistForPortfolio(null)}
          onOpenInvite={handleOpenConnect}
          onAddReview={handleAddReview}
          isCurrentUser={currentUser?.id === selectedArtistForPortfolio.id}
          onOpenUpload={handleOpenUpload}
          onOpenEditProfile={() => setIsProfileEditModalOpen(true)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* 2. Direct Artist-to-Artist Connection Modal (Must connect one user to another user) */}
      <ConnectUserModal
        isOpen={!!connectTargetArtist}
        onClose={() => setConnectTargetArtist(null)}
        targetArtist={connectTargetArtist}
        currentUser={currentUser}
        onRequireAuth={(mode) => {
          setConnectTargetArtist(null);
          navigateTo(mode === 'login' ? 'login' : 'register');
        }}
        onOpenChatWithArtist={(target) => {
          setConnectTargetArtist(null);
          setActiveChatTarget(target);
          setIsDmBoxOpen(true);
        }}
      />

      {/* 3. Community Direct Messages (APPROACH Box - 1-to-1 Chat) */}
      <InstagramDmBox
        isOpen={isDmBoxOpen}
        onClose={() => {
          setIsDmBoxOpen(false);
          setIsInboxChatActive(false);
          if (activeDockTab === 'inbox') {
            setActiveDockTab('home');
          }
        }}
        currentUser={currentUser}
        artists={artists}
        onOpenPortfolio={(artist) => {
          setIsDmBoxOpen(false);
          setIsInboxChatActive(false);
          setSelectedArtistForPortfolio(artist);
        }}
        onRequireAuth={(mode) => {
          setIsDmBoxOpen(false);
          setIsInboxChatActive(false);
          navigateTo(mode === 'login' ? 'login' : 'register');
        }}
        initialTargetArtist={activeChatTarget}
        isDarkMode={isDarkMode}
        onActiveChatChange={(isActive) => {
          setIsInboxChatActive(isActive);
        }}
      />

      {/* 60FPS LOCKED CLICK ANIMATION PROVIDER ON EVERY SINGLE CLICK */}
      <ClickAnimationProvider />

      {/* Floating Pill Search Menu Modal (Search artists by stage name, real name, role) */}
      <ArtistSearchMenuModal
        isOpen={isSearchMenuOpen}
        onClose={() => {
          setIsSearchMenuOpen(false);
          if (activeDockTab === 'search') setActiveDockTab('home');
        }}
        artists={artists}
        onSelectArtist={(artist) => {
          setSelectedArtistForPortfolio(artist);
        }}
        onOpenMessage={(artist) => {
          setActiveChatTarget(artist);
          setIsDmBoxOpen(true);
        }}
        currentUserId={currentUser?.id}
        isDarkMode={isDarkMode}
      />

      {/* FLOATING LIQUID GLASS PILL NAVIGATION DOCK (Home, Search, Inbox, Profile) - Stays visible during search */}
      <FloatingPillNavigation
        activeTab={isSearchMenuOpen ? 'search' : activeDockTab}
        onSelectTab={handleSelectDockTab}
        currentUser={currentUser}
        unreadCount={totalUnreadCount}
        isVisible={!isInboxChatActive}
        incomingPop={incomingMessagePop}
        onOpenIncomingPop={handleOpenIncomingMessage}
        onDismissIncomingPop={() => setIncomingMessagePop(null)}
      />

      {/* Floating Small Icon Named "Swarn" with UPI Support (9708298001@fam) */}
      <FloatingSwarnButton onClick={() => setIsSwarnUpiModalOpen(true)} />

      {/* Swarn UPI Payment & QR Modal */}
      <SwarnUpiModal
        isOpen={isSwarnUpiModalOpen}
        onClose={() => setIsSwarnUpiModalOpen(false)}
      />

      {/* 4. Upload Piece of Work Modal */}
      {currentUser && (
        <UploadPieceModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          currentUser={currentUser}
          onSavePiece={handleSavePiece}
        />
      )}

      {/* 4. Profile Customization Modal */}
      {currentUser && (
        <ProfileEditModal
          isOpen={isProfileEditModalOpen}
          onClose={() => setIsProfileEditModalOpen(false)}
          currentUser={currentUser}
          onSaveProfile={handleSaveProfile}
        />
      )}

      {/* 5. 1-on-1 Messages & Chat Thread between Artists */}
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
    </div>
  );
}
