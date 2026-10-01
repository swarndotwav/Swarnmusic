import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const ARTISTS_FILE = path.join(DATA_DIR, 'artists.json');
const CONNECTIONS_FILE = path.join(DATA_DIR, 'connections.json');
const EXPERIENCES_FILE = path.join(DATA_DIR, 'experiences.json');

const DEFAULT_EXPERIENCES = [
  {
    id: 'exp-1',
    artistId: 'artist-1',
    authorName: 'Aarav Sharma',
    authorRole: 'singer',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    title: 'Found an incredible Hindustani classical flutist',
    experienceText: 'swarnmusic is the purest platform for acoustic collaborations. Within 48 hours of publishing my Raag Bhairav alaap, a composer approached me in private chat. We jammed over an online call and recorded our first collaborative Ghazal. No algorithmic spam, only authentic music.',
    collaborationOutcome: 'Recorded 1 Ghazal track & ongoing EP',
    createdAt: 'Yesterday',
    isRegisteredUser: true,
  },
  {
    id: 'exp-2',
    artistId: 'artist-2',
    authorName: 'Meera Nambiar',
    authorRole: 'composer',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    title: 'Direct 1-to-1 approach without middlemen',
    experienceText: 'What sets this apart from typical social apps is the direct approach mechanism. I needed Urdu couplets for a Sufi fusion melody. I filtered by lyricists, listened to their audio stems on their public portfolio, and called them directly. Truly empowering for independent composers!',
    collaborationOutcome: 'Sufi Fusion arrangement completed',
    createdAt: '3 days ago',
    isRegisteredUser: true,
  },
  {
    id: 'exp-3',
    artistId: 'artist-3',
    authorName: 'Kabir Varma',
    authorRole: 'lyricist',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    title: 'Every lyric finally found its melody',
    experienceText: 'As a songwriter, having my verses respected and reviewed with authentic feedback by practicing vocalists was a breath of fresh air. The public portfolio acts as my official music resume now.',
    collaborationOutcome: '2 devotional poems set to tune',
    createdAt: '1 week ago',
    isRegisteredUser: true,
  },
];

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(ARTISTS_FILE)) {
  fs.writeFileSync(ARTISTS_FILE, JSON.stringify([], null, 2), 'utf-8');
}
if (!fs.existsSync(CONNECTIONS_FILE)) {
  fs.writeFileSync(CONNECTIONS_FILE, JSON.stringify({}, null, 2), 'utf-8');
}
if (!fs.existsSync(EXPERIENCES_FILE)) {
  fs.writeFileSync(EXPERIENCES_FILE, JSON.stringify(DEFAULT_EXPERIENCES, null, 2), 'utf-8');
}

