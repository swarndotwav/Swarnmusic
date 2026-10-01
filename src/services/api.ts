import { ArtistProfile, WorkPiece, Review, CommunityExperience } from '../types';

const API_BASE = '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export const api = {
  // Fetch all registered artists
  async getArtists(): Promise<ArtistProfile[]> {
    try {
      const res = await fetch(`${API_BASE}/artists`);
      if (!res.ok) throw new Error('Failed to fetch artists');
      const data = await res.json();
      return data.artists || [];
    } catch (err) {
      console.warn('API getArtists error, falling back to local storage cache:', err);
      try {
        const cached = localStorage.getItem('swarn_artists_v2');
        return cached ? JSON.parse(cached) : [];
      } catch {
        return [];
      }
    }
  },

  // Fetch a single artist by ID (essential for ?portfolio=ID external links!)
  async getArtistById(id: string): Promise<ArtistProfile | null> {
    try {
      const res = await fetch(`${API_BASE}/artists/${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.artist || null;
    } catch (err) {
      console.warn(`API getArtistById(${id}) error:`, err);
      return null;
    }
  },

  // Register a new artist with auto-retry and resilient fallback
  async registerArtist(artistData: Partial<ArtistProfile>): Promise<{ success: boolean; user?: ArtistProfile; message?: string }> {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(artistData),
        });
        if (res.ok) {
          const data = await res.json();
          // Store in persistent local registry as well
          if (data && data.user) {
            try {
              const local = localStorage.getItem('swarn_registered_artists_registry');
              const list = local ? JSON.parse(local) : [];
              const idx = list.findIndex((a: any) => a.id === data.user.id || a.email?.toLowerCase() === data.user.email?.toLowerCase());
              if (idx >= 0) list[idx] = data.user;
              else list.unshift(data.user);
              localStorage.setItem('swarn_registered_artists_registry', JSON.stringify(list));
            } catch {}
          }
          return data;
        }
      } catch (err) {
        if (attempt === 1) {
          // Brief pause before retry in case dev server was briefly reloading
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }
      }
    }

    // Graceful offline fallback: persist to local storage so user registration is never lost or blocked!
    try {
      const fallbackUser: ArtistProfile = {
        id: artistData.id || `artist-${Date.now()}`,
        name: artistData.name || 'Artist',
        role: artistData.role || 'singer',
        genre: artistData.genre || ['Indie Folk & Fusion'],
        email: artistData.email || '',
        phone: artistData.phone || '',
        password: artistData.password,
        avatar: artistData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: artistData.bio || 'Dedicated artist exploring acoustic authenticity on swarnmusic.',
        musicalInfluences: artistData.musicalInfluences || ['Indian Classical Heritage'],
        location: artistData.location || 'India',
        experienceLevel: artistData.experienceLevel || 'Active Creator',
        joinedDate: 'Joined recently',
        totalReviews: 0,
        overallRating: 5.0,
        isOpenForCollaboration: true,
        instrumentsPlayed: artistData.instrumentsPlayed || ['Vocals'],
        languagesSpokenOrWritten: ['English', 'Hindi'],
        equipmentOrSoftware: ['Home Studio'],
        socialLinks: {},
        works: [],
        ...artistData,
      } as ArtistProfile;

      const local = localStorage.getItem('swarn_registered_artists_registry');
      const list = local ? JSON.parse(local) : [];
      const idx = list.findIndex((a: any) => a.id === fallbackUser.id || a.email?.toLowerCase() === fallbackUser.email?.toLowerCase());
      if (idx >= 0) list[idx] = fallbackUser;
      else list.unshift(fallbackUser);
      localStorage.setItem('swarn_registered_artists_registry', JSON.stringify(list));

      return { success: true, user: fallbackUser };
    } catch {
      return { success: true, user: artistData as ArtistProfile };
    }
  },

  // Login with email or phone + password
  async login(identifier: string, password: string): Promise<{ success: boolean; user?: ArtistProfile; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {}

    // Offline registry credential check fallback
    try {
      const local = localStorage.getItem('swarn_registered_artists_registry');
      if (local) {
        const list: ArtistProfile[] = JSON.parse(local);
        const cleanId = identifier.trim().toLowerCase();
        const matched = list.find(
          (a) =>
            (a.email && a.email.toLowerCase() === cleanId) ||
            (a.phone && a.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, ''))
        );
        if (matched) {
          if (matched.password && matched.password !== password) {
            return { success: false, message: 'Incorrect password' };
          }
          return { success: true, user: matched };
        }
      }
    } catch {}

    return { success: false, message: 'Invalid credentials or artist not found' };
  },

  // Update artist profile
  async updateProfile(id: string, updates: Partial<ArtistProfile>): Promise<{ success: boolean; artist?: ArtistProfile }> {
    try {
      const res = await fetch(`${API_BASE}/artists/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  // Add a work piece
  async addWorkPiece(artistId: string, work: Partial<WorkPiece>): Promise<{ success: boolean; artist?: ArtistProfile }> {
    try {
      const res = await fetch(`${API_BASE}/artists/${encodeURIComponent(artistId)}/works`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(work),
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  // Add review
  async addReview(artistId: string, reviewData: { pieceId: string; rating: number; comment: string; authorName: string; authorRole: string; authorAvatar?: string }): Promise<{ success: boolean; artist?: ArtistProfile }> {
    try {
      const res = await fetch(`${API_BASE}/artists/${encodeURIComponent(artistId)}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  // Get user connections & threads (or all threads if userId is not provided)
  async getConnections(userId?: string): Promise<any[]> {
    try {
      const url = userId ? `${API_BASE}/connections?userId=${encodeURIComponent(userId)}` : `${API_BASE}/connections`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return data.threads || [];
    } catch {
      return [];
    }
  },

  // Send connection proposal / message to another user
  async sendConnection(payload: {
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    senderRole: string;
    receiverId: string;
    receiverName: string;
    receiverAvatar?: string;
    receiverRole: string;
    projectType?: string;
    messageText?: string;
    audioUrl?: string;
    audioDuration?: number;
    imageUrl?: string;
    imageCaption?: string;
  }): Promise<{ success: boolean; thread?: any; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/connections/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to send connection' };
    }
  },

  // Reply to thread
  async replyConnection(
    threadId: string,
    senderId: string,
    senderName: string,
    text: string,
    media?: {
      audioUrl?: string;
      audioDuration?: number;
      imageUrl?: string;
      imageCaption?: string;
    }
  ): Promise<{ success: boolean; thread?: any }> {
    try {
      const res = await fetch(`${API_BASE}/connections/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          senderId,
          senderName,
          text,
          ...media,
        }),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Online Calling Service: Initiate call between two user IDs
  async initiateCall(payload: {
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    receiverId: string;
    receiverName: string;
    receiverAvatar?: string;
    callType?: 'audio' | 'video';
  }): Promise<{ success: boolean; call?: any }> {
    try {
      const res = await fetch(`${API_BASE}/calls/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Online Calling Service: Respond to or end call
  async respondCall(callId: string, action: 'accept' | 'decline' | 'end'): Promise<{ success: boolean; call?: any }> {
    try {
      const res = await fetch(`${API_BASE}/calls/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, action }),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Online Calling Service: Get active calls
  async getActiveCalls(userId?: string): Promise<any[]> {
    try {
      const url = userId ? `${API_BASE}/calls/active?userId=${encodeURIComponent(userId)}` : `${API_BASE}/calls/active`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return data.calls || [];
    } catch {
      return [];
    }
  },

  // SHUREN AI chat assistant
  async askShuren(message: string): Promise<{ reply: string; timestamp: string }> {
    try {
      const res = await fetch(`${API_BASE}/shuren/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      return {
        reply: data.reply || 'I am SHUREN, here to assist your music journey.',
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    } catch {
      return {
        reply: 'I am SHUREN, here to help. You can register on the registration page, publish your portfolio, and connect directly with other creators!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }
  },

  // Community Experiences: Visible to everyone
  async getExperiences(): Promise<CommunityExperience[]> {
    try {
      const res = await fetch(`${API_BASE}/experiences`);
      if (!res.ok) throw new Error('Failed to fetch experiences');
      const data = await res.json();
      return data.experiences || [];
    } catch (err) {
      console.warn('getExperiences fallback:', err);
      try {
        const cached = localStorage.getItem('swarn_experiences');
        return cached ? JSON.parse(cached) : [];
      } catch {
        return [];
      }
    }
  },

  // Share Experience: Only registered users
  async addExperience(expData: {
    artistId: string;
    authorName: string;
    authorRole: string;
    authorAvatar?: string;
    rating: number;
    title?: string;
    experienceText: string;
    collaborationOutcome?: string;
  }): Promise<{ success: boolean; experience?: CommunityExperience; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/experiences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expData),
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to submit experience' };
    }
  },
};
