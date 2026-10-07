import React, { useState, useRef, useEffect } from 'react';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  User,
  ArrowRight,
  Lightbulb,
  ExternalLink,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Opportunity } from '../types';
import { OpportunityModal } from '../components/OpportunityModal';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
  relatedOpportunityIds?: string[];
}

export const CareerAssistant: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello ${
        user?.full_name || 'there'
      }! 👋 I'm your OpportunityAI Career Assistant.\n\nI analyze your profile (${
        user?.profile?.degree || 'Student'
      }, ${user?.profile?.academic_year || '3rd Year'}, skills in ${
        user?.profile?.technical_skills?.slice(0, 3).join(', ') || 'Python, React'
      }) against real verified opportunities in the database.\n\nHow can I help advance your career today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [opportunitiesMap, setOpportunitiesMap] = useState<Record<string, Opportunity>>({});
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load opportunities to resolve related IDs into clickable cards
  useEffect(() => {
    api.listOpportunities().then((opps) => {
      const map: Record<string, Opportunity> = {};
      opps.forEach((o) => {
        map[o.id] = o;
      });
      setOpportunitiesMap(map);
    });
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await api.chatWithAssistant(query);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: res.source,
        relatedOpportunityIds: res.related_opportunities,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an issue processing that query. Please make sure the backend is connected.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Which opportunities should I apply for first?',
    'What are my biggest skill gaps for high-paying roles?',
    "Generate a prioritized action plan for today",
    'Am I eligible for Google Summer of Code or Amazon AWS?',
  ];

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col rounded-3xl glass-panel border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-200">
      {/* Assistant Header */}
      <div className="p-4 px-6 border-b border-slate-800 bg-[#0d1426] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <BotMessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Daily Career Assistant</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Knowledge Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Context-grounded in your profile and verified database records.
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                  : 'bg-slate-800 text-blue-400 border border-slate-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className="space-y-2">
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {msg.text}
              </div>

              {/* Related Opportunity Quick Cards */}
              {msg.relatedOpportunityIds && msg.relatedOpportunityIds.length > 0 && (
                <div className="pt-1 flex flex-wrap gap-2">
                  {msg.relatedOpportunityIds.map((oppId) => {
                    const opp = opportunitiesMap[oppId];
                    if (!opp) return null;
                    return (
                      <div
                        key={oppId}
                        onClick={() => setSelectedOpp(opp)}
                        className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-blue-500/30 text-xs text-blue-300 hover:text-white hover:border-blue-400 cursor-pointer flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 text-blue-400" />
                        <span className="font-semibold">{opp.title}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <span className="text-[10px] text-slate-500 block px-1">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-lg">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-blue-400 border border-slate-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
              <span>Analyzing opportunities and eligibility rules...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
          Suggestions:
        </span>
        {samplePrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1 rounded-full text-[11px] font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-4 border-t border-slate-800 bg-[#0d1426] flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask anything (e.g. Which opportunities fit my profile? How do I learn Docker?)..."
          className="flex-1 text-xs sm:text-sm rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Opportunity Modal */}
      <OpportunityModal
        opportunity={selectedOpp}
        onClose={() => setSelectedOpp(null)}
        onReport={() => {}}
      />
    </div>
  );
};