function getExperiences(): any[] {
  try {
    const raw = fs.readFileSync(EXPERIENCES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return DEFAULT_EXPERIENCES;
  }
}

function saveExperiences(experiences: any[]): void {
  try {
    fs.writeFileSync(EXPERIENCES_FILE, JSON.stringify(experiences, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving experiences file:', err);
  }
}

// Helpers to read/write JSON safely
function getArtists(): any[] {
  try {
    const raw = fs.readFileSync(ARTISTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading artists file:', err);
    return [];
  }
}

function saveArtists(artists: any[]): void {
  try {
    fs.writeFileSync(ARTISTS_FILE, JSON.stringify(artists, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving artists file:', err);
  }
}

function getConnections(): Record<string, any> {
  try {
    const raw = fs.readFileSync(CONNECTIONS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading connections file:', err);
    return {};
  }
}

function saveConnections(connections: Record<string, any>): void {
  try {
    fs.writeFileSync(CONNECTIONS_FILE, JSON.stringify(connections, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving connections file:', err);
  }
}

// API Routes

// 1. GET /api/artists - List all real registered artists
app.get('/api/artists', (_req: Request, res: Response) => {
  const artists = getArtists();
  res.json({ success: true, artists });
});

// 2. GET /api/artists/:id - Get single artist by ID
app.get('/api/artists/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const artists = getArtists();
  const artist = artists.find((a) => a.id === id || a.email.toLowerCase() === id.toLowerCase());
  if (!artist) {
    return res.status(404).json({ success: false, message: 'Artist not found' });
  }
  res.json({ success: true, artist });
});

// 3. POST /api/auth/register - Register a new artist
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const newArtist = req.body;
    if (!newArtist || !newArtist.name || !newArtist.email || !newArtist.role) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const artists = getArtists();
    const existingIndex = artists.findIndex(
      (a) => a.email.toLowerCase() === newArtist.email.toLowerCase() || (newArtist.id && a.id === newArtist.id)
    );

    if (existingIndex >= 0) {
      // Update existing record
      artists[existingIndex] = { ...artists[existingIndex], ...newArtist };
      saveArtists(artists);
      return res.json({ success: true, user: artists[existingIndex], updated: true });
    }

    const artistRecord = {
      ...newArtist,
      id: newArtist.id || `artist-${Date.now()}`,
      joinedDate: newArtist.joinedDate || 'Recently joined',
      works: newArtist.works || [],
      totalReviews: newArtist.totalReviews || 0,
      overallRating: newArtist.overallRating || 5.0,
      isOpenForCollaboration: newArtist.isOpenForCollaboration ?? true,
    };

    artists.unshift(artistRecord);
    saveArtists(artists);

    res.status(201).json({ success: true, user: artistRecord });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Internal server error registering artist' });
  }
});

// 4. POST /api/auth/login - Sign in with Email/Phone and Password
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Identifier and password required' });
    }

    const artists = getArtists();
    const cleanId = identifier.trim().toLowerCase();
    const artist = artists.find(
      (a) =>
        (a.email && a.email.toLowerCase() === cleanId) ||
        (a.phone && a.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, ''))
    );

    if (!artist) {
      return res.status(404).json({ success: false, message: 'No registered artist found with this email/phone' });
    }

    if (artist.password && artist.password !== password) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    res.json({ success: true, user: artist });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// 5. PUT /api/artists/:id - Update profile
app.put('/api/artists/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const artists = getArtists();
    const index = artists.findIndex((a) => a.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Artist not found' });
    }

    artists[index] = { ...artists[index], ...updates };
    saveArtists(artists);
    res.json({ success: true, artist: artists[index] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

// 6. POST /api/artists/:id/works - Add a musical work
app.post('/api/artists/:id/works', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const work = req.body;
    const artists = getArtists();
    const index = artists.findIndex((a) => a.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Artist not found' });
    }

    const artist = artists[index];
    artist.works = artist.works || [];
    artist.works.unshift({
      ...work,
      id: work.id || `work-${Date.now()}`,
      artistId: id,
      ratingsCount: work.ratingsCount || 0,
      averageRating: work.averageRating || 5.0,
      reviews: work.reviews || [],
      createdAt: 'Just now',
    });

    saveArtists(artists);
    res.status(201).json({ success: true, artist });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add work' });
  }
});

// 7. POST /api/artists/:id/reviews - Add review to piece
app.post('/api/artists/:id/reviews', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { pieceId, rating, comment, authorName, authorRole, authorAvatar } = req.body;
    const artists = getArtists();
    const index = artists.findIndex((a) => a.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Artist not found' });
    }

    const artist = artists[index];
    const piece = (artist.works || []).find((w: any) => w.id === pieceId);
    if (!piece) {
      return res.status(404).json({ success: false, message: 'Work piece not found' });
    }

    piece.reviews = piece.reviews || [];
    piece.reviews.unshift({
      id: `rev-${Date.now()}`,
      pieceId,
      authorName: authorName || 'Fellow Creator',
      authorRole: authorRole || 'musician',
      authorAvatar,
      rating: Number(rating) || 5,
      comment,
      createdAt: 'Just now',
    });

    piece.ratingsCount = piece.reviews.length;
    const sum = piece.reviews.reduce((s: number, r: any) => s + (r.rating || 5), 0);
    piece.averageRating = Number((sum / piece.reviews.length).toFixed(1));

    artist.totalReviews = (artist.totalReviews || 0) + 1;

    saveArtists(artists);
    res.status(201).json({ success: true, artist });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
});

// 8. GET /api/connections - Get chat threads for an individual user (only people he approached or was approached by)
app.get('/api/connections', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      // For every individual user, only show their own approached / approaching threads
      return res.json({ success: true, threads: [] });
    }

    const connections = getConnections();
    const allThreads = Object.values(connections);

    const userThreads = allThreads.filter(
      (thread: any) => thread.participantIds && thread.participantIds.includes(userId)
    );
    return res.json({ success: true, threads: userThreads });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve connections' });
  }
});

