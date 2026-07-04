import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  MessageSquare, 
  AlertCircle, 
  HelpCircle, 
  User, 
  ArrowDownCircle, 
  HeartHandshake
} from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatPanelProps {
  onSendMessage: (text: string) => Promise<string>;
  selectedZone: string;
}

export default function ChatPanel({ onSendMessage, selectedZone }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      parts: [{ text: "Hello! I am your **Local Health & Safety Advisor**. I have access to real-time weather alerts, localized Air Quality Indexes (AQI), municipal notice boards, water utility schedules, and crowd-sourced citizen hazard reports.\n\nHow can I help you stay safe or plan your day today? You can select a sector on the dashboard to focus my updates, or click any of the quick queries below!" }]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Quick query suggestions based on selected zone
  const getSuggestions = (zone: string) => {
    const zoneName = zone.toLowerCase() === 'all' ? 'my area' : zone;
    return [
      `Is it safe to jog in ${zoneName} today?`,
      `Any water shortages or utility disruptions in ${zoneName}?`,
      `Check high-severity safety hazards in ${zoneName}.`,
      `What is the current air quality advisory?`
    ];
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      parts: [{ text }]
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Prepare message history to send to server.
      // Filter out system or empty messages and map format
      const history = messages.concat(userMsg).map(m => ({
        role: m.role,
        content: m.parts[0].text
      }));

      const reply = await onSendMessage(text);
      
      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: reply }]
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: "⚠️ **System Communication Issue**: I was unable to connect to the municipality's data relay engine. Please ensure your Gemini API key is configured correctly in **Settings > Secrets**." }]
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Simple and highly robust custom renderer for markdown-like lists and text elements
  const formatText = (text: string) => {
    if (!text) return null;
    
    return text.split('\n').map((line, lineIdx) => {
      let content = line;
      
      // Check for bullet points
      const isBullet = content.trim().startsWith('- ') || content.trim().startsWith('* ');
      if (isBullet) {
        content = content.trim().substring(2);
      }

      // Check for bold elements using simple regex
      const parts = [];
      let lastIndex = 0;
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;

      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        // Style specific warning labels dynamically
        const boldText = match[1];
        if (boldText.toUpperCase().includes('HIGH') || boldText.toUpperCase().includes('HAZARD') || boldText.toUpperCase().includes('ALERT')) {
          parts.push(
            <strong key={match.index} className="text-red-400 bg-red-950/40 px-1 py-0.5 rounded font-semibold border border-red-500/20">
              {boldText}
            </strong>
          );
        } else {
          parts.push(<strong key={match.index} className="font-semibold text-slate-100">{boldText}</strong>);
        }
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      const formattedLine = parts.length > 0 ? parts : content;

      if (isBullet) {
        return (
          <li key={lineIdx} className="ml-4 list-disc pl-1 text-slate-300 text-xs my-1 leading-relaxed">
            {formattedLine}
          </li>
        );
      }

      return (
        <p key={lineIdx} className={`text-slate-300 text-xs leading-relaxed my-1.5 ${line.trim() === '' ? 'h-2' : ''}`}>
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col h-[650px] relative overflow-hidden" id="chat-panel">
      {/* Visual top border accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/20 via-amber-500 to-amber-500/20"></div>

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4" id="chat-panel-header">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center border border-amber-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-display font-bold text-slate-100">Hyperlocal Safety Agent</h2>
            <p className="text-[10px] text-slate-400 font-mono">Gemini RAG Grounded • Live Data</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] text-teal-400 font-medium bg-teal-950/40 border border-teal-500/20 px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"></span>
          Advisor Connected
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 scrollbar-thin" id="messages-scroll-box">
        {messages.map((m, idx) => {
          const isAI = m.role === 'model';
          return (
            <div 
              key={idx} 
              id={`chat-msg-${idx}`}
              className={`flex gap-3 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center border text-xs ${
                isAI 
                  ? 'bg-[#1e293b] text-amber-400 border-slate-800' 
                  : 'bg-amber-500 text-slate-950 border border-amber-600/30 font-bold'
              }`}>
                {isAI ? <Sparkles className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>

              <div className={`p-3.5 rounded-xl text-xs shadow-md border ${
                isAI 
                  ? 'bg-[#1e293b]/40 text-slate-200 border-slate-800 rounded-tl-none' 
                  : 'bg-amber-500/5 text-slate-200 border border-amber-500/20 rounded-tr-none'
              }`}>
                <div className="space-y-1">
                  {formatText(m.parts[0].text)}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto" id="chat-loading-indicator">
            <div className="w-7 h-7 rounded-lg bg-[#1e293b] text-slate-500 border border-slate-800 shrink-0 flex items-center justify-center animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 bg-[#1e293b]/40 text-slate-400 border border-slate-800 rounded-xl rounded-tl-none text-xs flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </span>
              <span className="italic text-[11px] text-slate-400">Consulting localized bulletins and crowd-sourced feeds...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Quick Suggestions Board */}
      <div className="mb-3 space-y-1.5" id="suggestion-box">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-semibold flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          Quick Advisory Prompts
        </span>
        <div className="flex flex-wrap gap-1.5" id="suggestions-list">
          {getSuggestions(selectedZone).map((s, i) => (
            <button
              key={i}
              id={`suggest-btn-${i}`}
              onClick={() => handleSend(s)}
              disabled={loading}
              className="text-[11px] text-amber-400 bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 hover:border-amber-500/20 hover:text-amber-300 px-2.5 py-1.5 rounded-lg text-left transition-all truncate max-w-full cursor-pointer disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
        className="flex gap-2 items-center"
        id="chat-input-form"
      >
        <input
          id="chat-user-text-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about weather, AQI, water schedules or safety reports in ${selectedZone}...`}
          disabled={loading}
          className="flex-1 bg-[#1e293b] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-75"
        />
        <button
          id="submit-chat-btn"
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-amber-500 text-slate-950 rounded-lg p-2.5 hover:bg-amber-600 disabled:bg-[#1e293b] disabled:text-slate-600 transition-all cursor-pointer flex items-center justify-center shrink-0 border border-amber-600/20 shadow-lg shadow-amber-500/10 font-bold"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
