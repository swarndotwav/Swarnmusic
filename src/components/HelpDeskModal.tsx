import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  X,
  Send,
  MessageSquare,
  Sparkles,
  Bot,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';

interface HelpDeskProps {
  userEmail?: string;
  userName?: string;
  onRedirectToPerson?: () => void;
}

interface SupportMessage {
  id: string;
  sender: 'user' | 'shuren';
  text: string;
  time: string;
}

export const HelpDeskModal: React.FC<HelpDeskProps> = ({
  userEmail,
  userName,
  onRedirectToPerson,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>(() => {
    try {
      const saved = localStorage.getItem('swarn_shuren_msgs_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'msg-shuren-welcome',
        sender: 'shuren',
        text: `Hello! I am SHUREN, your assistant on swarnmusic. How can I help you today with your artist portfolio, audio uploads, or connecting with other artists? If you're not getting a solution, click "Redirect To Person" anytime to chat with our platform creator in the inbox.`,
        time: 'Just now',
      },
    ];
  });
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleRedirect = () => {
    setIsOpen(false);
    onRedirectToPerson?.();
  };

  useEffect(() => {
    try {
      localStorage.setItem('swarn_shuren_msgs_v1', JSON.stringify(messages));
    } catch {}
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    const userMsg: SupportMessage = {
      id: `user-msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const lower = userText.toLowerCase();
    const wantsPerson =
      lower.includes('person') ||
      lower.includes('human') ||
      lower.includes('admin') ||
      lower.includes('redirect') ||
      lower.includes('talk to') ||
      lower.includes('no solution') ||
      lower.includes('not working') ||
      lower.includes('contact');

    if (wantsPerson) {
      setTimeout(() => {
        const botReply: SupportMessage = {
          id: `shuren-reply-${Date.now()}`,
          sender: 'shuren',
          text: `I understand you'd like direct personal assistance. Click "Redirect To Person" below to open your Inbox and connect directly with our platform creator!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botReply]);
        setIsTyping(false);
      }, 500);
      return;
    }

    try {
      const result = await api.askShuren(userText);
      const botReply: SupportMessage = {
        id: `shuren-reply-${Date.now()}`,
        sender: 'shuren',
        text: result.reply,
        time: result.timestamp,
      };
      setMessages((prev) => [...prev, botReply]);
      if (!isOpen) {
        setHasUnread(true);
      }
    } catch {
      const fallbackReply: SupportMessage = {
        id: `shuren-reply-${Date.now()}`,
        sender: 'shuren',
        text: 'I am SHUREN. You can register on the registration page, showcase your public portfolio, and connect directly with other music creators! If you need direct assistance, click "Redirect To Person" below.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  return (
    <>
      {/* Floating Action Button - Small, Sleek and Discreet */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mb-3 w-[90vw] sm:w-88 bg-[#FAF7F2] rounded-xl border border-[#E5D9C8] shadow-2xl overflow-hidden flex flex-col h-[440px]"
            >
              {/* Header: SHUREN AI Assistant */}
              <div className="p-3.5 bg-[#7A131B] text-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center font-bold text-xs text-white border border-white/20">
                      <Sparkles size={14} className="text-amber-200" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 border border-[#7A131B] rounded-full" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                      <span>SHUREN</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-white/20 rounded font-normal">AI Support</span>
                    </h4>
                    <p className="text-[10px] text-white/80">swarnmusic Assistant</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-white/80 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close SHUREN chat"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-[#FAF7F2]">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      {!isUser && (
                        <span className="text-[10px] font-bold text-[#7A131B] mb-0.5 ml-1">
                          SHUREN
                        </span>
                      )}
                      <div
                        className={`max-w-[88%] p-2.5 rounded-lg text-xs leading-relaxed ${
                          isUser
                            ? 'bg-[#7A131B] text-white rounded-br-none shadow-xs'
                            : 'bg-white text-stone-900 border border-[#E5D9C8] rounded-bl-none shadow-xs'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                        <span
                          className={`block text-[9px] mt-1 text-right ${
                            isUser ? 'text-white/70' : 'text-stone-600'
                          }`}
                        >
                          {msg.time}
                        </span>
                      </div>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={handleRedirect}
                          className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-[#7A131B] bg-white hover:bg-[#F7EDEE] border border-[#7A131B]/30 rounded-md transition-colors cursor-pointer shadow-2xs active:scale-95 ml-1"
                        >
                          <UserCheck size={11} />
                          <span>Redirect To Person</span>
                        </button>
                      )}
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-600 italic pl-1">
                    <span className="w-1.5 h-1.5 bg-[#7A131B] rounded-full animate-bounce" />
                    <span>SHUREN is thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Option to Redirect to Person if user is not getting solution */}
              <div className="px-3 py-2 bg-amber-500/10 border-t border-[#E5D9C8] flex items-center justify-between gap-2 text-xs">
                <div className="leading-tight">
                  <span className="font-bold text-[#7A131B] block text-[11px]">Not getting a solution?</span>
                  <span className="text-[10px] text-stone-600">Connect directly in your Inbox</span>
                </div>
                <button
                  type="button"
                  onClick={handleRedirect}
                  className="px-2.5 py-1.5 bg-[#7A131B] hover:bg-[#8C1620] text-white text-[11px] font-bold rounded-md shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <UserCheck size={12} />
                  <span>Redirect To Person</span>
                </button>
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-2.5 border-t border-[#E5D9C8] bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask SHUREN anything..."
                  className="flex-1 px-3 py-1.5 bg-[#FAF7F2] border border-[#E5D9C8] rounded-md text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7A131B]"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 bg-[#7A131B] text-white hover:bg-[#8C1620] disabled:opacity-40 rounded-md transition-colors cursor-pointer"
                  aria-label="Send message to SHUREN"
                >
                  <Send size={13} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Small, Sleek Floating Button */}
        <button
          onClick={handleToggle}
          className="relative w-11 h-11 bg-[#7A131B] hover:bg-[#8C1620] text-white rounded-full shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer active:scale-95 flex items-center justify-center border border-white/20"
          aria-label="Open SHUREN Help Assistant"
          title="SHUREN · AI Help Assistant"
        >
          <HelpCircle size={18} />
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
          )}
        </button>
      </div>
    </>
  );
};