// 9. POST /api/connections/send - Send connection proposal / message from User A to User B
app.post('/api/connections/send', (req: Request, res: Response) => {
  try {
    const {
      senderId,
      senderName,
      senderAvatar,
      senderRole,
      receiverId,
      receiverName,
      receiverAvatar,
      receiverRole,
      projectType,
      messageText,
      audioUrl,
      audioDuration,
      imageUrl,
      imageCaption,
    } = req.body;

    if (!senderId || !receiverId || (!messageText && !audioUrl && !imageUrl)) {
      return res.status(400).json({ success: false, message: 'Missing sender, receiver, or message content' });
    }

    const connections = getConnections();
    // Unique deterministic key for 1-on-1 thread
    const threadKey = [senderId, receiverId].sort().join('_');

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });

    const effectiveText = messageText || (audioUrl ? '🎤 Voice message' : (imageUrl ? '📷 Photo' : 'New message'));

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      receiverId,
      text: projectType ? `[Project: ${projectType}]\n${effectiveText}` : effectiveText,
      timestamp,
      audioUrl: audioUrl || undefined,
      audioDuration: audioDuration || undefined,
      imageUrl: imageUrl || undefined,
      imageCaption: imageCaption || undefined,
    };

    if (!connections[threadKey]) {
      connections[threadKey] = {
        id: threadKey,
        participantIds: [senderId, receiverId],
        participants: {
          [senderId]: { name: senderName, avatar: senderAvatar, role: senderRole },
          [receiverId]: { name: receiverName, avatar: receiverAvatar, role: receiverRole },
        },
        projectType: projectType || 'Collaboration Proposal',
        lastMessage: newMsg.text,
        lastTimestamp: timestamp,
        unreadBy: [receiverId],
        messages: [newMsg],
      };
    } else {
      const thread = connections[threadKey];
      thread.messages.push(newMsg);
      thread.lastMessage = newMsg.text;
      thread.lastTimestamp = timestamp;
      if (!thread.unreadBy) thread.unreadBy = [];
      if (!thread.unreadBy.includes(receiverId)) {
        thread.unreadBy.push(receiverId);
      }
    }

    saveConnections(connections);

    // If recipient is a platform artist, schedule an authentic acoustic collaborator reply after 4.5s
    if (receiverId.startsWith('artist-')) {
      const replies: Record<string, string> = {
        'artist-1': `Hey ${senderName}! Loved your approach message. Let's record vocal harmonies on this piece together!`,
        'artist-2': `Namaste ${senderName}! I have an acoustic harmonium & piano arrangement that fits your vibe perfectly.`,
        'artist-3': `Wonderful idea, ${senderName}! I have a couplet of lyrics written that matches this raga beautifully.`,
        'artist-4': `Hey ${senderName}! Let's jam over an online call soon. Love the acoustic direction of this!`,
        'artist-5': `Great connecting, ${senderName}! I'm listening to your musical stems right now, let's collaborate.`,
      };
      const replyText = replies[receiverId] || `Hey ${senderName}! Thanks for reaching out. Let's collaborate on this music project!`;

      setTimeout(() => {
        try {
          const currentConns = getConnections();
          if (currentConns[threadKey]) {
            const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
            const autoMsg = {
              id: `msg-${Date.now()}`,
              senderId: receiverId,
              senderName: receiverName || 'Artist',
              receiverId: senderId,
              text: replyText,
              timestamp: replyTime,
            };
            currentConns[threadKey].messages.push(autoMsg);
            currentConns[threadKey].lastMessage = replyText;
            currentConns[threadKey].lastTimestamp = replyTime;
            if (!currentConns[threadKey].unreadBy) currentConns[threadKey].unreadBy = [];
            if (!currentConns[threadKey].unreadBy.includes(senderId)) {
              currentConns[threadKey].unreadBy.push(senderId);
            }
            saveConnections(currentConns);
          }
        } catch (e) {
          console.warn('Auto reply error:', e);
        }
      }, 4500);
    }

    res.status(201).json({ success: true, thread: connections[threadKey] });
  } catch (err) {
    console.error('Send connection error:', err);
    res.status(500).json({ success: false, message: 'Failed to send connection message' });
  }
});

