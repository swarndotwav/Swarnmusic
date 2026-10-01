import React, { useState } from 'react';
import { X, Send, Sparkles, CheckCircle2, User, MessageSquare } from 'lucide-react';
import { ArtistProfile } from '../types';
import { api } from '../services/api';

interface ConnectUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetArtist: ArtistProfile | null;
  currentUser: ArtistProfile | null;
  onRequireAuth: (mode?: 'login' | 'signup') => void;
  onOpenChatWithArtist?: (target: ArtistProfile) => void;
}

export const ConnectUserModal: React.FC<ConnectUserModalProps> = ({
  isOpen,
  onClose,
  targetArtist,
  currentUser,
  onRequireAuth,
  onOpenChatWithArtist,
}) => {
  const [projectType, setProjectType] = useState('Original Acoustic Collaboration');
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !targetArtist) return null;

  const isSelf = currentUser && currentUser.id === targetArtist.id;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !currentUser) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.sendConnection({
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        senderRole: currentUser.role,
        receiverId: targetArtist.id,
        receiverName: targetArtist.name,
        receiverAvatar: targetArtist.avatar,
        receiverRole: targetArtist.role,
        projectType,
        messageText: messageText.trim(),
      });

      if (res.success) {
        setIsSent(true);
        setTimeout(() => {
          if (onOpenChatWithArtist) {
            onOpenChatWithArtist(targetArtist);
          }
        }, 1500);
      } else {
        setErrorMsg(res.message || 'Failed to send connection message');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error sending proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-[#FAF7F2] rounded-xl border border-[#E5D9C8] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5D9C8] bg-[#F5EFE6]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7A131B]" />
            <h3 className="text-sm font-bold text-stone-900">
              Connect with {targetArtist.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-700 hover:text-stone-900 rounded hover:bg-[#EBE2D5] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Target Artist Card */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-[#F5EFE6] border border-[#E5D9C8]">
            <img
              src={targetArtist.avatar}
              alt={targetArtist.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#7A131B]/30"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-stone-900 truncate">
                {targetArtist.name}
              </h4>
              <p className="text-xs text-[#7A131B] font-semibold capitalize">
                {targetArtist.role} · {targetArtist.genre?.join(', ')}
              </p>
              <p className="text-[11px] text-stone-600 line-clamp-1 mt-0.5">
                {targetArtist.bio}
              </p>
            </div>
          </div>

          {/* If user is trying to connect to themselves */}
          {isSelf ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800 text-center">
              This is your own artist profile card. You are already connected to your portfolio!
            </div>
          ) : !currentUser ? (
            /* If user is not logged in */
            <div className="p-6 bg-white border border-[#E5D9C8] rounded-lg text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#F7EDEE] text-[#7A131B] mx-auto flex items-center justify-center">
                <User size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-stone-900">
                  Join swarnmusic to Connect
                </h4>
                <p className="text-xs text-stone-700 max-w-sm mx-auto">
                  To send a collaboration invite or message to {targetArtist.name}, please sign in or register your public portfolio.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => onRequireAuth('login')}
                  className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 border border-[#DFCFC0] rounded-md bg-[#FAF7F2] hover:bg-[#F2ECE4] cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onRequireAuth('signup')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded-md transition-colors cursor-pointer"
                >
                  Register as Artist
                </button>
              </div>
            </div>
          ) : isSent ? (
            /* Success confirmation */
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-3">
              <CheckCircle2 size={36} className="text-emerald-700 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-900">
                Connection Request Sent!
              </h4>
              <p className="text-xs text-emerald-800 max-w-xs mx-auto">
                Your message has been delivered to {targetArtist.name}. When they open their inbox, they will see your invitation.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 text-xs font-semibold text-emerald-900 bg-white border border-emerald-300 rounded hover:bg-emerald-100 cursor-pointer"
              >
                Close Window
              </button>
            </div>
          ) : (
            /* Proposal Form */
            <form onSubmit={handleSend} className="space-y-4">
              {errorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Collaboration Focus
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DFCFC0] rounded-md text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                >
                  <option value="Original Acoustic Collaboration">Original Acoustic Collaboration</option>
                  <option value="Vocal Recording & Alaap Session">Vocal Recording & Alaap Session</option>
                  <option value="Melody Composition & Arrangement">Melody Composition & Arrangement</option>
                  <option value="Lyric Writing & Ghazal Verses">Lyric Writing & Ghazal Verses</option>
                  <option value="Direct Artist Greeting & Introduction">Direct Artist Greeting & Introduction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Your Message to {targetArtist.name}
                </label>
                <textarea
                  rows={4}
                  required
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Hello ${targetArtist.name}, I am a ${currentUser.role} on swarnmusic. I loved your musical style and would like to collaborate...`}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DFCFC0] rounded-md text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[#E5D9C8]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !messageText.trim()}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] disabled:opacity-50 rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>{isSubmitting ? 'Sending...' : 'Send Connection Request'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
