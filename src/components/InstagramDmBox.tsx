import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Search,
  PenSquare,
  MessageCircle,
  Sparkles,
  ExternalLink,
  User,
  Music,
  Phone,
  PhoneCall,
  PhoneOff,
  Video,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  CheckCheck,
  Plus,
  Clock,
  ArrowLeft,
  Share2,
  Users,
  Radio,
  BellRing,
  Image as ImageIcon,
  Trash2,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Download,
} from 'lucide-react';
import { ArtistProfile } from '../types';
import { api } from '../services/api';

export interface DmMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  senderAvatar?: string;
  receiverId: string;
  text: string;
  timestamp: string;
  projectType?: string;
  audioUrl?: string;
  audioDuration?: number;
  imageUrl?: string;
  imageCaption?: string;
}

// Convert AudioBuffer to playable WAV Blob for acoustic voice fallback
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  let sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF identifier
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"

  // fmt chunk
  setUint32(0x20746d66); // "fmt "
  setUint32(16);
  setUint16(1); // PCM
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);

  // data chunk
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);

  const channels: Float32Array[] = [];
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}

// Custom Acoustic Voice Message Bubble Player
const VoiceMessageBubble: React.FC<{
  audioUrl: string;
  duration?: number;
  isCurrentUser: boolean;
  isDarkMode: boolean;
}> = ({ audioUrl, duration = 0, isCurrentUser, isDarkMode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setAudioDuration(Math.round(audio.duration));
      }
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audioRef.current = null;
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Playback error:', e);
      });
    }
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 py-1 min-w-[190px] sm:min-w-[240px]">
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95 cursor-pointer ${
          isCurrentUser
            ? 'bg-white text-[#7A131B] hover:bg-stone-100'
            : 'bg-[#7A131B] text-white hover:bg-[#8C1620]'
        }`}
        title={isPlaying ? 'Pause voice message' : 'Play voice message'}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>

      <div className="flex-1 space-y-1.5 min-w-0">
        {/* Animated sound bars */}
        <div className="flex items-center gap-0.5 sm:gap-1 h-6">
          {[40, 70, 45, 90, 60, 30, 85, 100, 50, 75, 35, 80, 65, 45, 90, 70, 40].map((h, i) => {
            const barProgress = (i / 17) * 100;
            const isPlayed = progress >= barProgress;
            return (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPlayed
                    ? isCurrentUser
                      ? 'bg-white'
                      : 'bg-[#7A131B]'
                    : isCurrentUser
                    ? 'bg-white/40'
                    : isDarkMode
                    ? 'bg-white/20'
                    : 'bg-stone-300'
                } ${isPlaying && isPlayed ? 'animate-pulse' : ''}`}
                style={{ height: `${Math.max(20, h)}%` }}
              />
            );
          })}
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono opacity-80">
          <span>{formatSecs(currentTime)}</span>
          <span>{formatSecs(audioDuration || 0)}</span>
        </div>
      </div>
    </div>
  );
};

export interface DmThread {
  id: string;
  participantIds: string[];
  participants: Record<string, { name: string; avatar?: string; role?: string }>;
  projectType?: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadBy?: string[];
  messages: DmMessage[];
}

interface InstagramDmBoxProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: ArtistProfile | null;
  artists: ArtistProfile[];
  onOpenPortfolio: (artist: ArtistProfile) => void;
  onRequireAuth: (mode?: 'login' | 'signup') => void;
  initialTargetArtist?: ArtistProfile | null;
  isDarkMode?: boolean;
  onActiveChatChange?: (isActive: boolean) => void;
}

interface ActiveCallState {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  callerRole?: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
  receiverRole?: string;
  callType: 'audio' | 'video';
  direction: 'incoming' | 'outgoing';
  status: 'ringing' | 'connected' | 'ended' | 'declined';
  duration: number;
  isMuted: boolean;
  isSpeakerOn: boolean;
  roomUrl: string;
}