// 10. POST /api/connections/reply - Reply to an ongoing thread
app.post('/api/connections/reply', (req: Request, res: Response) => {
  try {
    const { threadId, senderId, senderName, text, audioUrl, audioDuration, imageUrl, imageCaption } = req.body;
    if (!threadId || !senderId || (!text && !audioUrl && !imageUrl)) {
      return res.status(400).json({ success: false, message: 'threadId, senderId, and message content (text, audio, or image) are required' });
    }

    const connections = getConnections();
    const thread = connections[threadId];
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    const receiverId = thread.participantIds.find((id: string) => id !== senderId) || '';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });

    const effectiveText = text || (audioUrl ? '🎤 Voice message' : (imageUrl ? '📷 Photo' : ''));

    const replyMsg = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      receiverId,
      text: effectiveText,
      timestamp,
      audioUrl: audioUrl || undefined,
      audioDuration: audioDuration || undefined,
      imageUrl: imageUrl || undefined,
      imageCaption: imageCaption || undefined,
    };

    thread.messages.push(replyMsg);
    thread.lastMessage = effectiveText;
    thread.lastTimestamp = timestamp;
    thread.unreadBy = [receiverId];

    saveConnections(connections);

    // If receiver is a platform artist, schedule an authentic reply back
    if (receiverId.startsWith('artist-')) {
      const replies: Record<string, string> = {
        'artist-1': `Sounds great, ${senderName}! I will record the next vocal take.`,
        'artist-2': `Perfect, ${senderName}! Let's finalize the chord progressions.`,
        'artist-3': `Noted! Writing down the next stanzas for this song right now.`,
        'artist-4': `Agreed, ${senderName}! Looking forward to hearing the mix!`,
        'artist-5': `Awesome! I'll tune the instruments and get back shortly.`,
      };
      const replyText = replies[receiverId] || `Thanks for the update, ${senderName}! Let's make this acoustic masterpiece.`;

      setTimeout(() => {
        try {
          const currentConns = getConnections();
          if (currentConns[threadId]) {
            const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
            const autoMsg = {
              id: `msg-${Date.now()}`,
              senderId: receiverId,
              senderName: thread.participants?.[receiverId]?.name || 'Artist',
              receiverId: senderId,
              text: replyText,
              timestamp: replyTime,
            };
            currentConns[threadId].messages.push(autoMsg);
            currentConns[threadId].lastMessage = replyText;
            currentConns[threadId].lastTimestamp = replyTime;
            if (!currentConns[threadId].unreadBy) currentConns[threadId].unreadBy = [];
            if (!currentConns[threadId].unreadBy.includes(senderId)) {
              currentConns[threadId].unreadBy.push(senderId);
            }
            saveConnections(currentConns);
          }
        } catch (e) {
          console.warn('Auto reply error:', e);
        }
      }, 4500);
    }
    res.json({ success: true, thread });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reply' });
  }
});

// 10b. GET /api/experiences - List all experiences (Visible to everyone)
app.get('/api/experiences', (_req: Request, res: Response) => {
  const experiences = getExperiences();
  res.json({ success: true, experiences });
});

// 10c. POST /api/experiences - Only registered users can share their experience
app.post('/api/experiences', (req: Request, res: Response) => {
  try {
    const { artistId, authorName, authorRole, authorAvatar, rating, title, experienceText, collaborationOutcome } = req.body;
    
    if (!artistId || !experienceText || !experienceText.trim()) {
      return res.status(400).json({ success: false, message: 'Only registered artists can share an experience with valid text.' });
    }

    // Verify artist is registered in the database
    const artists = getArtists();
    const registeredArtist = artists.find((a: any) => a.id === artistId);
    if (!registeredArtist) {
      return res.status(403).json({ success: false, message: 'You must be a registered artist on swarnmusic to share your experience.' });
    }

    const newExperience = {
      id: `exp-${Date.now()}`,
      artistId: registeredArtist.id,
      authorName: registeredArtist.name || authorName,
      authorRole: registeredArtist.role || authorRole || 'singer',
      authorAvatar: registeredArtist.avatar || authorAvatar,
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      title: title?.trim() || 'Acoustic Collaboration Experience',
      experienceText: experienceText.trim(),
      collaborationOutcome: collaborationOutcome?.trim() || 'Verified Artist Community Experience',
      createdAt: 'Just now',
      isRegisteredUser: true,
    };

    const experiences = getExperiences();
    experiences.unshift(newExperience);
    saveExperiences(experiences);

    res.json({ success: true, experience: newExperience });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save experience' });
  }
});

// ONLINE CALLING SERVICE STORE & ROUTES
interface CallSession {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
  callType: 'audio' | 'video';
  status: 'ringing' | 'connected' | 'ended' | 'declined';
  startTime: number;
  roomUrl: string;
  duration?: number;
}

const activeCalls: Record<string, CallSession> = {};

// 11. POST /api/calls/initiate - Initiate online call from one User ID to another User ID
app.post('/api/calls/initiate', (req: Request, res: Response) => {
  try {
    const {
      callerId,
      callerName,
      callerAvatar,
      receiverId,
      receiverName,
      receiverAvatar,
      callType = 'audio',
    } = req.body;

    if (!callerId || !receiverId) {
      return res.status(400).json({ success: false, message: 'callerId and receiverId are required' });
    }

    const safeCaller = String(callerId).replace(/[^a-zA-Z0-9_-]/g, '');
    const safeReceiver = String(receiverId).replace(/[^a-zA-Z0-9_-]/g, '');
    const callId = `call_${Date.now()}_${safeCaller}_${safeReceiver}`;
    const roomKey = [safeCaller, safeReceiver].sort().join('-');
    const roomUrl = `https://meet.jit.si/swarnmusic-${roomKey}`;

    const newCall: CallSession = {
      callId,
      callerId,
      callerName: callerName || 'Artist',
      callerAvatar,
      receiverId,
      receiverName: receiverName || 'Connected Artist',
      receiverAvatar,
      callType: callType === 'video' ? 'video' : 'audio',
      status: 'ringing',
      startTime: Date.now(),
      roomUrl,
    };

    activeCalls[callId] = newCall;
    res.status(201).json({ success: true, call: newCall });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to initiate online call' });
  }
});

