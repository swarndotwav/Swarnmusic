import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  X,
  Send,
  MessageSquare,
  Mail,
  User,
  CheckCircle,
  Sparkles,
  Phone,
  Clock,
  ChevronDown,
} from 'lucide-react';

interface HelpDeskProps {
  userEmail?: string;
  userName?: string;
}

interface SupportMessage {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  time: string;
}

export const HelpDeskModal: React.FC<HelpDeskProps> = ({ userEmail, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<SupportMessage[]>(() => {
    try {
      const saved = localStorage.getItem('swarn_helpdesk_msgs_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'msg-admin-welcome',
        sender: 'admin',
        text: `Hello! I am Sundram, creator of swarnmusic. How can I help you today with your artist portfolio, audio uploads, or collaboration rooms?`,
        time: 'Just now',
      },
    ];
  });
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('swarn_helpdesk_msgs_v1', JSON.stringify(messages));
    } catch {}
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: SupportMessage = {
      id: `user-msg-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = inputText.trim();
    setInputText('');

    // Simulate creator / admin response connected to Sundram
    setTimeout(() => {
      let reply = '';
      const q = currentQuery.toLowerCase();
      if (q.includes('upload') || q.includes('audio') || q.includes('format')) {
        reply = `Thanks for asking! You can upload audio pieces in .mp3, .wav, or .m4a format. You can also pick our built-in acoustic presets (Bansuri, Sitar, Harmonium, Guitar, Tanpura). Let me know if you hit any file limits!`;
      } else if (q.includes('collab') || q.includes('invite') || q.includes('chat')) {
        reply = `Collaboration rooms on swarnmusic are completely 1-on-1 and private between creators. You can click 'Approach' or 'Invite & Chat' on any artist's profile card to send a formal project proposal!`;
      } else if (q.includes('portfolio') || q.includes('profile')) {
        reply = `Your portfolio is public so composers, singers, and lyricists can listen to your works and read reviews. You can customize instruments, gear, languages, and past highlights in 'Edit Profile'.`;
      } else {
        reply = `Thank you for your message! I've received your note directly at sundram230810@gmail.com and will also assist you right here in this chat box.`;
      }

      const adminReply: SupportMessage = {
        id: `admin-reply-${Date.now()}`,
        sender: 'admin',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, adminReply]);
      if (!isOpen) {
        setHasUnread(true);
      }
    }, 1200);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mb-3 w-[92vw] sm:w-96 bg-[#FAF7F2] rounded-xl border border-[#E5D9C8] shadow-2xl overflow-hidden flex flex-col h-[480px]"
            >
              {/* Header */}
              <div className="p-4 bg-[#7A131B] text-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-white border border-white/20">
                      S
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#7A131B] rounded-full" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold leading-tight flex items-center gap-1.5">
                      <span>Sundram</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded font-normal">Creator</span>
                    </h4>
                    <p className="text-[11px] text-white/80">swarnmusic Help Desk</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-white/80 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close Help Desk"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Direct email info strip */}
              <div className="px-4 py-2 bg-[#F5EFE6] border-b border-[#E5D9C8] flex items-center justify-between text-[11px] text-stone-700">
                <span className="flex items-center gap-1.5">
                  <Mail size={12} className="text-[#7A131B]" />
                  <span className="font-mono">sundram230810@gmail.com</span>
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Direct Help
                </span>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF7F2]">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed ${
                          isUser
                            ? 'bg-[#7A131B] text-white rounded-br-none shadow-xs'
                            : 'bg-white text-stone-900 border border-[#E5D9C8] rounded-bl-none shadow-xs'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                        <span
                          className={`block text-[9px] mt-1 text-right ${
                            isUser ? 'text-white/70' : 'text-stone-700'
                          }`}
                        >
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-[#E5D9C8] bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask a question or request help..."
                  className="flex-1 px-3 py-2 bg-[#FAF7F2] border border-[#E5D9C8] rounded-md text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 bg-[#7A131B] text-white hover:bg-[#8C1620] disabled:opacity-40 rounded-md transition-colors cursor-pointer"
                  aria-label="Send message to Sundram"
                >
                  <Send size={14} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Floating Button */}
        <button
          onClick={handleToggle}
          className="group flex items-center gap-2.5 px-4 py-3 bg-[#7A131B] hover:bg-[#8C1620] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-95 border-2 border-white/20"
          aria-label="Open swarnmusic Help Desk"
        >
          <div className="relative">
            <HelpCircle size={20} />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-300 rounded-full animate-ping" />
            )}
          </div>
          <span className="text-xs font-bold tracking-wide">
            {isOpen ? 'Close Help Desk' : 'Help Desk · Chat with Creator'}
          </span>
        </button>
      </div>
    </>
  );
};
