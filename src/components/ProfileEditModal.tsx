import React, { useState } from 'react';
import { X, Upload, Save, Music, Youtube, Instagram, Globe, Sparkles, Mic, Sliders, CheckCircle } from 'lucide-react';
import { ArtistProfile, ArtistRole } from '../types';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: ArtistProfile;
  onSaveProfile: (updated: ArtistProfile) => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [stageName, setStageName] = useState(currentUser.stageName || '');
  const [role, setRole] = useState<ArtistRole>(currentUser.role);
  const [location, setLocation] = useState(currentUser.location || '');
  const [experienceLevel, setExperienceLevel] = useState(currentUser.experienceLevel || '');
  const [bio, setBio] = useState(currentUser.bio);
  const [influencesText, setInfluencesText] = useState(currentUser.musicalInfluences.join(', '));
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar);

  // Expanded portfolio fields
  const [instrumentsText, setInstrumentsText] = useState(
    (currentUser.instrumentsPlayed || ['Acoustic Guitar', 'Keyboard / Synth']).join(', ')
  );
  const [languagesText, setLanguagesText] = useState(
    (currentUser.languagesSpokenOrWritten || ['English', 'Hindi', 'Urdu']).join(', ')
  );
  const [equipmentText, setEquipmentText] = useState(
    (currentUser.equipmentOrSoftware || ['Logic Pro X', 'Shure SM7B', 'Apollo Twin']).join(', ')
  );
  const [achievementsText, setAchievementsText] = useState(
    (currentUser.achievementsOrAwards || ['Featured on Independent Music Spotlight 2025']).join('\n')
  );
  const [collaborationsText, setCollaborationsText] = useState(
    (currentUser.collaborationsHistory || ['Collaborated with local indie bands and classical ensembles']).join('\n')
  );
  const [bookingEmail, setBookingEmail] = useState(currentUser.bookingEmailOrContact || currentUser.email);
  const [isOpenForCollab, setIsOpenForCollab] = useState<boolean>(
    currentUser.isOpenForCollaboration !== undefined ? currentUser.isOpenForCollaboration : true
  );

  // Social links
  const [spotify, setSpotify] = useState(currentUser.socialLinks.spotify || '');
  const [youtube, setYoutube] = useState(currentUser.socialLinks.youtube || '');
  const [instagram, setInstagram] = useState(currentUser.socialLinks.instagram || '');
  const [website, setWebsite] = useState(currentUser.socialLinks.website || '');

  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const influences = influencesText.split(',').map((s) => s.trim()).filter(Boolean);
    const instruments = instrumentsText.split(',').map((s) => s.trim()).filter(Boolean);
    const languages = languagesText.split(',').map((s) => s.trim()).filter(Boolean);
    const equipment = equipmentText.split(',').map((s) => s.trim()).filter(Boolean);
    const achievements = achievementsText.split('\n').map((s) => s.trim()).filter(Boolean);
    const collaborations = collaborationsText.split('\n').map((s) => s.trim()).filter(Boolean);

    const updated: ArtistProfile = {
      ...currentUser,
      name: name.trim(),
      stageName: stageName.trim() || undefined,
      role,
      location: location.trim() || undefined,
      experienceLevel: experienceLevel.trim() || undefined,
      bio: bio.trim(),
      musicalInfluences: influences,
      avatar: avatarUrl,
      socialLinks: {
        spotify: spotify.trim() || undefined,
        youtube: youtube.trim() || undefined,
        instagram: instagram.trim() || undefined,
        website: website.trim() || undefined,
      },
      instrumentsPlayed: instruments,
      languagesSpokenOrWritten: languages,
      equipmentOrSoftware: equipment,
      achievementsOrAwards: achievements,
      collaborationsHistory: collaborations,
      bookingEmailOrContact: bookingEmail.trim() || undefined,
      isOpenForCollaboration: isOpenForCollab,
    };

    setTimeout(() => {
      onSaveProfile(updated);
      setIsSaving(false);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-[#FAF7F2] rounded-xl border border-[#E5D9C8] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5D9C8] bg-[#F5EFE6]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7A131B]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Customize Artist Profile & Extended Portfolio
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-700 hover:text-stone-900 rounded-md hover:bg-[#EAE0D2] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-6">
          {/* Avatar upload section */}
          <div className="p-4 bg-[#F5EFE6] rounded-lg border border-[#E5D9C8] flex flex-col sm:flex-row items-center gap-4">
            <img
              src={avatarUrl}
              alt="Avatar preview"
              className="w-20 h-20 rounded-xl object-cover border-2 border-[#7A131B]/40 shadow-sm"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <h4 className="text-xs font-bold text-stone-900">Artist Profile Picture</h4>
              <p className="text-[11px] text-stone-700">
                Upload your custom picture. Displayed across your public portfolio slides and discovery board.
              </p>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#7A131B] bg-white border border-[#7A131B]/40 hover:bg-[#7A131B] hover:text-white rounded cursor-pointer transition-colors">
                <Upload size={13} />
                <span>Upload New Picture</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
              </label>
            </div>

            {/* Availability switch */}
            <div className="flex flex-col items-center sm:items-end justify-center p-2 rounded bg-white border border-[#E5D9C8]">
              <span className="text-[11px] font-semibold text-stone-800 mb-1">Collaboration Status</span>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={isOpenForCollab}
                  onChange={(e) => setIsOpenForCollab(e.target.checked)}
                  className="accent-[#7A131B] w-4 h-4 cursor-pointer"
                />
                <span className={isOpenForCollab ? 'text-emerald-700 font-semibold' : 'text-stone-500'}>
                  {isOpenForCollab ? 'Open for Projects' : 'Currently Busy'}
                </span>
              </label>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-800 mb-1">
                Artist Name <span className="text-[#7A131B]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-800 mb-1">
                Stage Moniker / Title
              </label>
              <input
                type="text"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                placeholder="e.g. Aarav Alap"
                className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
              />
            </div>
          </div>

          {/* Role, Location & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-800 mb-1">
                Primary Musical Discipline
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as ArtistRole)}
                className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
              >
                <option value="singer">Singer / Vocalist</option>
                <option value="composer">Composer / Producer</option>
                <option value="lyricist">Lyricist / Songwriter</option>
                <option value="instrumentalist">Instrumentalist</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-800 mb-1">
                Location / Base City
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai, Delhi, London"
                className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-800 mb-1">
                Experience Level
              </label>
              <input
                type="text"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                placeholder="e.g. 6 years performing"
                className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
              />
            </div>
          </div>

          {/* Biography */}
          <div>
            <label className="block text-xs font-medium text-stone-800 mb-1">
              Biography & Artistic Vision
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell listeners and potential collaborators about your vocal style, musical background, or themes..."
              className="w-full p-3 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
            />
          </div>

          {/* EXPANDED PORTFOLIO SECTIONS */}
          <div className="p-4 bg-[#F5EFE6] rounded-xl border border-[#E5D9C8] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A131B] flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>Expanded Artist Portfolio Details</span>
            </h4>

            {/* Instruments & Languages in 2 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-stone-800 mb-1">
                  Instruments Mastered (comma-separated):
                </label>
                <input
                  type="text"
                  value={instrumentsText}
                  onChange={(e) => setInstrumentsText(e.target.value)}
                  placeholder="e.g. Harmonium, Acoustic Guitar, Piano, Sitar"
                  className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-800 mb-1">
                  Languages for Singing / Writing (comma-separated):
                </label>
                <input
                  type="text"
                  value={languagesText}
                  onChange={(e) => setLanguagesText(e.target.value)}
                  placeholder="e.g. English, Hindi, Urdu, Punjabi, Bengali"
                  className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                />
              </div>
            </div>

            {/* Equipment / DAW & Booking Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-stone-800 mb-1">
                  Studio Setup / DAWs / Gear:
                </label>
                <input
                  type="text"
                  value={equipmentText}
                  onChange={(e) => setEquipmentText(e.target.value)}
                  placeholder="e.g. Logic Pro, Ableton Live, Neumann TLM 103"
                  className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-800 mb-1">
                  Direct Booking / Business Inquiries Contact:
                </label>
                <input
                  type="text"
                  value={bookingEmail}
                  onChange={(e) => setBookingEmail(e.target.value)}
                  placeholder="e.g. booking@artistname.com"
                  className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                />
              </div>
            </div>

            {/* Achievements & Notable Collaborations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-stone-800 mb-1">
                  Notable Achievements / Awards (one per line):
                </label>
                <textarea
                  rows={2}
                  value={achievementsText}
                  onChange={(e) => setAchievementsText(e.target.value)}
                  placeholder="e.g. Winner at State Classical Festival 2024&#10;50k Spotify Monthly Listeners"
                  className="w-full p-2.5 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-800 mb-1">
                  Past Collaboration Highlights (one per line):
                </label>
                <textarea
                  rows={2}
                  value={collaborationsText}
                  onChange={(e) => setCollaborationsText(e.target.value)}
                  placeholder="e.g. Recorded backing vocals for Indie feature film&#10;Composed background score for web series"
                  className="w-full p-2.5 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                />
              </div>
            </div>

            {/* Musical Influences */}
            <div>
              <label className="block text-[11px] font-medium text-stone-800 mb-1">
                Musical Influences (comma-separated):
              </label>
              <input
                type="text"
                value={influencesText}
                onChange={(e) => setInfluencesText(e.target.value)}
                placeholder="e.g. A.R. Rahman, Nusrat Fateh Ali Khan, Madan Mohan, Hans Zimmer"
                className="w-full px-3 py-2 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
              />
            </div>
          </div>

          {/* Social Links Customization */}
          <div className="space-y-3 pt-2 border-t border-[#E5D9C8]">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Social Media & Web Links:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Music size={14} className="text-emerald-700 shrink-0" />
                <input
                  type="url"
                  value={spotify}
                  onChange={(e) => setSpotify(e.target.value)}
                  placeholder="https://spotify.com/artist/..."
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Youtube size={14} className="text-red-700 shrink-0" />
                <input
                  type="url"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="https://youtube.com/@..."
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Instagram size={14} className="text-pink-700 shrink-0" />
                <input
                  type="url"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Globe size={14} className="text-stone-700 shrink-0" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-[#E5D9C8] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Save size={13} />
              <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