// 12. GET /api/calls/active - Get current active or incoming calls for a user
app.get('/api/calls/active', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.json({ success: true, calls: Object.values(activeCalls) });
    }

    const userCalls = Object.values(activeCalls).filter(
      (c) => (c.callerId === userId || c.receiverId === userId) && c.status !== 'ended'
    );
    res.json({ success: true, calls: userCalls });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch active calls' });
  }
});

// 13. POST /api/calls/respond - Respond to or end an online call
app.post('/api/calls/respond', (req: Request, res: Response) => {
  try {
    const { callId, action } = req.body;
    const call = activeCalls[callId];
    if (!call) {
      return res.status(404).json({ success: false, message: 'Call session not found' });
    }

    if (action === 'accept') {
      call.status = 'connected';
    } else if (action === 'decline') {
      call.status = 'declined';
    } else if (action === 'end') {
      call.status = 'ended';
      call.duration = Math.round((Date.now() - call.startTime) / 1000);
    }

    res.json({ success: true, call });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update call status' });
  }
});

// 14. POST /api/shuren/chat - AI Support Bot SHUREN
app.post('/api/shuren/chat', (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const q = (message || '').toLowerCase();

    let reply = '';
    if (q.includes('register') || q.includes('signup') || q.includes('join') || q.includes('create account')) {
      reply = `To join as an artist, click "Register as Artist" in the navigation bar to access our dedicated registration page. You can choose your role (Singer, Composer, or Lyricist), specify your genres, set your password, and immediately publish your public portfolio!`;
    } else if (q.includes('portfolio') || q.includes('link') || q.includes('share')) {
      reply = `Every registered artist on swarnmusic receives a unique public portfolio link (with "?portfolio=[your-id]"). You can click "Share" on your artist card or the "Share Portfolio" button inside your portfolio to copy your link or share directly to WhatsApp and Twitter!`;
    } else if (q.includes('connect') || q.includes('message') || q.includes('chat') || q.includes('collaborate')) {
      reply = `You can connect with any artist directly! Browse the Discover board, find a singer, composer, or lyricist you'd like to work with, and click "Approach & Connect". Select your project type and send a proposal. When they log in, they will receive your message in their Connections inbox.`;
    } else if (q.includes('community') || q.includes('instagram')) {
      reply = `You can join our official community page on Instagram at: https://www.instagram.com/swarn.wav?stkn=MWpmMjR2OTVzOWdkMw==`;
    } else if (q.includes('upload') || q.includes('audio') || q.includes('lyrics')) {
      reply = `Registered artists can upload vocal takes, compositions, and lyrics using the "Upload Work" button in the navigation header. You can attach audio recordings (.mp3, .wav) or select one of our acoustic melodic presets (Bansuri, Sitar, Harmonium, Guitar, Tanpura).`;
    } else {
      reply = `Hello! I am SHUREN, your assistant on swarnmusic. I can guide you with registering your public portfolio, sharing your portfolio link, uploading musical pieces, and connecting directly with singers, composers, and lyricists!`;
    }

    res.json({
      success: true,
      botName: 'SHUREN',
      reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'SHUREN service error' });
  }
});

// Front-end integration: static files in prod if dist exists, otherwise Vite middleware
async function startServer() {
  const distPath = path.join(__dirname, 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');
  const hasDist = fs.existsSync(indexHtmlPath);

  // Health check routes for Cloud Run container monitoring
  app.get(['/healthz', '/api/health'], (_req: Request, res: Response) => {
    res.status(200).send('OK');
  });

  if (process.env.NODE_ENV === 'production' || hasDist) {
    if (hasDist) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(indexHtmlPath);
      });
    } else {
      app.get('*', (_req: Request, res: Response) => {
        res.status(200).send('<!DOCTYPE html><html><head><title>swarnmusic</title></head><body><h1>swarnmusic</h1><p>Building client bundle...</p></body></html>');
      });
    }
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`swarnmusic server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
