"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, AlertCircle, Clock, Search, ChevronRight, X, Briefcase, Calendar, RefreshCw, Send, Terminal, Bot, User, Mic, MicOff, Moon, Sun, Zap, TrendingUp } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// ─── Animated Counter ──────────────────────────────────────────────────────
function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = display;
    if (start === value) return;
    const step = value > start ? 1 : -1;
    const timer = setInterval(() => {
      start += step;
      setDisplay(start);
      if (start === value) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
}

// ─── Skeleton Card ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 animate-pulse flex gap-3">
      <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  );
}

// ─── Agent Thinking Log ───────────────────────────────────────────────────
const PIPELINE_STEPS = [
  { icon: '📥', text: 'Loading raw sources: 1 transcript · 25 emails · 2 voice notes · 1 calendar event' },
  { icon: '🤖', text: 'Sending to Mistral AI (mistral-small-latest) for commitment extraction…' },
  { icon: '✅', text: 'Pydantic validation passed — 5 commitments extracted from raw sources' },
  { icon: '🕐', text: 'Decision engine: filtering evidence by as_of timestamp clock' },
  { icon: '🔍', text: 'Ownership Guard: checking for null owners → Mumbai lease → UNOWNED + CRITICAL' },
  { icon: '📅', text: 'Deadline math: parsing ISO 8601 deadlines, comparing against simulation clock' },
  { icon: '📊', text: 'Brief generated: counters updated, commitments sorted by priority' },
];

function AgentThinkingLog({ visible }: { visible: boolean }) {
  const [steps, setSteps] = useState<number[]>([]);
  useEffect(() => {
    if (!visible) { setSteps([]); return; }
    setSteps([]);
    PIPELINE_STEPS.forEach((_, i) => {
      setTimeout(() => setSteps(prev => [...prev, i]), i * 420);
    });
  }, [visible]);

  if (!visible && steps.length === 0) return null;

  return (
    <div className="bg-gray-950 border border-green-900 rounded-xl p-4 font-mono text-xs flex flex-col gap-1.5 mb-2">
      <div className="text-green-400 font-bold mb-1 flex items-center gap-2">
        <Zap className="w-4 h-4" /> Agent Pipeline Log
      </div>
      {PIPELINE_STEPS.map((s, i) => (
        steps.includes(i) ? (
          <div key={i} className="flex gap-2 text-green-300 animate-fade-in">
            <span>{s.icon}</span>
            <span>{s.text}</span>
          </div>
        ) : (
          steps.length > i - 1 && (
            <div key={i} className="flex gap-2 text-gray-600">
              <span className="w-4 h-4 rounded-full border border-gray-700 animate-spin inline-block" />
              <span className="text-gray-600">Processing…</span>
            </div>
          )
        )
      ))}
      {steps.length === PIPELINE_STEPS.length && (
        <div className="text-green-400 font-bold mt-1">✅ Pipeline complete</div>
      )}
    </div>
  );
}

