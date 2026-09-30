import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  MessageCircle,
  Paperclip,
  Music,
  CheckCheck,
  User,
  Sparkles,
  Phone,
  Mail,
  ChevronLeft,
} from 'lucide-react';
import { ArtistProfile, ArtistRole, ChatMessage, Conversation } from '../types';

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: ArtistProfile;
  targetArtist: ArtistProfile | null;
  conversations: Record<string, Conversation>;
  onSendMessage: (artistId: string, text: string, isInvite?: boolean, inviteData?: any) => void;
  onSelectConversation: (artistId: string) => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetArtist,
  conversations,
  onSendMessage,
  onSelectConversation,
}) => {
  const [inputText, setInputText] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  
  // Project Invite form state
  const [inviteProjectTitle, setInviteProjectTitle] = useState('');
  const [inviteRoleNeeded, setInviteRoleNeeded] = useState<ArtistRole>('composer');
  const [inviteScope, setInviteScope] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeArtistId = targetArtist?.id;
  const currentConversation: Conversation | undefined = activeArtistId
    ? conversations[activeArtistId]
    : undefined;

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeArtistId) return;

    onSendMessage(activeArtistId, inputText.trim());
    setInputText('');
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteProjectTitle.trim() || !activeArtistId) return;

    const messageText = `Project Invitation: "${inviteProjectTitle}" (${inviteRoleNeeded.toUpperCase()})\nScope: ${inviteScope || 'Open discussion for musical collaboration'}`;
    
    onSendMessage(activeArtistId, messageText, true, {
      projectTitle: inviteProjectTitle,
      roleNeeded: inviteRoleNeeded,
      scope: inviteScope,
    });

    setShowInviteForm(false);
    setInviteProjectTitle('');
    setInviteScope('');
  };

  const handleQuickSnippet = (type: string) => {
    if (!activeArtistId) return;
    let snippet = '';
    if (type === 'vocal') {
      snippet = 'I listened to your work on swarnmusic! I have a melody concept in mind. Would you be open to listening to my acoustic scratch take?';
    } else if (type === 'lyrics') {
      snippet = 'I love your writing style and imagery. Would you be interested in penning a couple of verses for an upcoming acoustic project?';
    } else {
      snippet = 'Namaste! Are you currently available for a music collaboration session this month?';
    }
    onSendMessage(activeArtistId, snippet);
  };

  const conversationList = Object.values(conversations);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/60 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl h-[86vh] bg-[#FAF7F2] rounded-xl border border-[#E5D9C8] shadow-2xl overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* LEFT COLUMN: Conversation Threads List (visible on desktop or if no target selected on mobile) */}
        <div
          className={`w-full md:w-80 border-r border-[#E5D9C8] bg-[#F5EFE6] flex flex-col ${
            targetArtist ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* List Header */}
          <div className="p-4 border-b border-[#E5D9C8] flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#7A131B]">
                Private Artist Rooms
              </div>
              <h3 className="text-sm font-bold text-stone-900">Direct Conversations</h3>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-1.5 text-stone-700 hover:text-stone-900 rounded"
            >
              <X size={18} />
            </button>
          </div>

          {/* Threads list */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E5D9C8]/60">
            {conversationList.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-700 space-y-2">
                <MessageCircle size={24} className="mx-auto text-stone-400" />
                <p>No active conversations yet.</p>
                <p>Browse artists on the discovery board and click "Approach in Chat" to start a collaboration!</p>
              </div>
            ) : (
              conversationList.map((conv) => {
                const isSelected = activeArtistId === conv.artistId;
                return (
                  <button
                    key={conv.artistId}
                    onClick={() => onSelectConversation(conv.artistId)}
                    className={`w-full p-3.5 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#FAF7F2] border-l-3 border-[#7A131B]' : 'hover:bg-[#ECE3D6]'
                    }`}
                  >
                    <img
                      src={conv.artistAvatar}
                      alt={conv.artistName}
                      className="w-10 h-10 rounded-full object-cover border border-[#E5D9C8] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900 truncate">
                          {conv.artistName}
                        </span>
                        <span className="text-[10px] font-mono text-stone-700">
                          {conv.lastTimestamp}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#7A131B] capitalize font-medium">
                        {conv.artistRole}
                      </div>
                      <p className="text-xs text-stone-700 truncate mt-0.5">
                        {conv.lastMessage || 'Direct connection established.'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active 1-on-1 Chat Area */}
        <div className={`flex-1 flex flex-col h-full bg-[#FAF7F2] ${!targetArtist ? 'hidden md:flex' : 'flex'}`}>
          {targetArtist ? (
            <>
              {/* Chat Header */}
              <div className="px-5 py-3.5 border-b border-[#E5D9C8] bg-[#F5EFE6] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onSelectConversation('')}
                    className="md:hidden p-1 text-stone-700 hover:text-stone-900"
                    aria-label="Back to conversations"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <img
                    src={targetArtist.avatar}
                    alt={targetArtist.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#7A131B]/30"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-stone-900">{targetArtist.name}</h4>
                      <span className="w-2 h-2 rounded-full bg-emerald-700" title="Online" />
                    </div>
                    <p className="text-[11px] text-[#7A131B] font-medium capitalize">
                      {targetArtist.role} · {targetArtist.location || 'India'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowInviteForm(!showInviteForm)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded transition-colors cursor-pointer shadow-xs"
                  >
                    + Project Invite
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1.5 text-stone-700 hover:text-stone-900 rounded-md hover:bg-[#EAE0D2] transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Project Invite Drawer if open */}
              {showInviteForm && (
                <div className="p-4 bg-[#F5EFE6] border-b border-[#E5D9C8] animate-in slide-in-from-top-2">
                  <form onSubmit={handleSendInvite} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900">
                        Formal Collaboration Proposal
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowInviteForm(false)}
                        className="text-xs text-stone-700 hover:text-stone-900"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-stone-800 mb-0.5">
                          Project / Track Title
                        </label>
                        <input
                          type="text"
                          value={inviteProjectTitle}
                          onChange={(e) => setInviteProjectTitle(e.target.value)}
                          placeholder="e.g. Monsoon Acoustic Ghazal Single"
                          className="w-full px-2.5 py-1.5 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-stone-800 mb-0.5">
                          Skill Desired from {targetArtist.name}
                        </label>
                        <select
                          value={inviteRoleNeeded}
                          onChange={(e) => setInviteRoleNeeded(e.target.value as ArtistRole)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900"
                        >
                          <option value="singer">Vocals / Lead Singer</option>
                          <option value="composer">Composition / Arrangement</option>
                          <option value="lyricist">Poetry / Songwriting</option>
                          <option value="instrumentalist">Instrumental Solo</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-800 mb-0.5">
                        Brief Scope or Vision
                      </label>
                      <input
                        type="text"
                        value={inviteScope}
                        onChange={(e) => setInviteScope(e.target.value)}
                        placeholder="e.g. Need 2 verses and a catchy chorus in 6/8 meter"
                        className="w-full px-2.5 py-1.5 bg-white border border-[#E5D9C8] rounded text-xs text-stone-900"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-[#7A131B] hover:bg-[#8C1620] rounded shadow-xs"
                      >
                        Send Proposal to Chat
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
                {/* Privacy Badge */}
                <div className="text-center my-2">
                  <span className="inline-block px-3 py-1 bg-[#F5EFE6] border border-[#E5D9C8] text-[11px] text-stone-700 rounded-full">
                    🔒 End-to-end artist room completely between {currentUser.name} and {targetArtist.name}
                  </span>
                </div>

                {(!currentConversation || currentConversation.messages.length === 0) ? (
                  <div className="p-8 text-center text-xs text-stone-700 space-y-2">
                    <p className="font-semibold text-stone-800">
                      Start your collaboration with {targetArtist.name}!
                    </p>
                    <p>
                      Share your vision, send an acoustic demo, or ask about their availability.
                    </p>
                  </div>
                ) : (
                  currentConversation.messages.map((msg) => {
                    const isMe = msg.senderId === currentUser.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-lg text-xs leading-relaxed ${
                            isMe
                              ? 'bg-[#7A131B] text-white rounded-br-none shadow-xs'
                              : 'bg-white text-stone-900 border border-[#E5D9C8] rounded-bl-none shadow-xs'
                          }`}
                        >
                          {msg.isInvite && (
                            <div className="mb-1.5 pb-1.5 border-b border-white/20 text-[11px] font-bold text-amber-200 flex items-center gap-1">
                              <Sparkles size={12} />
                              <span>COLLABORATION INVITATION</span>
                            </div>
                          )}
                          <p className="whitespace-pre-line">{msg.text}</p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                              isMe ? 'text-white/70' : 'text-stone-700'
                            }`}
                          >
                            <span>{msg.timestamp}</span>
                            {isMe && <CheckCheck size={12} className="text-white/80" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick suggestion prompt chips */}
              <div className="px-4 py-1.5 bg-[#F5EFE6] border-t border-[#E5D9C8] flex items-center gap-2 overflow-x-auto text-[11px] text-stone-700">
                <span className="font-semibold text-stone-800 shrink-0">Quick Notes:</span>
                <button
                  type="button"
                  onClick={() => handleQuickSnippet('vocal')}
                  className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-[#E5D9C8] rounded-full whitespace-nowrap cursor-pointer"
                >
                  Share acoustic take
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSnippet('lyrics')}
                  className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-[#E5D9C8] rounded-full whitespace-nowrap cursor-pointer"
                >
                  Request lyric verses
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSnippet('availability')}
                  className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-[#E5D9C8] rounded-full whitespace-nowrap cursor-pointer"
                >
                  Ask availability
                </button>
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSend} className="p-3 border-t border-[#E5D9C8] bg-white flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Write a message to ${targetArtist.name}...`}
                  className="flex-1 px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E5D9C8] rounded-md text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 bg-[#7A131B] text-white hover:bg-[#8C1620] disabled:opacity-40 rounded-md transition-colors cursor-pointer"
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          ) : (
            /* No conversation selected on desktop */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <MessageCircle size={36} className="text-stone-300" />
              <h3 className="text-base font-bold text-stone-800">Select an Artist to Begin Chatting</h3>
              <p className="text-xs text-stone-700 max-w-sm">
                Connect directly with composers, singers, and lyricists to produce authentic Indian music.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
