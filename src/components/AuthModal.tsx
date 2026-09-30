import React, { useState } from 'react';
import { X, Mail, Phone, Lock, Eye, EyeOff, Upload, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { ArtistProfile, ArtistRole } from '../types';
import { SwarnLogo } from './SwarnLogo';
import { googleSignIn } from '../services/googleDriveAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: ArtistProfile) => void;
  initialMode?: 'login' | 'signup';
  existingArtists?: ArtistProfile[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signup',
  existingArtists = [],
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Sign up fields
  const [name, setName] = useState('');
  const [stageName, setStageName] = useState('');
  const [role, setRole] = useState<ArtistRole>('singer');
  const [gmail, setGmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [bio, setBio] = useState('');
  const [influencesText, setInfluencesText] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  );

  // Login identifier (Email or Phone)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedId = loginIdentifier.trim();
    if (!trimmedId) {
      setErrorMsg('Please enter your registered Gmail address or mobile phone number.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Look up artist in existingArtists or localStorage
      let allArtists = existingArtists;
      try {
        const saved = localStorage.getItem('swarn_artists_v4');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            allArtists = parsed;
          }
        }
      } catch {}

      const cleanPhoneQuery = trimmedId.replace(/\D/g, '');
      const matchedArtist = allArtists.find((a) => {
        const emailMatch = a.email.toLowerCase() === trimmedId.toLowerCase();
        const phoneMatch = cleanPhoneQuery.length >= 8 && a.phone.replace(/\D/g, '').includes(cleanPhoneQuery);
        return emailMatch || phoneMatch;
      });

      if (!matchedArtist) {
        setIsLoading(false);
        setErrorMsg('No registered artist account found with that email or phone. Please verify your details or switch to the Sign Up tab.');
        return;
      }

      // Check password if set
      if (matchedArtist.password && matchedArtist.password !== loginPassword) {
        setIsLoading(false);
        setErrorMsg('Incorrect password. Please enter the password you registered with.');
        return;
      }

      setIsLoading(false);
      onSuccess(matchedArtist);
      onClose();
    }, 400);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your artist or full name.');
      return;
    }
    if (!gmail.includes('@')) {
      setErrorMsg('Please enter a valid Gmail address (e.g. artist@gmail.com).');
      return;
    }
    if (!phoneNumber || phoneNumber.length < 8) {
      setErrorMsg('Please enter a valid mobile phone number.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    // Check if account already exists with that email
    let allArtists = existingArtists;
    try {
      const saved = localStorage.getItem('swarn_artists_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) allArtists = parsed;
      }
    } catch {}

    const alreadyExists = allArtists.some(
      (a) => a.email.toLowerCase() === gmail.trim().toLowerCase()
    );
    if (alreadyExists) {
      setErrorMsg('An artist account is already registered with this Gmail address. Please switch to the Sign In tab.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const influences = influencesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const resolvedUser: ArtistProfile = {
        id: `artist-${Date.now()}`,
        name: name.trim(),
        stageName: stageName.trim() || undefined,
        role,
        genre:
          role === 'singer'
            ? ['Hindustani Classical', 'Indie Folk & Fusion']
            : role === 'composer'
            ? ['Cinematic & Ambient', 'Indie Folk & Fusion']
            : ['Sufi & Ghazal', 'Indie Folk & Fusion'],
        email: gmail.trim(),
        phone: phoneNumber.trim(),
        password: password,
        avatar: avatarUrl,
        bio:
          bio.trim() ||
          `Dedicated ${role} focused on authentic acoustics, melodic depth, and musical collaboration on swarnmusic.`,
        musicalInfluences:
          influences.length > 0
            ? influences
            : ['Classical Melodies', 'Acoustic Folk', 'Contemporary Ambient'],
        socialLinks: {},
        location: 'India',
        experienceLevel: 'Emerging Artist',
        joinedDate: 'Just now',
        works: [],
        totalReviews: 0,
        overallRating: 5.0,
        isOpenForCollaboration: true,
        instrumentsPlayed:
          role === 'composer'
            ? ['Harmonium', 'Keyboard', 'Acoustic Guitar']
            : role === 'singer'
            ? ['Vocals', 'Tanpura']
            : ['Lyricist Pen', 'Songwriting'],
        languagesSpokenOrWritten: ['English'],
      };

      setIsLoading(false);
      onSuccess(resolvedUser);
      onClose();
    }, 450);
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await googleSignIn();
      if (!res?.user) return;
      const gUser = res.user;
      const email = gUser.email || '';

      // Check if existing artist
      let allArtists = existingArtists;
      try {
        const saved = localStorage.getItem('swarn_artists_v4');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) allArtists = parsed;
        }
      } catch {}

      const found = allArtists.find((a) => a.email.toLowerCase() === email.toLowerCase());
      if (found) {
        onSuccess(found);
        onClose();
        return;
      }

      // If new, create artist profile
      const newUser: ArtistProfile = {
        id: `artist-${Date.now()}`,
        name: gUser.displayName || email.split('@')[0],
        role: 'singer',
        genre: ['Hindustani Classical', 'Indie Folk & Fusion'],
        email: email,
        phone: gUser.phoneNumber || '+91 98765 00000',
        avatar: gUser.photoURL || avatarUrl,
        bio: 'Artist passionate about acoustic melodies, vocal recordings, and creative collaboration on swarnmusic.',
        musicalInfluences: ['Classical Heritage', 'Acoustic Folk'],
        socialLinks: {},
        location: 'India',
        experienceLevel: 'Emerging Artist',
        joinedDate: 'Just now',
        works: [],
        totalReviews: 0,
        overallRating: 5.0,
        isOpenForCollaboration: true,
        instrumentsPlayed: ['Acoustic Guitar', 'Vocals'],
        languagesSpokenOrWritten: ['English'],
      };

      onSuccess(newUser);
      onClose();
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setErrorMsg(err.message || 'Google Sign-In failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-[#FAF7F2] rounded-xl border border-[#E5D9C8] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5D9C8] bg-[#F5EFE6]">
          <div className="flex items-center gap-2">
            <SwarnLogo size="sm" />
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              {mode === 'signup' ? 'Artist Account Registration' : 'Artist Secure Sign-In'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-700 hover:text-stone-900 rounded-md hover:bg-[#EAE0D2] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#E5D9C8] bg-[#F5EFE6]/60 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#FAF7F2] text-[#7A131B] font-bold border-b-2 border-[#7A131B]'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Create Artist Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
              mode === 'login'
                ? 'bg-[#FAF7F2] text-[#7A131B] font-bold border-b-2 border-[#7A131B]'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Sign In with Password
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start gap-2">
              <span className="font-bold">Error:</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'login' ? (
            <div className="space-y-4">
              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white border border-[#D3C7B5] hover:border-[#7A131B] hover:shadow-sm rounded-md text-xs font-semibold text-stone-800 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#E5D9C8]" />
                <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">or sign in with password</span>
                <div className="flex-1 h-px bg-[#E5D9C8]" />
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="p-3 bg-[#F5EFE6] border border-[#E5D9C8] rounded text-xs text-stone-700 space-y-1">
                <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#7A131B]" />
                  <span>Secure Artist Login</span>
                </div>
                <p className="text-[11px] text-stone-700 leading-relaxed">
                  Log in with your registered Gmail address or mobile phone number along with your password.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-800 mb-1 flex items-center gap-1">
                  <Mail size={12} className="text-[#7A131B]" />
                  <span>Gmail Address or Phone Number</span> <span className="text-[#7A131B]">*</span>
                </label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. artist@gmail.com or +91 98765 43210"
                  className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-800 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Lock size={12} className="text-[#7A131B]" />
                    <span>Password</span> <span className="text-[#7A131B]">*</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="text-[10px] text-stone-600 hover:text-stone-900 flex items-center gap-0.5 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff size={11} /> : <Eye size={11} />}
                    <span>{showLoginPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </label>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Your Portfolio'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-stone-700">
                  New to swarnmusic?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMsg('');
                    }}
                    className="text-[#7A131B] font-bold hover:underline cursor-pointer"
                  >
                    Register your public artist portfolio
                  </button>
                </p>
              </div>
            </form>
          </div>
          ) : (
            /* SIGN UP FORM */
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white border border-[#D3C7B5] hover:border-[#7A131B] hover:shadow-sm rounded-md text-xs font-semibold text-stone-800 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>Register with Google Account</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#E5D9C8]" />
                <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">or register with email</span>
                <div className="flex-1 h-px bg-[#E5D9C8]" />
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-4">
              {/* Name & Stage Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-800 mb-1">
                    Full Name / Artist Name <span className="text-[#7A131B]">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ananya Kashyap"
                    className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-800 mb-1">
                    Stage Moniker (Optional)
                  </label>
                  <input
                    type="text"
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    placeholder="e.g. Ananya Sangeet"
                    className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Select Your Primary Role: <span className="text-[#7A131B]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'singer', title: 'Singer', desc: 'Vocalist, Solo, Lead' },
                    { id: 'composer', title: 'Composer', desc: 'Arranger, Beats, Production' },
                    { id: 'lyricist', title: 'Lyricist', desc: 'Poetry, Songwriting, Hooks' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRole(item.id as ArtistRole)}
                      className={`p-2.5 rounded border text-left transition-all cursor-pointer ${
                        role === item.id
                          ? 'border-[#7A131B] bg-[#F7EEEE] text-[#7A131B]'
                          : 'border-[#E5D9C8] bg-white text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.title}</div>
                      <div className="text-[10px] text-stone-700 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Picture Upload */}
              <div>
                <label className="block text-xs font-medium text-stone-800 mb-1">
                  Artist Profile Picture:
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={avatarUrl}
                    alt="Profile preview"
                    className="w-12 h-12 rounded-full object-cover border border-[#E5D9C8]"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <label className="px-3 py-1.5 text-xs text-[#7A131B] bg-white border border-[#E5D9C8] hover:border-[#7A131B] rounded cursor-pointer transition-colors flex items-center gap-1.5">
                    <Upload size={13} />
                    <span>Upload Custom Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Gmail & Phone Number Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-800 mb-1 flex items-center gap-1">
                    <Mail size={12} className="text-[#7A131B]" />
                    <span>Gmail Address</span> <span className="text-[#7A131B]">*</span>
                  </label>
                  <input
                    type="email"
                    value={gmail}
                    onChange={(e) => setGmail(e.target.value)}
                    placeholder="artist@gmail.com"
                    className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-800 mb-1 flex items-center gap-1">
                    <Phone size={12} className="text-[#7A131B]" />
                    <span>Mobile Phone Number</span> <span className="text-[#7A131B]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                    required
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-800 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Lock size={12} className="text-[#7A131B]" />
                      <span>Password</span> <span className="text-[#7A131B]">*</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] text-stone-600 hover:text-stone-900 flex items-center gap-0.5 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={11} /> : <Eye size={11} />}
                      <span>{showPassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-800 mb-1 flex items-center gap-1">
                    <Lock size={12} className="text-[#7A131B]" />
                    <span>Confirm Password</span> <span className="text-[#7A131B]">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                    required
                  />
                </div>
              </div>

              {/* Short Bio */}
              <div>
                <label className="block text-xs font-medium text-stone-800 mb-1">
                  Short Artistic Biography:
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your musical journey, vocal style, compositional philosophy, or lyrical themes..."
                  className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                />
              </div>

              {/* Influences */}
              <div>
                <label className="block text-xs font-medium text-stone-800 mb-1">
                  Musical Influences (comma-separated):
                </label>
                <input
                  type="text"
                  value={influencesText}
                  onChange={(e) => setInfluencesText(e.target.value)}
                  placeholder="e.g. A.R. Rahman, Nusrat Fateh Ali Khan, Hans Zimmer, Madan Mohan"
                  className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>
                    {isLoading ? 'Creating Your Portfolio...' : 'Create Artist Account & Publish Portfolio'}
                  </span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-stone-700">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg('');
                    }}
                    className="text-[#7A131B] font-bold hover:underline cursor-pointer"
                  >
                    Sign in with password
                  </button>
                </p>
              </div>
            </form>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};
