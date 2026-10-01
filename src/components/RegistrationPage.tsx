import React, { useState } from 'react';
import { SwarnLogo } from './SwarnLogo';
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  Music,
  MapPin,
  Sparkles,
  Layers,
  Upload,
  Globe,
  Youtube,
  Instagram,
  Check,
} from 'lucide-react';
import { ArtistProfile, ArtistRole, MusicGenre } from '../types';
import { api } from '../services/api';

interface RegistrationPageProps {
  onSuccess: (user: ArtistProfile) => void;
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
];

const AVAILABLE_GENRES: MusicGenre[] = [
  'Indie Folk & Fusion',
  'Sufi & Ghazal',
  'Hindustani Classical',
  'Carnatic Classical',
  'Cinematic & Ambient',
  'Contemporary Bollywood',
  'Devotional & Spiritual',
  'Acoustic Lo-Fi',
];

export const RegistrationPage: React.FC<RegistrationPageProps> = ({
  onSuccess,
  onNavigateHome,
  onNavigateLogin,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [name, setName] = useState('');
  const [stageName, setStageName] = useState('');
  const [role, setRole] = useState<ArtistRole>('singer');
  const [selectedGenres, setSelectedGenres] = useState<MusicGenre[]>(['Indie Folk & Fusion']);
  const [gmail, setGmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Profile details
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [musicalInfluences, setMusicalInfluences] = useState('');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('2+ years');
  const [instruments, setInstruments] = useState('');
  const [gear, setGear] = useState('');
  const [youtube, setYoutube] = useState('');
  const [instagram, setInstagram] = useState('');
  const [spotify, setSpotify] = useState('');

  // UI States
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleGenre = (genre: MusicGenre) => {
    if (selectedGenres.includes(genre)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter((g) => g !== genre));
      }
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full legal or artist name.');
      return;
    }
    if (!gmail.trim() || !gmail.includes('@')) {
      setErrorMsg('Please provide a valid Gmail or email address.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMsg('Please enter a valid mobile phone number.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const influencesList = musicalInfluences
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const instrumentsList = instruments
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const finalAvatar = customAvatarUrl.trim() || avatar;

      const newArtist: ArtistProfile = {
        id: `artist-${Date.now()}`,
        name: name.trim(),
        stageName: stageName.trim() || undefined,
        role,
        genre: selectedGenres.length > 0 ? selectedGenres : ['Indie Folk & Fusion'],
        email: gmail.trim().toLowerCase(),
        phone: phone.trim(),
        password: password,
        avatar: finalAvatar,
        bio:
          bio.trim() ||
          `Dedicated ${role} exploring acoustic authenticity and musical collaboration on swarnmusic.`,
        musicalInfluences:
          influencesList.length > 0
            ? influencesList
            : ['Indian Classical Heritage', 'Acoustic Folk'],
        location: location.trim() || 'India',
        experienceLevel: experienceLevel || 'Active Creator',
        joinedDate: 'Joined this month',
        totalReviews: 0,
        overallRating: 5.0,
        isOpenForCollaboration: true,
        instrumentsPlayed:
          instrumentsList.length > 0
            ? instrumentsList
            : role === 'singer'
            ? ['Vocals', 'Harmonium']
            : role === 'composer'
            ? ['Keyboard', 'Acoustic Guitar']
            : ['Poetry & Lyrics'],
        languagesSpokenOrWritten: ['English', 'Hindi'],
        equipmentOrSoftware: gear.trim() ? [gear.trim()] : ['Home Studio DAW'],
        socialLinks: {
          youtube: youtube.trim() || undefined,
          instagram: instagram.trim() || undefined,
          spotify: spotify.trim() || undefined,
        },
        works: [],
      };

      // Register via server API so this user is shared with all other users!
      const res = await api.registerArtist(newArtist);

      if (res && res.success && res.user) {
        onSuccess(res.user);
      } else {
        // Fallback to local user
        onSuccess(newArtist);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to complete registration. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden text-stone-900 transition-colors duration-300">
      {/* Liquid Glass Background Ambient Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-[#7A131B]/20 blur-3xl pointer-events-none" />

      {/* Standalone Header with Liquid Glass */}
      <header className="border-b border-white/60 liquid-glass-track px-4 sm:px-8 py-4 relative z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SwarnLogo size="sm" />
            <div>
              <span className="font-display text-xl font-bold tracking-tight text-[#7A131B]">
                swarnmusic
              </span>
              <span className="hidden sm:inline-block ml-3 text-xs text-stone-700 border-l border-[#DFCFC0] pl-3">
                Artist Registration Portal
              </span>
            </div>
          </div>

          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white/70 hover:bg-white border border-white/80 rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Return to Home</span>
          </button>
        </div>
      </header>

      {/* Main Registration Content Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 relative z-10">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 1 ? 'bg-[#7A131B] text-white' : 'bg-emerald-700 text-white'
                }`}
              >
                {step === 1 ? '1' : <Check size={12} />}
              </span>
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                Account & Musical Role
              </span>
            </div>
            <div className="h-0.5 flex-1 mx-4 bg-[#E5D9C8]" />
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 2 ? 'bg-[#7A131B] text-white' : 'bg-[#E5D9C8] text-stone-700'
                }`}
              >
                2
              </span>
              <span
                className={`text-xs font-bold uppercase tracking-wide ${
                  step === 2 ? 'text-stone-800' : 'text-stone-600'
                }`}
              >
                Artistic Portfolio & Bio
              </span>
            </div>
          </div>
        </div>

        {/* Liquid Glass Card Frame */}
        <div className="liquid-glass-card rounded-2xl shadow-2xl p-6 sm:p-10 space-y-8 backdrop-blur-2xl">
          <div className="space-y-2 border-b border-[#E5D9C8] pb-6">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 tracking-tight">
              {step === 1 ? 'Create Your Artist Profile' : 'Customize Your Public Portfolio'}
            </h1>
            <p className="text-sm text-stone-700">
              {step === 1
                ? 'Join verified singers, composers, and lyricists on swarnmusic. Your profile will be instantly visible on the community Discover board.'
                : 'Add your biography, musical influences, instruments, and avatar. You can share your direct portfolio link with anyone.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 font-medium">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: Core Credentials & Role Selection */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              {/* Select Primary Role */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Select Your Primary Musical Role <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'singer',
                      label: 'Singer / Vocalist',
                      desc: 'Record vocals, showcase alaaps, acoustic takes & ragas',
                    },
                    {
                      id: 'composer',
                      label: 'Composer',
                      desc: 'Architect melodies, harmonies, arrangements & soundscapes',
                    },
                    {
                      id: 'lyricist',
                      label: 'Lyricist',
                      desc: 'Pen verses, ghazals, poetic meters & song lyrics',
                    },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as ArtistRole)}
                      className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                        role === r.id
                          ? 'border-[#7A131B] bg-[#F7EDEE] ring-1 ring-[#7A131B]'
                          : 'border-[#DFCFC0] bg-white hover:bg-[#F8F3EC]'
                      }`}
                    >
                      <div className="text-sm font-bold text-stone-900">{r.label}</div>
                      <div className="text-[11px] text-stone-600 mt-1 leading-snug">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Stage Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Full Legal or Real Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DFCFC0] rounded-md text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Stage Name / Moniker <span className="text-stone-600 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    placeholder="e.g. Rahul Alap"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DFCFC0] rounded-md text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                  />
                </div>
              </div>

              {/* Genres */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Musical Genres You Specialize In
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_GENRES.map((g) => {
                    const isSelected = selectedGenres.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGenre(g)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#7A131B] text-white border-[#7A131B]'
                            : 'bg-white text-stone-700 border-[#DFCFC0] hover:bg-[#F2ECE4]'
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact info: Gmail and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Gmail / Email Address <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-stone-600" />
                    <input
                      type="email"
                      required
                      value={gmail}
                      onChange={(e) => setGmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#DFCFC0] rounded-md text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Mobile Phone Number <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-3 text-stone-600" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#DFCFC0] rounded-md text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Create Password <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-stone-600" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-10 py-2.5 bg-white border border-[#DFCFC0] rounded-md text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-stone-600 hover:text-stone-800"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Confirm Password <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-stone-600" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#DFCFC0] rounded-md text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[#E5D9C8]">
                <button
                  type="button"
                  onClick={onNavigateLogin}
                  className="text-xs text-stone-700 hover:text-[#7A131B] font-medium"
                >
                  Already have an account? <span className="font-semibold underline">Sign In</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  Continue to Step 2 →
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Bio, Avatar, Instruments & Influences */}
          {step === 2 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              {/* Avatar Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Select Profile Avatar
                </label>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {AVATAR_PRESETS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setAvatar(url);
                        setCustomAvatarUrl('');
                      }}
                      className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-transform cursor-pointer ${
                        avatar === url && !customAvatarUrl
                          ? 'border-[#7A131B] scale-105 ring-2 ring-[#7A131B]/40'
                          : 'border-[#DFCFC0] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="url"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    placeholder="Or paste custom image URL (https://...)"
                    className="w-full px-3.5 py-2 bg-white border border-[#DFCFC0] rounded-md text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Artistic Biography & Statement
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={`Tell other creators about your style, your vocal training or compositional approach, and what kind of projects you are seeking...`}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DFCFC0] rounded-md text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                />
              </div>

              {/* Musical Influences & Instruments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Musical Influences <span className="text-stone-600 font-normal">(Comma separated)</span>
                  </label>
                  <input
                    type="text"
                    value={musicalInfluences}
                    onChange={(e) => setMusicalInfluences(e.target.value)}
                    placeholder="e.g. Ustad Amir Khan, AR Rahman, Prateek Kuhad"
                    className="w-full px-3.5 py-2 bg-white border border-[#DFCFC0] rounded-md text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Instruments / Software <span className="text-stone-600 font-normal">(Comma separated)</span>
                  </label>
                  <input
                    type="text"
                    value={instruments}
                    onChange={(e) => setInstruments(e.target.value)}
                    placeholder="e.g. Harmonium, Tanpura, Logic Pro, Shure SM7B"
                    className="w-full px-3.5 py-2 bg-white border border-[#DFCFC0] rounded-md text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                  />
                </div>
              </div>

              {/* Location & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Location / City
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mumbai, New Delhi, Bengaluru"
                    className="w-full px-3.5 py-2 bg-white border border-[#DFCFC0] rounded-md text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#DFCFC0] rounded-md text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                  >
                    <option value="1-2 years (Emerging Artist)">1-2 years (Emerging Artist)</option>
                    <option value="3-5 years (Active Performing)">3-5 years (Active Performing)</option>
                    <option value="6+ years (Seasoned Veteran)">6+ years (Seasoned Veteran)</option>
                    <option value="Independent Songwriter">Independent Songwriter</option>
                  </select>
                </div>
              </div>

              {/* Social links */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Social & Streaming Links <span className="text-stone-600 font-normal">(Optional)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="YouTube URL or @handle"
                    className="w-full px-3 py-1.5 bg-white border border-[#DFCFC0] rounded-md text-xs text-stone-900"
                  />
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="Instagram @handle"
                    className="w-full px-3 py-1.5 bg-white border border-[#DFCFC0] rounded-md text-xs text-stone-900"
                  />
                  <input
                    type="text"
                    value={spotify}
                    onChange={(e) => setSpotify(e.target.value)}
                    placeholder="Spotify Artist link"
                    className="w-full px-3 py-1.5 bg-white border border-[#DFCFC0] rounded-md text-xs text-stone-900"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[#E5D9C8]">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 border border-[#DFCFC0] rounded-md bg-white hover:bg-[#F2ECE4]"
                >
                  ← Back to Step 1
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] disabled:opacity-50 rounded-md shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Publishing Portfolio...</span>
                  ) : (
                    <>
                      <span>Complete Registration & Publish Portfolio</span>
                      <CheckCircle size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};