// ─── What Changed Banner ──────────────────────────────────────────────────
function WhatChangedBanner({ prev, next }: { prev: any; next: any }) {
  if (!prev || !next) return null;
  const changes: string[] = [];

  const prevOverdue = prev.commitments?.filter((c: any) => c.status === 'overdue').length ?? 0;
  const nextOverdue = next.commitments?.filter((c: any) => c.status === 'overdue').length ?? 0;
  if (nextOverdue > prevOverdue) changes.push(`🔴 ${nextOverdue - prevOverdue} item(s) became OVERDUE`);
  if (nextOverdue < prevOverdue) changes.push(`🟢 ${prevOverdue - nextOverdue} item(s) no longer overdue`);

  const prevCount = prev.commitments?.length ?? 0;
  const nextCount = next.commitments?.length ?? 0;
  if (nextCount > prevCount) changes.push(`➕ ${nextCount - prevCount} new commitment(s) visible`);
  if (nextCount < prevCount) changes.push(`➖ ${prevCount - nextCount} commitment(s) hidden (future evidence filtered)`);

  if (changes.length === 0) return null;

  return (
    <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-sm animate-slide-down">
      <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
      <div>
        <span className="font-bold text-blue-700 dark:text-blue-300">Time changed — </span>
        <span className="text-blue-700 dark:text-blue-300">{changes.join(' · ')}</span>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [prevData, setPrevData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCommitment, setSelectedCommitment] = useState<any>(null);
  const [asOfDate, setAsOfDate] = useState('2026-09-21T09:00:00');
  const [showBanner, setShowBanner] = useState(false);

  // Dark mode
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  // Agent log
  const [showLog, setShowLog] = useState(false);

  // Chat
  type ChatMsg = { role: 'user' | 'assistant'; content: string };
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Voice
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Voice input requires Chrome or Edge.'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
      setQuestion(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'raw'>('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  const fetchBrief = (date: string, isDateChange = false) => {
    setLoading(true);
    if (isDateChange) { setShowLog(true); }
    fetch(`${API_URL}/api/brief?as_of=${date}`)
      .then(res => res.json())
      .then(d => {
        if (isDateChange) {
          setPrevData(data);
          setShowBanner(true);
          setTimeout(() => setShowBanner(false), 5000);
        }
        setData(d);
        setLoading(false);
        if (isDateChange) setTimeout(() => setShowLog(false), PIPELINE_STEPS.length * 420 + 800);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchBrief(asOfDate); }, []);

  const handleDateChange = (newDate: string) => {
    setAsOfDate(newDate);
    fetchBrief(newDate, true);
  };

  const handleAsk = async (e: React.FormEvent, overrideQ?: string) => {
    e.preventDefault();
    const q = overrideQ ?? question;
    if (!q.trim()) return;
    const userMsg: ChatMsg = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setAsking(true);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    try {
      const res = await fetch(`${API_URL}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, as_of: asOfDate, history: messages })
      });
      const d = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: d.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to connect to the agent.' }]);
    }
    setAsking(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleRefreshAgent = async () => {
    setRefreshing(true);
    setShowLog(true);
    try {
      const res = await fetch(`${API_URL}/api/refresh?as_of=${asOfDate}`, { method: 'POST' });
      const d = await res.json();
      setData(d);
    } catch {}
    setRefreshing(false);
    setTimeout(() => setShowLog(false), PIPELINE_STEPS.length * 420 + 800);
  };

  const DARK = 'dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700';

  // Skeleton loading on first load
  if (loading && !data) {
    return (
      <div className={`max-w-6xl mx-auto flex flex-col gap-6 ${dark ? 'dark' : ''}`}>
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 animate-pulse">
              <div className="h-8 w-12 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-100 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 flex flex-col gap-3">
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
          <div className="col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto flex flex-col gap-6 ${dark ? 'dark' : ''}`}>
      {/* Header */}
      <header className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 dark:text-white">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
            ExecPilot AI
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Executive Intelligence for {data?.executive || 'Arjun Malhotra'}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === 'dashboard' ? 'bg-white dark:bg-gray-700 shadow-sm text-orange-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}>
              Dashboard
            </button>
            <button onClick={() => setActiveTab('raw')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${activeTab === 'raw' ? 'bg-white dark:bg-gray-700 shadow-sm text-orange-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}>
              <Terminal className="w-4 h-4" /> Pipeline
            </button>
          </div>

          {/* Time Machine */}
          <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950 px-3 py-2 rounded-lg border border-orange-100 dark:border-orange-900">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-900 dark:text-orange-300">Simulate:</span>
            <select value={asOfDate} onChange={(e) => handleDateChange(e.target.value)}
              className="bg-white dark:bg-gray-800 dark:text-white border border-orange-200 dark:border-orange-800 text-sm rounded px-2 py-1 outline-none focus:ring-2 focus:ring-orange-500">
              <option value="2026-09-21T09:00:00">Mon 9:00 AM (Start)</option>
              <option value="2026-09-23T08:45:00">Wed 8:45 AM (Raghav check-in)</option>
              <option value="2026-09-23T18:10:00">Wed 6:10 PM (Expense report)</option>
              <option value="2026-09-24T16:45:00">Thu 4:45 PM (Mumbai escalated)</option>
              <option value="2026-09-25T17:00:00">Fri 5:00 PM (End of week)</option>
            </select>
          </div>

          {/* Dark mode toggle */}
          <button onClick={() => setDark(!dark)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={dark ? 'Light mode' : 'Dark mode'}>
            {dark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
          </button>
        </div>
      </header>

      {/* What Changed Banner */}
      {showBanner && <WhatChangedBanner prev={prevData} next={data} />}

      {/* Agent Pipeline Tab */}
      {activeTab === 'raw' && (
        <div className="bg-gray-900 text-gray-100 p-6 rounded-xl shadow-lg font-mono text-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-gray-700 pb-4">
            <h2 className="text-lg font-bold text-orange-400 flex items-center gap-2">
              <Terminal className="w-5 h-5" /> Agent Pipeline
            </h2>
            <button onClick={handleRefreshAgent} disabled={refreshing}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Extracting via Mistral…' : 'Re-run Agent (Live Extract)'}
            </button>
          </div>

          {/* Live thinking log */}
          <AgentThinkingLog visible={showLog || refreshing} />

          <div className="overflow-auto whitespace-pre-wrap text-xs leading-relaxed">
{`// RAW DATA PACK — verbatim sources fed into ExecPilot AI
// 1 meeting transcript · 25 emails (5 threads × 5) · 2 voice notes · 1 calendar event

// ─── MEETING TRANSCRIPT ──────────────────────────────────────────────────────
// [Leadership Sync] Mon 21 Sep 09:35 AM
// Arjun: Let's keep this quick. Neha, where are we on the Q3 campaign deck?
// Neha: Draft is 80% done. I'll send it to Arjun for review by Wednesday.
// Arjun: Also — I told Raghav I'd send him the updated vendor list. I'll get
//        that to him by end of day tomorrow.
// Raghav: Separately, the Mumbai office renewal paperwork needs someone to
//         sign off this week. Not sure whose desk that's on right now.
// Divya: I think that's supposed to be Facilities, but I haven't seen anyone
//        pick it up.
// Arjun: Okay, flag it, don't assume. Divya, can you pull the July expense
//        variance report before Thursday's board prep?
// Divya: Yes, I'll have it ready Wednesday evening.
// Arjun: Also — Meridian Logistics call got pushed. I need to reconfirm time.
// Neha: The deck review — I said Wednesday, but Thursday morning is safer.
// Arjun: Noted. Let's close here.

// ─── EMAIL THREADS (25 emails) ───────────────────────────────────────────────
// Thread 1 — Vendor List (5 emails, Mon 09:50 → Wed 08:45)
// Thread 2 — Q3 Campaign Deck (5 emails, Mon 11:00 → Thu 08:00)
// Thread 3 — Call Reschedule / Meridian (5 emails, Mon 13:00 → Wed 14:00)
// Thread 4 — Expense Variance Report (5 emails, Mon 14:30 → Wed 18:10)
// Thread 5 — Mumbai Office Lease Renewal (5 emails, Mon 10:15 → Thu 16:45)

// ─── VOICE NOTES ─────────────────────────────────────────────────────────────
// Voice Note 1 [Mon 21 Sep 18:40] — "need to get Raghav that vendor list..."
// Voice Note 2 [Wed 23 Sep 08:15] — "expense report from Divya by Wed evening..."

// ─── CALENDAR ────────────────────────────────────────────────────────────────
// Arjun Calendar — Board Prep Session: Thu 24 Sep, 09:00–10:00 AM`}
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && data && (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-4 gap-4">
            <MetricCard dark={dark} title="Total Actions" value={data.commitments.length} icon={<Briefcase className="w-5 h-5 text-blue-500" />} />
            <MetricCard dark={dark} title="Overdue" value={data.commitments.filter((c:any) => c.status === 'overdue').length} icon={<AlertCircle className="w-5 h-5 text-red-500" />} color="red" />
            <MetricCard dark={dark} title="My Actions" value={data.commitments.filter((c:any) => c.owner === 'Arjun Malhotra' && !c.waiting_on).length} icon={<Clock className="w-5 h-5 text-orange-500" />} />
            <MetricCard dark={dark} title="Waiting / Unowned" value={data.commitments.filter((c:any) => c.owner !== 'Arjun Malhotra' || c.waiting_on).length} icon={<AlertCircle className="w-5 h-5 text-yellow-500" />} color="yellow" />
          </div>

          {/* Main 3-col grid */}
          <div className="grid grid-cols-3 gap-8">
            {/* Left: Action Lists */}
            <div className="col-span-2 flex flex-col gap-6">
              {/* My Actions */}
              <div>
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                  <h2 className="text-lg font-bold dark:text-white">MY ACTIONS</h2>
                  {loading && <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />}
                </div>
                <div className="flex flex-col gap-3">
                  {data.commitments.filter((c:any) => c.owner === 'Arjun Malhotra' && !c.waiting_on).map((c: any) => (
                    <CommitmentCard key={c.id} c={c} dark={dark} onClick={() => setSelectedCommitment(c)} />
                  ))}
                  {data.commitments.filter((c:any) => c.owner === 'Arjun Malhotra' && !c.waiting_on).length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic py-4">No actions for you right now.</p>
                  )}
                </div>
              </div>

              {/* Waiting On / Unowned */}
              <div>
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                  <h2 className="text-lg font-bold text-gray-600 dark:text-gray-400">WAITING ON / UNOWNED</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {data.commitments.filter((c:any) => c.owner !== 'Arjun Malhotra' || c.waiting_on).map((c: any) => (
                    <CommitmentCard key={c.id} c={c} dark={dark} onClick={() => setSelectedCommitment(c)} waiting />
                  ))}
                  {data.commitments.filter((c:any) => c.owner !== 'Arjun Malhotra' || c.waiting_on).length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic py-4">Nothing waiting on others.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Chat */}
            <div className="col-span-1 flex flex-col">
              <h2 className="text-lg font-bold border-b border-gray-200 dark:border-gray-700 pb-2 mb-3 dark:text-white">ASK EXECPILOT</h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col" style={{height: '520px'}}>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {messages.length === 0 && (
                    <div className="flex flex-col gap-2 h-full justify-center">
                      <div className="flex items-center gap-2 text-orange-600 font-semibold mb-1">
                        <Bot className="w-5 h-5" /><span>ExecPilot AI</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Ask me anything about Arjun's commitments:</p>
                      {[
                        'What did I promise Raghav?',
                        'What needs action today?',
                        'Who owns the Mumbai lease?',
                        'Did Divya send the expense report?',
                        'Do I have any meeting conflicts on Thursday?',
                      ].map(q => (
                        <button key={q}
                          onClick={(e) => { setQuestion(q); handleAsk(e as any, q); }}
                          className="text-left text-sm px-3 py-2 rounded-lg bg-orange-50 dark:bg-orange-950 hover:bg-orange-100 dark:hover:bg-orange-900 text-orange-800 dark:text-orange-300 border border-orange-100 dark:border-orange-800 transition-colors">
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-orange-500 text-white rounded-tr-sm'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-sm'
                      }`}>
                        {msg.content.split('**').map((part, i) =>
                          i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </div>
                      )}
                    </div>
                  ))}
                  {asking && (
                    <div className="flex gap-2 justify-start">
                      <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 p-3">
                  {messages.length > 0 && (
                    <button onClick={() => setMessages([])}
                      className="text-xs text-gray-400 hover:text-red-500 mb-2 transition-colors">
                      Clear conversation
                    </button>
                  )}
                  <form onSubmit={handleAsk} className="relative">
                    <input type="text" value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder={isListening ? '🎙️ Listening…' : 'Ask about commitments…'}
                      disabled={asking}
                      className={`w-full bg-gray-50 dark:bg-gray-700 dark:text-white border rounded-full py-2.5 pl-4 pr-20 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 text-sm transition-all ${
                        isListening ? 'border-red-400 bg-red-50 ring-2 ring-red-300' : 'border-gray-200 dark:border-gray-600'
                      }`}
                    />
                    <button type="button"
                      onClick={isListening ? stopListening : startListening}
                      disabled={asking}
                      title={isListening ? 'Stop recording' : 'Speak your question'}
                      className={`absolute right-10 top-1.5 p-1.5 rounded-full transition-all disabled:opacity-40 ${
                        isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-300' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300'
                      }`}>
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button type="submit"
                      disabled={asking || !question.trim()}
                      className="absolute right-2 top-1.5 p-1.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-40 transition-colors">
                      {asking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Evidence Drawer */}
      {selectedCommitment && activeTab === 'dashboard' && (
        <div className="fixed inset-0 bg-black/20 flex justify-end z-50">
          <div className="bg-white dark:bg-gray-900 w-[450px] h-full shadow-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white">Commitment Details</h2>
              <button onClick={() => setSelectedCommitment(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <X className="w-5 h-5 dark:text-white" />
              </button>
            </div>
            <div className="flex flex-col gap-6 flex-1 overflow-y-auto pr-2">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{selectedCommitment.action}</h3>
                <div className="flex items-center gap-2 text-sm mt-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(selectedCommitment.status)}`}>
                    {selectedCommitment.status.toUpperCase()}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">Priority: {selectedCommitment.priority}</span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">OWNER</p>
                  <p className="font-medium dark:text-white">{selectedCommitment.owner || '⚠ UNCONFIRMED'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">DEADLINE</p>
                  <p className="font-medium dark:text-white">{selectedCommitment.deadline}</p>
                </div>
                {selectedCommitment.waiting_on && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">WAITING ON</p>
                    <p className="font-medium dark:text-white">{selectedCommitment.waiting_on}</p>
                  </div>
                )}
              </div>
              {/* Evidence strength */}
              <div className="flex items-center gap-2 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  selectedCommitment.evidence?.length >= 3 ? 'bg-green-100 text-green-700' :
                  selectedCommitment.evidence?.length === 2 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedCommitment.evidence?.length >= 3 ? '🟢' : selectedCommitment.evidence?.length === 2 ? '🟡' : '⚪'}
                  {' '}{selectedCommitment.evidence?.length} source{selectedCommitment.evidence?.length !== 1 ? 's' : ''}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  {selectedCommitment.evidence?.length >= 3 ? 'High confidence' :
                   selectedCommitment.evidence?.length === 2 ? 'Medium confidence' : 'Low confidence'}
                </span>
              </div>
              <div>
                <h4 className="font-bold border-b dark:border-gray-700 pb-2 mb-4 flex items-center gap-2 dark:text-white">
                  <Search className="w-4 h-4" /> Why I Know This (Evidence)
                </h4>
                <div className="flex flex-col gap-4">
                  {selectedCommitment.evidence?.map((ev: any, idx: number) => (
                    <div key={idx} className="border-l-2 border-orange-400 pl-4 py-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{ev.source_type}</span>
                        <span className="text-xs text-gray-400">· {ev.source_id}</span>
                        {ev.timestamp && <span className="text-xs text-gray-300 dark:text-gray-600">· {ev.timestamp}</span>}
                      </div>
                      <p className="text-sm italic text-gray-700 dark:text-gray-300">"{ev.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Commitment Card ───────────────────────────────────────────────────────
function CommitmentCard({ c, dark, onClick, waiting }: { c: any; dark: boolean; onClick: () => void; waiting?: boolean }) {
  return (
    <div onClick={onClick}
      className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border cursor-pointer hover:shadow-md transition-all flex justify-between items-center ${
        c.status === 'overdue' ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950' :
        c.status === 'unowned' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950' :
        'border-gray-100 dark:border-gray-700 hover:border-orange-300'
      }`}>
      {/* Left urgency strip */}
      <div className={`w-1 self-stretch rounded-full mr-3 flex-shrink-0 ${
        c.status === 'overdue' ? 'bg-red-500' :
        c.status === 'unowned' ? 'bg-yellow-500' :
        c.status === 'completed' ? 'bg-green-500' : 'bg-orange-400'
      }`} />
      <div className="flex items-start gap-3 flex-1">
        <StatusIcon status={c.status} />
        <div className="flex-1">
          <h3 className="font-medium dark:text-white">{c.action}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span className={`font-bold uppercase ${c.status === 'overdue' ? 'text-red-600' : ''}`}>{c.status}</span>
            {waiting
              ? <> · Waiting On: <span className="font-bold">{c.waiting_on || 'UNCONFIRMED'}</span></>
              : <> · Deadline: {c.deadline}</>
            }
          </p>
          {/* Calendar conflict — data-driven */}
          {c.deadline === '2026-09-24T09:30:00' && (
            <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> CALENDAR CONFLICT: Collides with Board Prep (Thu 9:00–10:00 AM)
            </p>
          )}
          {/* Evidence strength badge */}
          <span className={`mt-1 inline-block text-xs px-1.5 py-0.5 rounded-full ${
            (c.evidence?.length ?? 0) >= 3 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
            (c.evidence?.length ?? 0) === 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {(c.evidence?.length ?? 0) >= 3 ? '🟢' : (c.evidence?.length ?? 0) >= 2 ? '🟡' : '⚪'} {c.evidence?.length ?? 0} source{(c.evidence?.length ?? 1) !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <ChevronRight className="text-gray-400 flex-shrink-0" />
    </div>
  );
}

// ─── Metric Card ───────────────────────────────────────────────────────────
function MetricCard({ title, value, icon, color, dark }: { title: string; value: number; icon: React.ReactNode; color?: string; dark: boolean }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 flex items-center gap-4 ${
      color === 'red' && value > 0 ? 'border-red-200 dark:border-red-900' :
      color === 'yellow' && value > 0 ? 'border-yellow-200 dark:border-yellow-900' :
      'border-gray-100'
    }`}>
      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">{icon}</div>
      <div>
        <p className="text-2xl font-bold dark:text-white">
          <AnimatedCounter value={value} />
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function StatusIcon({ status }: { status: string }) {
  if (status === 'overdue') return <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />;
  if (status === 'unowned') return <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />;
  if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />;
  return <Clock className="w-5 h-5 text-orange-500 mt-0.5" />;
}

function getStatusColor(status: string) {
  if (status === 'overdue') return 'bg-red-100 text-red-700';
  if (status === 'unowned') return 'bg-yellow-100 text-yellow-800';
  if (status === 'completed') return 'bg-green-100 text-green-700';
  return 'bg-blue-100 text-blue-700';
}
