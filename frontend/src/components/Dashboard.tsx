"use client";
import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, Clock, Search, ChevronRight, X, Briefcase, Calendar, RefreshCw, Send, Terminal, Bot, User } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCommitment, setSelectedCommitment] = useState<any>(null);
  const [asOfDate, setAsOfDate] = useState('2026-09-21T09:00:00');

  // Chat state — full conversation history
  type ChatMsg = { role: 'user' | 'assistant'; content: string };
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'raw'>('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  const fetchBrief = (date: string) => {
    setLoading(true);
    fetch(`${API_URL}/api/brief?as_of=${date}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBrief(asOfDate);
  }, [asOfDate]);

  const handleAsk = async (e: React.FormEvent, overrideQ?: string) => {
    e.preventDefault();
    const q = overrideQ ?? question;
    if (!q.trim()) return;

    const userMsg: ChatMsg = { role: 'user', content: q };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setQuestion('');
    setAsking(true);

    // scroll to bottom
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      const res = await fetch(`${API_URL}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          as_of: asOfDate,
          history: messages  // send full history
        })
      });
      const d = await res.json();
      const assistantMsg: ChatMsg = { role: 'assistant', content: d.answer };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Failed to connect to the agent. Please check the backend is running.'
      }]);
    }
    setAsking(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleRefreshAgent = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/api/refresh?as_of=${asOfDate}`, { method: 'POST' });
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error(err);
    }
    setRefreshing(false);
  };

  if (loading && !data) {
    return <div className="flex items-center justify-center h-64">Loading Executive Intelligence...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <header className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
            ExecPilot AI
          </h1>
          <p className="text-gray-500 text-sm">Executive Intelligence for {data?.executive || "Arjun Malhotra"}</p>
        </div>
        <div className="flex items-center gap-6">
          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === 'dashboard' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-600 hover:text-gray-900'}`}
            >Dashboard</button>
            <button 
              onClick={() => setActiveTab('raw')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${activeTab === 'raw' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-600 hover:text-gray-900'}`}
            ><Terminal className="w-4 h-4"/> Raw Inputs</button>
          </div>

          {/* Time Machine Slider */}
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-900">Simulate Date:</span>
            <select 
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="bg-white border border-orange-200 text-sm rounded px-2 py-1 outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="2026-09-21T09:00:00">Mon 9:00 AM (Start)</option>
              <option value="2026-09-23T08:45:00">Wed 8:45 AM (Raghav check-in)</option>
              <option value="2026-09-23T18:10:00">Wed 6:10 PM (Expense report)</option>
              <option value="2026-09-24T16:45:00">Thu 4:45 PM (Mumbai lease escalated)</option>
              <option value="2026-09-25T17:00:00">Fri 5:00 PM (End of week)</option>
            </select>
          </div>
        </div>
      </header>

      {activeTab === 'raw' && (
        <div className="bg-gray-900 text-gray-100 p-6 rounded-xl shadow-lg font-mono text-sm h-[600px] flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-4">
            <h2 className="text-lg font-bold text-orange-400 flex items-center gap-2">
              <Terminal className="w-5 h-5" /> Raw Data Pipeline
            </h2>
            <button 
              onClick={handleRefreshAgent}
              disabled={refreshing}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Extracting via Mistral...' : 'Re-run Agent (Live Extract)'}
            </button>
          </div>
          <div className="flex-1 overflow-auto whitespace-pre-wrap">
            {`// RAW DATA PACK — verbatim sources fed into ExecPilot AI
// 1 meeting transcript · 25 emails (5 threads × 5) · 2 voice notes · 1 calendar event
// Clicking 'Re-run Agent' deletes the cache and hits the Mistral API live.

// ─── MEETING TRANSCRIPT ──────────────────────────────────────────────────────
// [Leadership Sync] Mon 21 Sep 09:35 AM
// Arjun: Let's keep this quick. Neha, where are we on the Q3 campaign deck?
// Neha: Draft is 80% done. I'll send it to Arjun for review by Wednesday.
// Arjun: Also — I told Raghav I'd send him the updated vendor list. I'll get that
//        to him by end of day tomorrow.
// Raghav: Separately, the Mumbai office renewal paperwork needs someone to sign
//         off this week. Not sure whose desk that's on right now.
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
// Voice Note 1 [Mon 21 Sep 18:40] — "need to get Raghav that vendor list,
//   I think I said today but it might slip to tomorrow morning, remind me.
//   Also still haven't heard back on the Mumbai lease thing, someone needs to
//   own that, I don't think it's me."
// Voice Note 2 [Wed 23 Sep 08:15] — "expense variance report from Divya needs
//   to be in my hands by Wednesday evening, not Thursday. Also Meridian call —
//   I owe Priya a time, need to lock that in today."

// ─── CALENDAR ────────────────────────────────────────────────────────────────
// Arjun Calendar — Board Prep Session: Thu 24 Sep, 09:00–10:00 AM`}
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && data && (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-4 gap-4">
            <MetricCard title="Total Actions" value={data.commitments.length} icon={<Briefcase className="w-5 h-5 text-blue-500" />} />
            <MetricCard title="Overdue" value={data.commitments.filter((c:any) => c.status === 'overdue').length} icon={<AlertCircle className="w-5 h-5 text-red-500" />} />
            <MetricCard title="My Actions" value={data.commitments.filter((c:any) => c.owner === 'Arjun Malhotra' && !c.waiting_on).length} icon={<Clock className="w-5 h-5 text-orange-500" />} />
            <MetricCard title="Waiting / Unowned" value={data.commitments.filter((c:any) => c.owner !== 'Arjun Malhotra' || c.waiting_on).length} icon={<AlertCircle className="w-5 h-5 text-yellow-500" />} />
          </div>

          {/* Main Content Columns */}
          <div className="grid grid-cols-3 gap-8">
            
            {/* Left Col: Actions List */}
            <div className="col-span-2 flex flex-col gap-6">
              <div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
                  <h2 className="text-lg font-bold">MY ACTIONS</h2>
                  {loading && <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />}
                </div>
                <div className="flex flex-col gap-3">
                  {data.commitments.filter((c:any) => c.owner === 'Arjun Malhotra' && !c.waiting_on).map((c: any) => (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedCommitment(c)}
                      className={`bg-white p-4 rounded-xl shadow-sm border cursor-pointer hover:shadow-md transition-all flex justify-between items-center ${c.status === 'overdue' ? 'border-red-200 bg-red-50' : c.status === 'unowned' ? 'border-yellow-200 bg-yellow-50' : 'border-gray-100 hover:border-orange-300'}`}
                    >
                      <div className="flex items-start gap-3">
                        <StatusIcon status={c.status} />
                        <div>
                          <h3 className="font-medium">{c.action}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            <span className={`font-bold uppercase ${c.status === 'overdue' ? 'text-red-600' : ''}`}>{c.status}</span> · Deadline: {c.deadline}
                          </p>
                          {/* Calendar conflict: deck review at 09:30 falls inside Board Prep 09:00-10:00 */}
                          {c.deadline === '2026-09-24T09:30:00' && (
                            <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3"/> CALENDAR CONFLICT: Collides with Board Prep Session (Thu 9:00–10:00 AM)
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="text-gray-400" />
                    </div>
                  ))}
                  {data.commitments.filter((c:any) => c.owner === 'Arjun Malhotra' && !c.waiting_on).length === 0 && (
                     <p className="text-gray-500 text-sm italic py-4">No actions for you right now.</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
                  <h2 className="text-lg font-bold text-gray-600">WAITING ON / UNOWNED</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {data.commitments.filter((c:any) => c.owner !== 'Arjun Malhotra' || c.waiting_on).map((c: any) => (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedCommitment(c)}
                      className={`bg-white p-4 rounded-xl shadow-sm border cursor-pointer hover:shadow-md transition-all flex justify-between items-center ${c.status === 'overdue' ? 'border-red-200 bg-red-50' : c.status === 'unowned' ? 'border-yellow-200 bg-yellow-50' : 'border-gray-100 hover:border-orange-300'}`}
                    >
                      <div className="flex items-start gap-3">
                        <StatusIcon status={c.status} />
                        <div>
                          <h3 className="font-medium text-gray-700">{c.action}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            <span className={`font-bold uppercase ${c.status === 'overdue' ? 'text-red-600' : ''}`}>{c.status}</span> · Waiting On: <span className="font-bold">{c.waiting_on || "UNCONFIRMED"}</span>
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="text-gray-400" />
                    </div>
                  ))}
                  {data.commitments.filter((c:any) => c.owner !== 'Arjun Malhotra' || c.waiting_on).length === 0 && (
                     <p className="text-gray-500 text-sm italic py-4">Nothing waiting on others.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Col: Ask ExecPilot Chat */}
            <div className="col-span-1 flex flex-col">
              <h2 className="text-lg font-bold border-b border-gray-200 pb-2 mb-3">ASK EXECPILOT</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col" style={{height: '520px'}}>

                {/* Chat messages area */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {messages.length === 0 && (
                    <div className="flex flex-col gap-2 h-full justify-center">
                      <div className="flex items-center gap-2 text-orange-600 font-semibold mb-1">
                        <Bot className="w-5 h-5" />
                        <span>ExecPilot AI</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">Ask me anything about Arjun's commitments:</p>
                      {[
                        'What did I promise Raghav?',
                        'What needs action today?',
                        'Who owns the Mumbai lease?',
                        'Did Divya send the expense report?',
                        'Do I have any meeting conflicts on Thursday?',
                      ].map(q => (
                        <button
                          key={q}
                          onClick={(e) => { setQuestion(q); handleAsk(e as any, q); }}
                          className="text-left text-sm px-3 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-100 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-2 ${ msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-orange-500 text-white rounded-tr-sm'
                          : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                      }`}>
                        {msg.content.split('**').map((part, i) =>
                          i % 2 === 1
                            ? <strong key={i}>{part}</strong>
                            : <span key={i}>{part}</span>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {asking && (
                    <div className="flex gap-2 justify-start">
                      <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input bar */}
                <div className="border-t border-gray-100 p-3">
                  {messages.length > 0 && (
                    <button
                      onClick={() => setMessages([])}
                      className="text-xs text-gray-400 hover:text-red-500 mb-2 transition-colors"
                    >
                      Clear conversation
                    </button>
                  )}
                  <form onSubmit={handleAsk} className="relative">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask about commitments..."
                      disabled={asking}
                      className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={asking || !question.trim()}
                      className="absolute right-2 top-1.5 p-1.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-40 transition-colors"
                    >
                      {asking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Right Drawer (Evidence) */}
      {selectedCommitment && activeTab === 'dashboard' && (
        <div className="fixed inset-0 bg-black/20 flex justify-end z-50">
          <div className="bg-white w-[450px] h-full shadow-2xl p-6 flex flex-col animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Commitment Details</h2>
              <button onClick={() => setSelectedCommitment(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-6 flex-1 overflow-y-auto pr-2">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{selectedCommitment.action}</h3>
                <div className="flex items-center gap-2 text-sm mt-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(selectedCommitment.status)}`}>
                    {selectedCommitment.status.toUpperCase()}
                  </span>
                  <span className="text-gray-500">Priority: {selectedCommitment.priority}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">OWNER</p>
                  <p className="font-medium">{selectedCommitment.owner || "⚠ UNCONFIRMED"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">DEADLINE</p>
                  <p className="font-medium">{selectedCommitment.deadline}</p>
                </div>
                {selectedCommitment.waiting_on && (
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs mb-1">WAITING ON</p>
                    <p className="font-medium">{selectedCommitment.waiting_on}</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold border-b pb-2 mb-4 flex items-center gap-2">
                   <Search className="w-4 h-4" /> Why I Know This (Evidence)
                </h4>
                <div className="flex flex-col gap-4">
                  {selectedCommitment.evidence?.map((ev: any, idx: number) => (
                    <div key={idx} className="border-l-2 border-orange-400 pl-4 py-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-500 uppercase">{ev.source_type}</span>
                        <span className="text-xs text-gray-400">· {ev.source_id}</span>
                      </div>
                      <p className="text-sm italic text-gray-700">"{ev.text}"</p>
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

function MetricCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className="p-3 bg-gray-50 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
      </div>
    </div>
  )
}

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
