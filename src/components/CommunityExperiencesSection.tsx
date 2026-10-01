import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  Sparkles,
  Send,
  UserCheck,
  CheckCircle,
  Lock,
  Music,
  ArrowRight,
  Heart,
  Quote,
} from 'lucide-react';
import { ArtistProfile, CommunityExperience } from '../types';
import { api } from '../services/api';

interface CommunityExperiencesSectionProps {
  currentUser: ArtistProfile | null;
  onRequireAuth: (mode?: 'login' | 'signup') => void;
  isDarkMode?: boolean;
}

export const CommunityExperiencesSection: React.FC<CommunityExperiencesSectionProps> = ({
  currentUser,
  onRequireAuth,
  isDarkMode = false,
}) => {
  const [experiences, setExperiences] = useState<CommunityExperience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Submission form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [experienceText, setExperienceText] = useState('');
  const [collaborationOutcome, setCollaborationOutcome] = useState('Acoustic Recording & Jamming');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchExperiences = async () => {
    try {
      const data = await api.getExperiences();
      setExperiences(data);
    } catch (err) {
      console.warn('Failed to load experiences', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth('login');
      return;
    }

    if (!experienceText.trim()) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await api.addExperience({
        artistId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        authorAvatar: currentUser.avatar,
        rating,
        title: title.trim() || undefined,
        experienceText: experienceText.trim(),
        collaborationOutcome: collaborationOutcome.trim(),
      });

      if (res.success && res.experience) {
        setExperiences((prev) => [res.experience!, ...prev]);
        setExperienceText('');
        setTitle('');
        setSuccessMessage('Thank you! Your experience has been published and is now visible to everyone.');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage(res.message || 'Failed to submit experience. Please ensure you are signed in.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error publishing experience.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="community-experiences"
      className={`py-14 sm:py-20 border-t transition-colors duration-300 ${
        isDarkMode
          ? 'bg-[#24150E] border-white/10 text-[#FAF5EE]'
          : 'bg-[#F9F6F0] border-[#E5D9C8] text-stone-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#7A131B]/10 text-[#7A131B] border border-[#7A131B]/20">
            <Sparkles size={13} className="liquid-icon" />
            <span>Community Echoes · Artist Experiences</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-display font-bold tracking-tight">
            How Creators Experience swarnmusic
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
            Real stories and collaboration feedback from authentic vocalists, composers, and lyricists.
            Publicly visible to everyone worldwide — shared exclusively by registered community artists.
          </p>
        </div>

        {/* Top Action Box: Share Your Experience (Registered Only) OR Visitor Prompt */}
        <div
          className={`max-w-3xl mx-auto rounded-2xl border p-5 sm:p-7 shadow-sm transition-all ${
            isDarkMode
              ? 'bg-[#2D1A12] border-amber-900/40 text-white'
              : 'bg-white border-[#E5D9C8] text-stone-900'
          }`}
        >
          {currentUser ? (
            /* REGISTERED USER: Active Experience Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-inherit">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#7A131B]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold">{currentUser.name}</h4>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center gap-1 border border-emerald-500/30">
                        <UserCheck size={11} />
                        <span>Registered Creator</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 capitalize">
                      {currentUser.role} on swarnmusic
                    </p>
                  </div>
                </div>

                {/* Star Rating Picker */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-stone-500 mr-1">Your Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-amber-400 hover:scale-115 transition-transform cursor-pointer"
                      title={`${star} Star Rating`}
                    >
                      <Star
                        size={18}
                        className={
                          (hoverRating || rating) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Collaboration Outcome */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Experience Headline
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Collaborated with a classical vocalist on a raga"
                    className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7A131B] border ${
                      isDarkMode
                        ? 'bg-[#3D251A] border-white/20 text-white placeholder:text-stone-400'
                        : 'bg-[#FAF7F2] border-[#DFCFC0] text-stone-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Collaboration Focus
                  </label>
                  <select
                    value={collaborationOutcome}
                    onChange={(e) => setCollaborationOutcome(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7A131B] border ${
                      isDarkMode
                        ? 'bg-[#3D251A] border-white/20 text-white'
                        : 'bg-[#FAF7F2] border-[#DFCFC0] text-stone-900'
                    }`}
                  >
                    <option value="Acoustic Recording & Jamming">Acoustic Recording & Jamming</option>
                    <option value="Melody & Raag Arrangement">Melody & Raag Arrangement</option>
                    <option value="Poetry & Songwriting Exchange">Poetry & Songwriting Exchange</option>
                    <option value="Private 1-to-1 Calling Session">Private 1-to-1 Calling Session</option>
                    <option value="General Platform Experience">General Platform Experience</option>
                  </select>
                </div>
              </div>

              {/* Experience Comment Text */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Share Your Genuine Experience (Visible to Everyone)
                </label>
                <textarea
                  rows={3}
                  required
                  value={experienceText}
                  onChange={(e) => setExperienceText(e.target.value)}
                  placeholder="Tell fellow artists and listeners how swarnmusic helped you connect, compose, or share your musical journey..."
                  className={`w-full px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7A131B] border leading-relaxed ${
                    isDarkMode
                      ? 'bg-[#3D251A] border-white/20 text-white placeholder:text-stone-400'
                      : 'bg-[#FAF7F2] border-[#DFCFC0] text-stone-900'
                  }`}
                />
              </div>

              {/* Feedback messages */}
              {successMessage && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle size={15} />
                  <span>{successMessage}</span>
                </div>
              )}
              {errorMessage && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-lg text-xs text-rose-800 dark:text-rose-200">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-stone-500">
                  Visible publicly to all listeners and creators.
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting || !experienceText.trim()}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] disabled:opacity-50 rounded-full transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
                >
                  <Send size={13} className="liquid-icon" />
                  <span>{isSubmitting ? 'Publishing...' : 'Share Experience'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* NON-REGISTERED VISITOR: Friendly Notice & Register CTA */
            <div className="text-center py-6 px-4 space-y-4">
              <div className="liquid-icon-box w-12 h-12 flex items-center justify-center mx-auto text-[#7A131B]">
                <Quote size={22} />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm sm:text-base font-bold">
                  Have you collaborated or listened on swarnmusic?
                </h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                  Only registered musicians and creators can publish their collaboration experiences, ensuring all reviews are 100% authentic and spam-free.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => onRequireAuth('signup')}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-full transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles size={13} className="liquid-icon" />
                  <span>Register as an Artist to Share</span>
                </button>
                <button
                  onClick={() => onRequireAuth('login')}
                  className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 border border-stone-300 rounded-full bg-white hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Sign In to Your Account
                </button>
              </div>
            </div>
          )}
        </div>

        {/* LIST OF SHARED EXPERIENCES (VISIBLE TO EVERYONE) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between max-w-5xl mx-auto px-1">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
              <MessageSquare size={14} className="text-[#7A131B] liquid-icon" />
              <span>Community Stories ({experiences.length})</span>
            </h3>
            <span className="text-[11px] text-stone-400">Public Community Ledger</span>
          </div>

          {experiences.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-400 max-w-xl mx-auto">
              No experiences shared yet. Be the first registered artist to leave feedback!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all hover:shadow-md ${
                    isDarkMode
                      ? 'bg-[#2D1A12] border-white/10 text-stone-200'
                      : 'bg-white border-[#E5D9C8] text-stone-800'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Author Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            exp.authorAvatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                          }
                          alt={exp.authorName}
                          className="w-10 h-10 rounded-full object-cover border border-[#7A131B]/30"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold truncate max-w-[130px] sm:max-w-[160px]">
                              {exp.authorName}
                            </h4>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Verified Creator" />
                          </div>
                          <span className="text-[10px] text-amber-500 font-semibold uppercase">
                            {exp.authorRole}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={
                              i < exp.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-300'
                            }
                          />
                        ))}
                      </div>
                    </div>

                    {/* Headline */}
                    {exp.title && (
                      <h5 className="text-xs font-bold text-[#7A131B] dark:text-amber-300 leading-snug">
                        "{exp.title}"
                      </h5>
                    )}

                    {/* Comment Text */}
                    <p className="text-xs leading-relaxed font-sans line-clamp-5 whitespace-pre-line text-stone-600 dark:text-stone-300">
                      {exp.experienceText}
                    </p>
                  </div>

                  {/* Footer with Collaboration Focus & Verified Badge */}
                  <div className="pt-3 border-t border-inherit flex items-center justify-between text-[10px] text-stone-400">
                    <span className="font-medium truncate max-w-[170px]">
                      {exp.collaborationOutcome || 'Verified Creator'}
                    </span>
                    <span className="font-mono shrink-0">{exp.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
