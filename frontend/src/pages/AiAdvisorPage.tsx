import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  RotateCcw,
  Bot,
  User as UserIcon,
  Zap,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  modelUsed?: string;
}

const STARTER_PROMPTS = [
  {
    title: 'Plan my daily spending',
    prompt: 'Help me make a simple daily spending plan using my recorded income and expenses.',
  },
  {
    title: 'Find ways to save',
    prompt: 'Look at where I spend the most and suggest three simple ways I could save.',
  },
  {
    title: 'Save for something',
    prompt: 'Help me work out how much to save each month for a goal over the next four months.',
  },
  {
    title: 'Review monthly payments',
    prompt: 'Help me decide which monthly payments I still need.',
  },
];

export function AiAdvisorPage() {
  const { user, analytics, currency } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      role: 'model',
      content: `Hi ${user?.name ? user.name.split(' ')[0] : 'there'}! I can help you understand your spending and make a simple plan.

From the activity you've added:
- Spent today: ${currency}${analytics?.todayExpense || 0} of your ${currency}${user?.dailySpendingLimit || 400} daily limit
- Current balance: ${currency}${analytics?.totalBalance?.toLocaleString('en-IN') || '0'}

Ask me about your spending, saving for a goal, or setting a budget. These suggestions are for guidance, not professional financial advice.`,
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelMode, setModelMode] = useState<'standard' | 'fast'>('standard');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (contentToSend?: string) => {
    const text = (contentToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Map to payload structure
      const apiPayload = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.ai.chat(apiPayload, modelMode);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: res.reply,
        timestamp: new Date(),
        modelUsed: res.model,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: 'I could not connect to your money coach just now. Please try again in a moment.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('Clear this chat and start again?')) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: 'model',
          content: 'Chat cleared. What would you like help with?',
          timestamp: new Date(),
          modelUsed: modelMode === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash',
        },
      ]);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 pb-12 max-w-4xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
      {/* Top Banner Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Money coach
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Get suggestions for your budget, daily spending, and savings goals.
            </p>
          </div>
        </div>

        {/* Model Mode Selector & Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setModelMode('standard')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors flex items-center gap-1 ${
                modelMode === 'standard'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Choose more detailed answers"
            >
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Detailed answers</span>
            </button>
            <button
              onClick={() => setModelMode('fast')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors flex items-center gap-1 ${
                modelMode === 'fast'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Choose shorter, quicker answers"
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Quick answers</span>
            </button>
          </div>

          <button
            onClick={handleClearChat}
            className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Clear chat"
            aria-label="Clear chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Chat Thread Area */}
      <div className="flex-1 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden flex flex-col min-h-0">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-sm'
                  }`}
                >
                  {isUser ? (
                    user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed group relative transition-all ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                      : 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60 shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                  {/* Metadata and Copy */}
                  <div
                    className={`flex items-center justify-between gap-2 mt-2 pt-1.5 text-[10px] ${
                      isUser ? 'text-indigo-200' : 'text-slate-400 border-t border-slate-200/50 dark:border-slate-700/50'
                    }`}
                  >
                    <span>
                      {msg.timestamp.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="opacity-0 group-hover:opacity-100 hover:text-slate-700 dark:hover:text-slate-200 transition-opacity flex items-center gap-1"
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-xs bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span>Your money coach is putting together an answer...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Starters Carousel (Only if 1-2 messages) */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-auto flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-medium text-slate-500 shrink-0 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              <span>Try asking:</span>
            </span>
            {STARTER_PROMPTS.map((starter) => (
              <button
                key={starter.title}
                onClick={() => handleSend(starter.prompt)}
                className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 whitespace-nowrap transition-colors shadow-2xs shrink-0"
              >
                {starter.title}
              </button>
            ))}
          </div>
        )}

        {/* Message Input Box */}
        <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your daily spending, bills, budget, or savings goals..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-semibold shadow-sm shadow-indigo-500/20 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
            <span>Suggestions use the money details you have added.</span>
            <span>Press Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  );
}