export const InstagramDmBox: React.FC<InstagramDmBoxProps> = ({
  isOpen,
  onClose,
  currentUser,
  artists,
  onOpenPortfolio,
  onRequireAuth,
  initialTargetArtist,
  isDarkMode = false,
  onActiveChatChange,
}) => {
  const [threads, setThreads] = useState<DmThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [activePartnerArtist, setActivePartnerArtist] = useState<ArtistProfile | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'chats' | 'people'>('chats');
  
  // Mobile view: 'list' shows conversation/people list, 'chat' shows the chatting background
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  // ONLY notify parent that chat is active when user has explicitly opened someone's message:
  // - A thread or partner artist is selected AND
  // - On mobile: mobileView is 'chat'
  // - On desktop: a conversation is actively open
  const isSomeoneMessageOpen = Boolean(
    isOpen &&
    (selectedThreadId || activePartnerArtist) &&
    (mobileView === 'chat' || (typeof window !== 'undefined' && window.innerWidth >= 768))
  );

  useEffect(() => {
    onActiveChatChange?.(isSomeoneMessageOpen);
  }, [isSomeoneMessageOpen, onActiveChatChange]);

  useEffect(() => {
    return () => {
      onActiveChatChange?.(false);
    };
  }, [onActiveChatChange]);

  // Persistent guest device ID for visitor isolation
  const getGuestDeviceId = (): string => {
    try {
      let gid = localStorage.getItem('swarn_guest_device_id');
      if (!gid) {
        gid = `guest-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('swarn_guest_device_id', gid);
      }
      return gid;
    } catch {
      return 'guest-user';
    }
  };

  const effectiveUserId = currentUser?.id || getGuestDeviceId();

  // Quick Creator Approach Picker Modal state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  // Guest sender name / temporary identity if not logged in
  const [guestName, setGuestName] = useState('');

  // Fullscreen mode state
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);

  // Image & Voice Message States
  const [pendingImage, setPendingImage] = useState<{ dataUrl: string; name: string; isVideo?: boolean } | null>(null);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<{ url: string; caption?: string; isVideo?: boolean } | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ONLINE CALLING SYSTEM STATE
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [audioVolume, setAudioVolume] = useState<number>(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringOscillatorRef = useRef<OscillatorNode | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Web Audio Ringtone Tone
  const playRingtone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      ringOscillatorRef.current = osc;
    } catch {}
  };

  const stopRingtone = () => {
    try {
      if (ringOscillatorRef.current) {
        ringOscillatorRef.current.stop();
        ringOscillatorRef.current.disconnect();
        ringOscillatorRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch {}
  };

  const playChime = (type: 'connect' | 'end') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'connect') {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else {
        osc.frequency.setValueAtTime(783.99, now);
        osc.frequency.setValueAtTime(523.25, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {}
  };

  // Start real microphone audio visualizer
  const setupRealMicrophone = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicStream(stream);

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateAudio = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setAudioVolume(Math.min(100, Math.round((avg / 255) * 100)));
          animationFrameRef.current = requestAnimationFrame(updateAudio);
        };
        updateAudio();
      }
    } catch (e) {
      console.log('Mic access not available or declined, fallback to synthetic voice meter', e);
    }
  };

  // Stop microphone
  const stopMicrophone = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (micStream) {
      micStream.getTracks().forEach((track) => track.stop());
      setMicStream(null);
    }
    setAudioVolume(0);
  };

  // Fetch all threads from the server strictly scoped to current user
  const refreshThreads = async () => {
    try {
      const data = await api.getConnections(effectiveUserId);
      const userOnly = (data || []).filter((t: DmThread) =>
        t.participantIds && t.participantIds.includes(effectiveUserId)
      );
      setThreads(userOnly);

      if (initialTargetArtist && !activePartnerArtist) {
        setActivePartnerArtist(initialTargetArtist);
        setMobileView('chat');
        const matching = userOnly.find((t: DmThread) =>
          t.participantIds?.includes(initialTargetArtist.id)
        );
        if (matching) {
          setSelectedThreadId(matching.id);
        }
      }
      // Note: Do not auto-select thread 0 so users can browse inbox approaches without hiding the dock
    } catch (err) {
      console.warn('Failed to load DM threads:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshThreads();
      const interval = setInterval(refreshThreads, 3000); // Live real-time polling
      return () => clearInterval(interval);
    }
  }, [isOpen, initialTargetArtist, effectiveUserId]);

  useEffect(() => {
    if (initialTargetArtist) {
      setActivePartnerArtist(initialTargetArtist);
      setMobileView('chat');
    }
  }, [initialTargetArtist]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedThreadId, threads, activeCall, mobileView]);

  // Handle Call Timer & State Progression
  useEffect(() => {
    if (!activeCall) return;

    let timerInterval: any;

    if (activeCall.status === 'ringing') {
      playRingtone();
    } else if (activeCall.status === 'connected') {
      timerInterval = setInterval(() => {
        setActiveCall((prev) =>
          prev ? { ...prev, duration: prev.duration + 1 } : null
        );
      }, 1000);
    }

    return () => {
      clearInterval(timerInterval);
      stopRingtone();
    };
  }, [activeCall?.status]);

  if (!isOpen) return null;

  // Selected thread
  const activeThread = threads.find((t) => t.id === selectedThreadId);

  // Determine the display partner for the chatting background
  const getPartnerInfo = (thread: DmThread | null) => {
    if (thread && thread.participants) {
      const otherId = thread.participantIds.find((id) => id !== effectiveUserId) || thread.participantIds[0];
      const part = thread.participants[otherId] || Object.values(thread.participants)[0] || {};
      const matched = artists.find((a) => a.id === otherId);
      return {
        id: otherId,
        name: matched?.name || part.name || 'Artist',
        role: matched?.role || part.role || 'creator',
        avatar:
          matched?.avatar ||
          part.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      };
    }

    if (activePartnerArtist) {
      return {
        id: activePartnerArtist.id,
        name: activePartnerArtist.name,
        role: activePartnerArtist.role,
        avatar: activePartnerArtist.avatar,
      };
    }

    return { id: '', name: 'Artist', role: 'musician', avatar: '' };
  };

  const partnerInfo = getPartnerInfo(activeThread || null);
  const partnerArtistObj =
    artists.find((a) => a.id === partnerInfo.id) || activePartnerArtist;

  // CURRENT APPROACHING USER'S IDENTITY
  const approachingUserName = currentUser ? currentUser.name : (guestName.trim() || 'You (Visitor)');
  const approachedUserName = partnerInfo.name;

  // Filtered threads list (only people approached by or approaching current user)
  const filteredThreads = threads.filter((thread) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const hasMatchInNames = Object.values(thread.participants || {}).some((p) =>
      p.name?.toLowerCase().includes(q)
    );
    const hasMatchInMsg = thread.lastMessage?.toLowerCase().includes(q);
    return hasMatchInNames || hasMatchInMsg;
  });

  // Filtered people / artists list for approach picker
  const filteredArtists = artists.filter((a) => {
    if (!searchQuery.trim() && !pickerSearch.trim()) return true;
    const q = (pickerSearch || searchQuery).toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      (a.stageName || '').toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      a.genre?.some((g) => g.toLowerCase().includes(q))
    );
  });

  // Handle Clicking on ANY person's name to OPEN THE CHATTING BACKGROUND!
  const handleSelectPerson = (artist: ArtistProfile) => {
    setActivePartnerArtist(artist);
    setIsPickerOpen(false);
    setMobileView('chat'); // Immediately open chatting background on mobile

    // Check if an existing thread exists with this artist
    const existing = threads.find((t) => t.participantIds?.includes(artist.id));
    if (existing) {
      setSelectedThreadId(existing.id);
    } else {
      setSelectedThreadId(null); // Fresh chatting background ready for 1-to-1 typing
    }
  };

  // Dispatch message helper for text, voice memos, and images
  const dispatchMessage = async (payload: {
    text?: string;
    audioUrl?: string;
    audioDuration?: number;
    imageUrl?: string;
    imageCaption?: string;
  }) => {
    if (isSending) return;
    const senderId = effectiveUserId;
    const senderName = approachingUserName;
    const senderAvatar = currentUser?.avatar;
    const senderRole = currentUser?.role || 'creator';

    const receiverId = partnerInfo.id || (partnerArtistObj ? partnerArtistObj.id : 'artist-1');
    const receiverName = approachedUserName;
    const receiverAvatar = partnerInfo.avatar || partnerArtistObj?.avatar;
    const receiverRole = partnerInfo.role || partnerArtistObj?.role || 'musician';

    const messageText = payload.text || (payload.audioUrl ? '🎤 Voice message' : (payload.imageUrl ? '📷 Photo' : ''));

    setIsSending(true);

    try {
      if (activeThread) {
        await api.replyConnection(
          activeThread.id,
          senderId,
          senderName,
          messageText,
          {
            audioUrl: payload.audioUrl,
            audioDuration: payload.audioDuration,
            imageUrl: payload.imageUrl,
            imageCaption: payload.imageCaption,
          }
        );
      } else {
        const res = await api.sendConnection({
          senderId,
          senderName,
          senderAvatar,
          senderRole,
          receiverId,
          receiverName,
          receiverAvatar,
          receiverRole,
          projectType: '1-to-1 Approach & Collaboration',
          messageText,
          audioUrl: payload.audioUrl,
          audioDuration: payload.audioDuration,
          imageUrl: payload.imageUrl,
          imageCaption: payload.imageCaption,
        });
        if (res.thread) {
          setSelectedThreadId(res.thread.id);
        }
      }

      await refreshThreads();
    } catch (err) {
      console.warn('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Send 1-to-1 text or pending image message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !pendingImage) || isSending) return;

    if (pendingImage) {
      const img = pendingImage;
      const caption = inputText.trim();
      setPendingImage(null);
      setInputText('');
      await dispatchMessage({
        text: caption || '📷 Photo',
        imageUrl: img.dataUrl,
        imageCaption: caption || undefined,
      });
      return;
    }

    const text = inputText.trim();
    setInputText('');
    await dispatchMessage({ text });
  };

  // Acoustic synthesizer fallback for voice messages if mic is denied/restricted
  const createAcousticVoiceNoteFallback = async () => {
    try {
      const sampleRate = 22050;
      const durationSeconds = 3;
      const numSamples = sampleRate * durationSeconds;
      const offlineCtx = new OfflineAudioContext(1, numSamples, sampleRate);

      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, 0);
      osc.frequency.exponentialRampToValueAtTime(554.37, 1);
      osc.frequency.exponentialRampToValueAtTime(659.25, 2);
      gain.gain.setValueAtTime(0.3, 0);
      gain.gain.exponentialRampToValueAtTime(0.01, durationSeconds);
      osc.connect(gain);
      gain.connect(offlineCtx.destination);
      osc.start(0);
      osc.stop(durationSeconds);

      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = audioBufferToWavBlob(renderedBuffer);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        dispatchMessage({
          text: '🎤 Voice message (Acoustic audio)',
          audioUrl: base64,
          audioDuration: 3,
        });
      };
      reader.readAsDataURL(wavBlob);
    } catch (e) {
      console.warn('Fallback voice synth error:', e);
    }
  };

  // Start Voice Recording
  const startVoiceRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone not supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(100);
      setIsRecordingVoice(true);
      setRecordingDuration(0);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone error or permission denied, using acoustic fallback:', err);
      await createAcousticVoiceNoteFallback();
    }
  };

  // Cancel Voice Recording
  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach((track) => track.stop());
      recordingStreamRef.current = null;
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecordingVoice(false);
    setRecordingDuration(0);
  };

  // Finish and send voice recording
  const finishAndSendVoiceRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      setIsRecordingVoice(false);
      return;
    }

    const duration = recordingDuration;

    mediaRecorderRef.current.onstop = () => {
      const mime = mediaRecorderRef.current?.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { type: mime });
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        await dispatchMessage({
          text: '🎤 Voice message',
          audioUrl: base64Audio,
          audioDuration: duration || 1,
        });
      };
      reader.readAsDataURL(audioBlob);

      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach((track) => track.stop());
        recordingStreamRef.current = null;
      }
    };

    try {
      mediaRecorderRef.current.stop();
    } catch {}
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecordingVoice(false);
    setRecordingDuration(0);
  };

  // Handle Image or Video File picked
  const handleImageFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        setPendingImage({
          dataUrl: src,
          name: file.name,
          isVideo: true,
        });
      };
      reader.readAsDataURL(file);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setPendingImage({
            dataUrl: compressedDataUrl,
            name: file.name,
            isVideo: false,
          });
        } else {
          setPendingImage({
            dataUrl: src,
            name: file.name,
            isVideo: false,
          });
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // INITIATE ONLINE CALL SERVICE
  const handleStartOnlineCall = async (callType: 'audio' | 'video' = 'audio', simulateIncoming = false) => {
    const callerId = simulateIncoming 
      ? (partnerInfo.id || 'caller-artist')
      : (currentUser ? currentUser.id : `guest-${Date.now().toString().slice(-4)}`);
    const callerName = simulateIncoming ? approachedUserName : approachingUserName;
    const callerAvatar = simulateIncoming ? partnerInfo.avatar : currentUser?.avatar;
    const callerRole = simulateIncoming ? partnerInfo.role : (currentUser?.role || 'creator');

    const receiverId = simulateIncoming
      ? (currentUser ? currentUser.id : 'you')
      : (partnerInfo.id || 'receiver-artist');
    const receiverName = simulateIncoming ? approachingUserName : approachedUserName;
    const receiverAvatar = simulateIncoming ? currentUser?.avatar : partnerInfo.avatar;
    const receiverRole = simulateIncoming ? currentUser?.role : partnerInfo.role;

    // Call server to initiate online calling session
    const res = await api.initiateCall({
      callerId,
      callerName,
      callerAvatar,
      receiverId,
      receiverName,
      receiverAvatar,
      callType,
    });

    const callId = res.call?.callId || `call-${Date.now()}`;
    const roomUrl = res.call?.roomUrl || `https://meet.jit.si/swarnmusic-${callerId}-${receiverId}`;

    setActiveCall({
      callId,
      callerId,
      callerName,
      callerAvatar,
      callerRole,
      receiverId,
      receiverName,
      receiverAvatar,
      receiverRole,
      callType,
      direction: simulateIncoming ? 'incoming' : 'outgoing',
      status: 'ringing',
      duration: 0,
      isMuted: false,
      isSpeakerOn: true,
      roomUrl,
    });
  };

  // CALL ANSWER BUTTON HANDLER (WHILE SOMEONE IS CALLING)
  const handleAnswerCall = async () => {
    if (!activeCall) return;

    stopRingtone();
    playChime('connect');
    await setupRealMicrophone();

    await api.respondCall(activeCall.callId, 'accept');

    setActiveCall((prev) =>
      prev ? { ...prev, status: 'connected', duration: 1 } : null
    );
  };

  // CALL REJECT BUTTON HANDLER (WHILE SOMEONE IS CALLING)
  const handleRejectCall = async () => {
    if (!activeCall) return;

    stopRingtone();
    playChime('end');

    await api.respondCall(activeCall.callId, 'decline');

    const logText = `📞 Call Rejected / Declined · by ${approachingUserName}`;

    const senderId = currentUser ? currentUser.id : 'responder';
    const senderName = approachingUserName;

    try {
      if (activeThread) {
        await api.replyConnection(activeThread.id, senderId, senderName, logText);
      }
    } catch {}

    setActiveCall(null);
    refreshThreads();
  };

  // END ACTIVE ONLINE CALL
  const handleEndOnlineCall = async () => {
    if (!activeCall) return;

    stopRingtone();
    stopMicrophone();
    playChime('end');

    await api.respondCall(activeCall.callId, 'end');

    const durationText =
      activeCall.duration > 0
        ? `${Math.floor(activeCall.duration / 60)}m ${activeCall.duration % 60}s`
        : 'Ended';

    const logText = `📞 Online ${
      activeCall.callType === 'video' ? 'Video' : 'Voice'
    } Call ended · Duration: ${durationText} · ${approachingUserName} ➔ ${approachedUserName}`;

    const senderId = currentUser ? currentUser.id : 'caller';
    const senderName = approachingUserName;

    try {
      if (activeThread) {
        await api.replyConnection(activeThread.id, senderId, senderName, logText);
      }
    } catch {}

    setActiveCall(null);
    refreshThreads();
  };

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const hasSelectedPerson = !!(activeThread || partnerArtistObj);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-2 md:p-4 bg-stone-900/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className={`${
          isChatFullscreen
            ? 'w-full h-full max-w-none rounded-none border-0'
            : 'w-full max-w-5xl h-[100dvh] sm:h-[88vh] rounded-none sm:rounded-2xl border-0 sm:border shadow-2xl'
        } overflow-hidden flex flex-col relative transition-all duration-200 ${
          isDarkMode
            ? 'bg-[#2D1A12] border-amber-900/40 text-[#FAF5EE]'
            : 'bg-[#FAF7F2] border-[#DFCFC0] text-stone-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP BAR: APPROACH Box Header */}
        <header
          className={`px-4 sm:px-5 py-3 border-b flex items-center justify-between shrink-0 transition-colors ${
            isDarkMode
              ? 'bg-[#24150E] border-white/10 text-[#FAF5EE]'
              : 'bg-[#FAF7F2] border-[#E5D9C8] text-stone-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {/* 120% Translucent Liquid Send Icon */}
            <div className="liquid-icon-box w-8 h-8 flex items-center justify-center text-[#7A131B]">
              <Send size={15} className="rotate-[-20deg]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold tracking-tight font-classical">
                  APPROACH
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#EFE7DC] text-[#7A131B] rounded-full border border-[#DFCFC0]">
                  1-to-1 Chat & Online Calling
                </span>
              </div>
              {/* Active Approaching Identification in Header */}
              <p className="text-[11px] text-stone-500 hidden sm:flex items-center gap-1.5 font-sans">
                <span>Active User:</span>
                <strong className={isDarkMode ? 'text-amber-300' : 'text-stone-900'}>{approachingUserName}</strong>
                <span>is approaching other creators</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser ? (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="font-semibold">{currentUser.name}</span>
                <span className="text-[10px] text-amber-400 uppercase font-bold">
                  ({currentUser.role})
                </span>
              </div>
            ) : (
              <button
                onClick={() => onRequireAuth('signup')}
                className="hidden sm:inline-flex text-xs font-semibold text-[#7A131B] hover:underline cursor-pointer"
              >
                Sign In to Link Portfolio
              </button>
            )}

            {/* FULL SCREEN TOGGLE (Fits any screen & expands to 100% full screen) */}
            <button
              onClick={() => setIsChatFullscreen(!isChatFullscreen)}
              className="p-1.5 text-stone-400 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              title={isChatFullscreen ? 'Exit Full Screen' : 'Full Screen'}
              aria-label="Toggle Full Screen"
            >
              {isChatFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close APPROACH Box"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* MAIN BODY: Responsive 2-Column Split */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* LEFT SIDEBAR: List of People & Conversations */}
          <aside
            className={`w-full md:w-80 lg:w-96 border-r flex flex-col shrink-0 transition-all duration-200 ${
              isDarkMode
                ? 'bg-[#24150E] border-white/10 text-stone-200'
                : 'bg-[#F5EFE6] border-[#E5D9C8] text-stone-800'
            } ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}
          >
            {/* Search & Navigation Tabs */}
            <div className="p-3.5 border-b border-inherit space-y-2.5">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search creators & chats..."
                  className={`w-full pl-8.5 pr-3 py-1.5 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#7A131B] ${
                    isDarkMode
                      ? 'bg-[#3D251A] border border-white/20 text-white placeholder:text-stone-400'
                      : 'bg-white border border-[#DFCFC0] text-stone-900'
                  }`}
                />
              </div>

              {/* Sidebar Header: Approaches Title & + Approach Button */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <MessageCircle size={14} className="text-[#7A131B] dark:text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Approaches ({threads.length})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsPickerOpen(true);
                    setPickerSearch('');
                  }}
                  className="px-2.5 py-1 bg-[#7A131B] hover:bg-[#8C1620] text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                  title="Approach any registered musician"
                >
                  <Plus size={13} />
                  <span>Approach</span>
                </button>
              </div>
            </div>

            {/* LIST OF APPROACHES (Strictly: only people you approached or who approached you) */}
            <div className="flex-1 overflow-y-auto divide-y divide-inherit relative">
              {filteredThreads.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500">
                    <MessageCircle size={22} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold">No Approaches Yet</p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-[220px] mx-auto leading-relaxed">
                      Your chatting box shows only people you have approached and people who have approached you.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsPickerOpen(true);
                      setPickerSearch('');
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#7A131B] rounded-lg hover:bg-[#8C1620] transition-colors cursor-pointer shadow-xs"
                  >
                    + Approach a Creator
                  </button>
                </div>
              ) : (
                filteredThreads.map((thread) => {
                  const partner = getPartnerInfo(thread);
                  const isSelected = thread.id === selectedThreadId;
                  const youApproached = thread.messages?.[0]?.senderId === effectiveUserId;

                  return (
                    <button
                      key={thread.id}
                      onClick={() => {
                        setSelectedThreadId(thread.id);
                        const matched = artists.find((a) => a.id === partner.id);
                        if (matched) setActivePartnerArtist(matched);
                        setMobileView('chat');
                      }}
                      className={`w-full p-3.5 text-left transition-colors flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? isDarkMode
                            ? 'bg-[#3D251A] border-l-4 border-l-amber-400'
                            : 'bg-[#EAE0D2] border-l-4 border-l-[#7A131B]'
                          : isDarkMode
                          ? 'hover:bg-[#2F1B12]'
                          : 'hover:bg-[#EFE7DC]'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={partner.avatar}
                          alt={partner.name}
                          className="w-11 h-11 rounded-full object-cover border border-white/20"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold truncate">
                            {partner.name}
                          </h4>
                          <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                            {thread.lastTimestamp?.split(',')[0] || 'Today'}
                          </span>
                        </div>

                        {/* Clearly show whether you approached them or they approached you */}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {youApproached ? (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <span>↗</span>
                              <span>You approached</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <span>↙</span>
                              <span>Approached you</span>
                            </span>
                          )}
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-semibold">
                            · {partner.role}
                          </span>
                        </div>

                        <p className="text-xs text-stone-400 truncate mt-1">
                          {thread.lastMessage || 'Click to open conversation'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}

              {/* QUICK CREATOR APPROACH PICKER MODAL OVER SIDEBAR */}
              {isPickerOpen && (
                <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-xs flex flex-col p-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-400" />
                      <span>Approach Any Creator</span>
                    </span>
                    <button
                      onClick={() => setIsPickerOpen(false)}
                      className="p-1 text-stone-400 hover:text-white rounded-full hover:bg-white/10"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="my-2 relative">
                    <Search size={13} className="absolute left-2.5 top-2.5 text-stone-400" />
                    <input
                      type="text"
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      placeholder="Search singer, composer, lyricist..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white/10 text-white placeholder:text-stone-400 text-xs rounded-lg border border-white/15 focus:outline-none"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                    {filteredArtists.length === 0 ? (
                      <div className="text-center py-8 text-xs text-stone-400">
                        No registered creators found.
                      </div>
                    ) : (
                      filteredArtists.map((artist) => (
                        <div
                          key={artist.id}
                          onClick={() => handleSelectPerson(artist)}
                          className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/5 hover:border-white/20 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={artist.avatar}
                              alt={artist.name}
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-white truncate">
                                {artist.name}
                              </h5>
                              <p className="text-[10px] text-amber-300 uppercase font-semibold">
                                {artist.role}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-[#FAF7F2] bg-[#7A131B] px-2 py-1 rounded-md shrink-0">
                            Approach ➔
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* RIGHT / MAIN: THE CHATTING BACKGROUND */}
          <main
            className={`flex-1 flex flex-col overflow-hidden relative transition-colors ${
              isDarkMode ? 'bg-[#2D1A12] text-stone-100' : 'bg-[#FAF7F2] text-stone-900'
            } ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}
          >
            {hasSelectedPerson ? (
              <>
                {/* 1. ABOVE: PERSON NAME + CALLING OPTION + WHO IS APPROACHING WHOM */}
                <div
                  className={`px-4 sm:px-5 py-3 border-b flex items-center justify-between shrink-0 shadow-xs z-10 ${
                    isDarkMode ? 'bg-[#24150E] border-white/10' : 'bg-[#FAF7F2] border-[#E5D9C8]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    {/* Back Button: Exits someone's message to return to message list */}
                    <button
                      onClick={() => {
                        setSelectedThreadId(null);
                        setActivePartnerArtist(null);
                        setMobileView('list');
                      }}
                      className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-white rounded-md hover:bg-stone-200 dark:hover:bg-white/10 transition-colors cursor-pointer mr-1 flex items-center gap-1"
                      title="Back to all messages"
                    >
                      <ArrowLeft size={18} />
                      <span className="hidden sm:inline text-xs font-semibold">Back</span>
                    </button>

                    <div className="relative shrink-0">
                      <img
                        src={partnerInfo.avatar}
                        alt={partnerInfo.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/20"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>

                    <div className="min-w-0">
                      {/* Person Name & Role Badge */}
                      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold truncate">
                          {partnerInfo.name}
                        </h3>

                        {/* Verified Role Tag */}
                        <span className="text-[11px] font-bold text-amber-300 uppercase px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                          {partnerInfo.role}
                        </span>

                        {/* Studio Online Indicator */}
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Active in Studio</span>
                        </span>
                      </div>

                      {/* CLEARLY DISPLAY WHO IS APPROACHING WHOM */}
                      <div className="flex items-center gap-1.5 text-[11px] font-sans mt-0.5">
                        <span className="font-bold text-[#7A131B] bg-amber-400/20 px-1.5 py-0.2 rounded border border-amber-300/30">
                          {approachingUserName} (Approaching)
                        </span>
                        <span className="text-stone-400">➔</span>
                        <span className="font-semibold text-emerald-400">
                          {approachedUserName} ({partnerInfo.role})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Header Options */}
                  <div className="flex items-center gap-2">
                    {partnerArtistObj && (
                      <button
                        onClick={() => onOpenPortfolio(partnerArtistObj)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#7A131B] bg-white border border-[#7A131B]/30 hover:bg-[#F7EDEE] rounded-md transition-colors cursor-pointer shadow-xs"
                      >
                        <span>Portfolio</span>
                        <ExternalLink size={12} className="liquid-icon" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. MIDDLE SCREEN: SPACE TO SEE ALL THE SENT & RECEIVED MESSAGES */}
                <div
                  className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 transition-colors ${
                    isDarkMode ? 'bg-[#2D1A12]' : 'bg-[#FAF7F2]'
                  }`}
                >
                  {/* Informational Approach Banner */}
                  <div
                    className={`p-2.5 rounded-xl text-center text-xs max-w-lg mx-auto shadow-2xs border ${
                      isDarkMode
                        ? 'bg-[#3A2218] border-white/10 text-amber-200'
                        : 'bg-[#F5EFE6] border-[#E5D9C8] text-stone-700'
                    }`}
                  >
                    <span className="font-bold">Active Musical Approach:</span>{' '}
                    <strong className="text-white font-bold">{approachingUserName}</strong> is connecting with <strong className="text-emerald-300 font-bold">{approachedUserName}</strong>. Click <span className="font-bold text-emerald-400">Call</span> above to talk live!
                  </div>

                  {(!activeThread?.messages || activeThread.messages.length === 0) ? (
                    <div className="py-16 text-center space-y-3">
                      <div className="liquid-icon-box w-14 h-14 flex items-center justify-center mx-auto text-[#7A131B]">
                        <MessageCircle size={26} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold">
                          {approachingUserName} approaching {approachedUserName}
                        </h4>
                        <p className="text-xs text-stone-400 max-w-xs mx-auto">
                          Write a message below to start your acoustic collaboration or click Call above.
                        </p>
                      </div>
                    </div>
                  ) : (
                    activeThread.messages.map((msg) => {
                      const isCurrentUser =
                        Boolean(currentUser && msg.senderId === currentUser.id);
                      const isCallEvent = msg.text.startsWith('📞');

                      // Call Log Message
                      if (isCallEvent) {
                        return (
                          <div key={msg.id} className="flex justify-center my-3">
                            <div className="px-4 py-2 bg-white/10 border border-white/15 text-xs font-medium rounded-full shadow-2xs flex items-center gap-2">
                              <Phone size={13} className="text-emerald-400 liquid-icon" />
                              <span>{msg.text}</span>
                              <span className="text-stone-400 font-mono text-[10px]">
                                · {msg.timestamp}
                              </span>
                            </div>
                          </div>
                        );
                      }

                      // Normal Sent & Received Messages
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            isCurrentUser ? 'items-end' : 'items-start'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span className="text-[10px] font-bold">
                              {msg.senderName}
                            </span>
                            {msg.senderRole && (
                              <span className="text-[9px] text-[#7A131B] font-semibold uppercase">
                                · {msg.senderRole}
                              </span>
                            )}
                          </div>

                          {/* Speech Bubble */}
                          <div
                            className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                              isCurrentUser
                                ? 'bg-[#7A131B] text-white rounded-br-xs'
                                : isDarkMode
                                ? 'bg-[#3D251A] text-white border border-white/10 rounded-bl-xs'
                                : 'bg-white text-stone-900 border border-[#E5D9C8] rounded-bl-xs'
                            }`}
                          >
                            {/* 1. Voice Message audio note */}
                            {msg.audioUrl && (
                              <VoiceMessageBubble
                                audioUrl={msg.audioUrl}
                                duration={msg.audioDuration}
                                isCurrentUser={isCurrentUser}
                                isDarkMode={isDarkMode}
                              />
                            )}

                            {/* 2. Image / Video attachment */}
                            {msg.imageUrl && (
                              <div className="space-y-1 mb-1">
                                {msg.imageUrl.startsWith('data:video') || msg.text?.toLowerCase().includes('video') ? (
                                  <video
                                    controls
                                    src={msg.imageUrl}
                                    className="max-h-64 rounded-xl object-contain w-full bg-black/40"
                                  />
                                ) : (
                                  <div
                                    onClick={() => setSelectedLightboxImage({ url: msg.imageUrl!, caption: msg.imageCaption || msg.text })}
                                    className="relative rounded-xl overflow-hidden cursor-pointer group shadow-2xs max-w-sm"
                                  >
                                    <img
                                      src={msg.imageUrl}
                                      alt={msg.imageCaption || 'Photo message'}
                                      className="w-full max-h-64 object-cover rounded-xl group-hover:scale-[1.02] transition-transform duration-200"
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="p-2 bg-black/60 rounded-full text-white">
                                        <Maximize2 size={16} />
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 3. Text content / Caption */}
                            {(!msg.audioUrl || (msg.text && !msg.text.includes('Voice message'))) && (
                              <p className="whitespace-pre-line font-sans">{msg.imageCaption || msg.text}</p>
                            )}

                            <span
                              className={`block text-[9px] mt-1 text-right font-mono ${
                                isCurrentUser ? 'text-white/70' : 'text-stone-400'
                              }`}
                            >
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* 3. EXPANDED CHATTING FEATURES: Quick Collaboration Starters & Composer */}
                <div
                  className={`border-t transition-colors ${
                    isDarkMode ? 'bg-[#24150E] border-white/10' : 'bg-white border-[#E5D9C8]'
                  }`}
                >
                  {/* Pending Image or Video Preview */}
                  {pendingImage && (
                    <div className="px-4 py-2 border-b border-inherit bg-black/5 dark:bg-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {pendingImage.isVideo ? (
                          <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center text-white shrink-0">
                            <Video size={20} />
                          </div>
                        ) : (
                          <img
                            src={pendingImage.dataUrl}
                            alt="Attachment preview"
                            className="w-12 h-12 object-cover rounded-lg border border-white/20 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate max-w-xs">{pendingImage.name}</p>
                          <span className="text-[10px] text-stone-500">Ready to send · add caption below</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPendingImage(null)}
                        className="p-1.5 text-stone-400 hover:text-red-500 rounded-full hover:bg-stone-200 dark:hover:bg-white/10 cursor-pointer"
                        title="Remove attachment"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {/* Quick Musical Collaboration Starters */}
                  <div className="px-3 pt-2 pb-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
                    <span className="text-stone-400 font-bold shrink-0 text-[10px] uppercase tracking-wider pl-1">
                      Quick Pitch:
                    </span>
                    {[
                      { icon: '🎶', text: 'Would love to record vocal stems on your composition' },
                      { icon: '📜', text: 'I wrote an original nazm/lyrics that fits your style' },
                      { icon: '🎹', text: 'Can you arrange harmonium & acoustic chords for this track?' },
                      { icon: '🎻', text: 'Let’s compose a fusion piece based on Raga Yaman' },
                      { icon: '🎧', text: 'Sending you a 90 BPM acoustic demo track' },
                    ].map((starter, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setInputText(starter.text)}
                        className="shrink-0 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-white/10 hover:bg-[#7A131B]/15 hover:text-[#7A131B] text-stone-700 dark:text-stone-200 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        <span>{starter.icon}</span>
                        <span className="max-w-44 truncate">{starter.text}</span>
                      </button>
                    ))}
                  </div>

                  {/* Message Composer Form with 2 New Icons Beside Send */}
                  <form
                    onSubmit={handleSendMessage}
                    className="p-2 sm:p-3 pt-1.5 flex items-center gap-1.5 sm:gap-2"
                  >
                    {!currentUser && (
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Your Name"
                        className={`w-20 sm:w-28 px-2.5 py-2 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#7A131B] ${
                          isDarkMode
                            ? 'bg-[#3D251A] border border-white/20 text-white'
                            : 'bg-[#FAF7F2] border border-[#DFCFC0] text-stone-900'
                        }`}
                      />
                    )}

                    {/* Quick Reaction Emoji Bar */}
                    <div className="hidden md:flex items-center gap-1 shrink-0">
                      {['🎵', '✨', '👏', '🙏', '❤️', '🔥'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setInputText((prev) => prev + emoji)}
                          className="w-7 h-7 rounded-full hover:bg-stone-200 dark:hover:bg-white/15 flex items-center justify-center text-sm transition-transform active:scale-125 cursor-pointer"
                          title={`Insert ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {/* Writing Space or Live Recording Waveform */}
                    {isRecordingVoice ? (
                      <div className="flex-1 flex items-center justify-between px-3 sm:px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-stone-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                          <span className="text-xs font-bold text-red-600 dark:text-red-400">Recording Voice Note</span>
                          <span className="text-xs font-mono font-bold bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded">
                            {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                          </span>
                          {/* Animated Voice Waveform bars */}
                          <div className="hidden sm:flex items-center gap-0.5 h-4 ml-1">
                            {[40, 80, 50, 100, 60, 90, 70, 30].map((h, idx) => (
                              <span
                                key={idx}
                                className="w-1 bg-red-500 rounded-full animate-bounce"
                                style={{
                                  height: `${h}%`,
                                  animationDelay: `${idx * 0.1}s`,
                                  animationDuration: '0.6s',
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={cancelVoiceRecording}
                          className="p-1 text-stone-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-stone-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                          title="Discard voice recording"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={pendingImage ? "Add a caption..." : `Write a message to ${partnerInfo.name}...`}
                        className={`flex-1 px-4 py-2.5 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-[#7A131B] ${
                          isDarkMode
                            ? 'bg-[#3D251A] border border-white/20 text-white placeholder:text-stone-400'
                            : 'bg-[#FAF7F2] border border-[#DFCFC0] text-stone-900'
                        }`}
                      />
                    )}

                    {/* 1. ATTACH IMAGES/VIDEOS ICON (Directly beside Send) */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-stone-600 dark:text-stone-300 hover:text-[#7A131B] dark:hover:text-amber-400 hover:bg-stone-200 dark:hover:bg-white/10 rounded-full transition-all cursor-pointer shadow-2xs shrink-0"
                      title="Send image or video"
                      aria-label="Attach images or videos"
                    >
                      <ImageIcon size={18} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleImageFilePicked}
                      className="hidden"
                    />

                    {/* 2. VOICE MESSAGE RECORD ICON (Directly beside Send) */}
                    <button
                      type="button"
                      onClick={isRecordingVoice ? finishAndSendVoiceRecording : startVoiceRecording}
                      className={`p-2 rounded-full transition-all cursor-pointer shadow-2xs shrink-0 ${
                        isRecordingVoice
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'text-stone-600 dark:text-stone-300 hover:text-[#7A131B] dark:hover:text-amber-400 hover:bg-stone-200 dark:hover:bg-white/10'
                      }`}
                      title={isRecordingVoice ? 'Stop and send voice message' : 'Record voice message'}
                      aria-label="Record voice message"
                    >
                      <Mic size={18} />
                    </button>

                    {/* 3. SEND ICON BUTTON */}
                    <button
                      type="submit"
                      disabled={(!inputText.trim() && !pendingImage && !isRecordingVoice) || isSending}
                      onClick={isRecordingVoice ? (e) => { e.preventDefault(); finishAndSendVoiceRecording(); } : undefined}
                      className="p-2.5 bg-[#7A131B] text-white hover:bg-[#8C1620] disabled:opacity-40 rounded-full transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                      aria-label="Send message"
                      title="Send"
                    >
                      <Send size={15} className="rotate-[-20deg] liquid-icon" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* Empty state if no person clicked yet */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="liquid-icon-box w-16 h-16 flex items-center justify-center text-[#7A131B]">
                  <Send size={28} className="rotate-[-20deg]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold">
                    APPROACH Direct Messaging & Calling
                  </h3>
                  <p className="text-xs text-stone-400 max-w-sm">
                    Click any person's name on the left to see who is approaching whom, exchange sent and received messages, and call them directly online.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('people')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  Browse People & Artists
                </button>
              </div>
            )}

            {/* Calling removed per user request */}
          </main>

        </div>
      </div>

      {/* Lightbox modal for previewing clicked photos/videos in full resolution */}
      {selectedLightboxImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[92vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <div className="absolute -top-12 right-0 flex items-center gap-2">
              <a
                href={selectedLightboxImage.url}
                download="swarnmusic-attachment"
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                title="Download"
              >
                <Download size={20} />
              </a>
              <button
                onClick={() => setSelectedLightboxImage(null)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                title="Close preview"
              >
                <X size={20} />
              </button>
            </div>
            {selectedLightboxImage.isVideo || selectedLightboxImage.url.startsWith('data:video') ? (
              <video
                controls
                autoPlay
                src={selectedLightboxImage.url}
                className="max-h-[80vh] max-w-full rounded-xl shadow-2xl"
              />
            ) : (
              <img
                src={selectedLightboxImage.url}
                alt="Full preview"
                className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
              />
            )}
            {selectedLightboxImage.caption && (
              <p className="mt-3 text-sm text-stone-200 text-center max-w-md">
                {selectedLightboxImage.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
