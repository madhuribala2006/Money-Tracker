import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function HelpSupportPage() {
  const { user } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const faqs = [
    {
      q: 'How do I change my daily spending alert?',
      a: 'Open Settings and update your daily spending limit. The dashboard compares your recorded spending for today with that limit.',
    },
    {
      q: 'When will I get a spending limit warning?',
      a: 'You will see a warning when you reach the percentage you chose for that spending limit. You will see an alert if you go over the limit.',
    },
    {
      q: 'How does "Mark Paid" work on bills?',
      a: 'Choosing "Mark Paid" updates the bill and adds that payment to your spending, so your balance and reports stay up to date.',
    },
    {
      q: 'Can I download my activity?',
      a: 'Yes. Open Money activity and choose Download list. You can open the file in a spreadsheet app.',
    },
    {
      q: 'Is this a real bank account?',
      a: 'No. This is a sample project for tracking money you enter yourself. It does not connect to your bank.',
    },
  ];

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setSent(true);
    setSubject('');
    setMessage('');
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <span>Help and answers</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Find answers about spending, bills, and saving.
        </p>
      </div>

      {/* FAQs Accordion */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Common questions
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-3">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-900 dark:text-slate-100 py-1 hover:text-indigo-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Support & Contact Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
            Send a note
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            This sample form does not send messages. Do not enter private or bank details.
          </p>

          {sent ? (
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Your note was not sent. This sample app is not connected to a help inbox.</span>
            </div>
          ) : (
            <form onSubmit={handleSupportSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  What do you need help with? *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="For example: How do I set a spending limit?"
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tell us a little more *
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your question here"
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Show demo message</span>
              </button>
            </form>
          )}
        </div>

        {/* Demo limitations */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            About this sample
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="font-semibold block text-slate-800 dark:text-slate-200">
                Use sample details
              </span>
              <span className="text-slate-500 text-[11px]">Do not enter real financial or sensitive information.</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="font-semibold block text-slate-800 dark:text-slate-200">
                Your entries
              </span>
              <span className="text-slate-500 text-[11px]">The app saves the details you enter for this account.</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="font-semibold block text-slate-800 dark:text-slate-200">
                Need more help?
              </span>
              <span className="text-slate-500 text-[11px]">Ask the person who shared this project with you.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
