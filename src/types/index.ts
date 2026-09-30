export type ArtistRole = 'singer' | 'composer' | 'lyricist' | 'instrumentalist';

export type MusicGenre = 
  | 'Indie Folk & Fusion'
  | 'Sufi & Ghazal'
  | 'Hindustani Classical'
  | 'Carnatic Classical'
  | 'Cinematic & Ambient'
  | 'Contemporary Bollywood'
  | 'Devotional & Spiritual'
  | 'Acoustic Lo-Fi';

export interface Review {
  id: string;
  pieceId: string;
  authorName: string;
  authorRole: ArtistRole;
  authorAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface WorkPiece {
  id: string;
  artistId: string;
  title: string;
  roleAttributed: ArtistRole;
  genre: MusicGenre;
  type: 'audio' | 'lyrics' | 'composition';
  description: string;
  // For audio pieces
  audioUrl?: string;
  synthPreset?: 'bansuri' | 'sitar' | 'harmonium' | 'guitar' | 'tanpura' | 'ambient';
  duration?: string;
  // For lyric pieces
  lyricsContent?: string;
  ragaOrMeter?: string;
  // Cover / visual representation
  coverImage?: string;
  createdAt: string;
  ratingsCount: number;
  averageRating: number;
  reviews: Review[];
}

export interface ArtistProfile {
  id: string;
  name: string;
  stageName?: string;
  role: ArtistRole;
  genre: MusicGenre[];
  email: string;
  phone: string;
  password?: string;
  avatar: string;
  bio: string;
  musicalInfluences: string[];
  socialLinks: {
    youtube?: string;
    spotify?: string;
    instagram?: string;
    soundcloud?: string;
    website?: string;
  };
  location?: string;
  experienceLevel?: string;
  joinedDate: string;
  works: WorkPiece[];
  totalReviews: number;
  overallRating: number;
  // Expanded portfolio details
  instrumentsPlayed?: string[];
  languagesSpokenOrWritten?: string[];
  equipmentOrSoftware?: string[];
  achievementsOrAwards?: string[];
  collaborationsHistory?: string[];
  bookingEmailOrContact?: string;
  isOpenForCollaboration?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isInvite?: boolean;
  inviteDetails?: {
    projectTitle: string;
    roleNeeded: ArtistRole;
    scope: string;
  };
}

export interface Conversation {
  artistId: string;
  artistName: string;
  artistRole: ArtistRole;
  artistAvatar: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
}
