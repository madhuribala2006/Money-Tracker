import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  RotateCcw,
  Maximize2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export function FloatingChatWidget() {
  const { user, currency, setActivePage, activePage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'model',
      content: `Hi ${user?.name ? user.name.split(' ')[0] : 'there'}! I'm your money coach. Need help with today's spending or a recent payment?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If user is already on the dedicated AI advisor page, hide the floating bubble to avoid redundancy
  if (activePage === 'ai-advisor') return null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const newMsgs = [...messages, { role: 'user', content: text }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await api.ai.chat(newMsgs, 'fast');
      setMessages([...newMsgs, { role: 'model', content: res.reply }]);
    } catch (err) {
      setMessages([
        ...newMsgs,
        {
          role: 'model',
          content: 'Sorry, I hit a temporary network hiccup. Please ask again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating Toggle Button */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-700 via-teal-700 to-amber-600 text-white shadow-xl shadow-emerald-900/30 hover:shadow-emerald-900/50 hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Ask the money coach"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-tight">Money coach</span>
        </button>
      ) : (
        /* Floating Chat Panel */
        <div className="w-84 sm:w-96 h-[460px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 px-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-amber-600 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold block leading-tight">Money coach</span>
                <span className="text-[10px] text-indigo-100 block">Simple money suggestions</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setActivePage('ai-advisor');
                }}
                className="p-1 hover:bg-white/20 rounded-md text-white/80 hover:text-white transition-colors"
                title="Expand to Full Page"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-md text-white/80 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      isUser
                        ? 'bg-indigo-600 text-white'
                        : 'bg-violet-600 text-white'
                    }`}
                  >
                    {isUser ? 'U' : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div
                    className={`p-2.5 rounded-xl max-w-[80%] whitespace-pre-wrap leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-200 dark:border-slate-700 shadow-2xs'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-[11px] text-slate-500 p-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick chip prompts */}
          <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[10px] shrink-0">
            <button
              onClick={() => handleSend('How can I save ₹500 more this week?')}
              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 whitespace-nowrap"
            >
              Save ₹500 more
            </button>
            <button
              onClick={() => handleSend('Help me stay within my daily spending limit today')}
              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 whitespace-nowrap"
            >
              Daily spending tip
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your money..."
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
