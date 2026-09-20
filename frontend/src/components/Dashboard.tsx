"use client";
import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, Search, ChevronRight, X, Briefcase, Calendar, RefreshCw, Send, Terminal } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCommitment, setSelectedCommitment] = useState<any>(null);
  const [asOfDate, setAsOfDate] = useState('2026-09-23');
  
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

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

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setAsking(true);
    try {
      const res = await fetch(`${API_URL}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, as_of: asOfDate })
      });
      const d = await res.json();
      setAnswer(d.answer);
    } catch (err) {
      console.error(err);
      setAnswer("Failed to connect to agent.");
    }
    setAsking(false);
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
              <option value="2026-09-21">Mon, Sept 21</option>
              <option value="2026-09-22">Tue, Sept 22</option>
              <option value="2026-09-23">Wed, Sept 23 (Today)</option>
              <option value="2026-09-24">Thu, Sept 24</option>
              <option value="2026-09-25">Fri, Sept 25</option>
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
            {`// This represents the messy data pack fed into the ExecPilot AI Engine.
// Clicking 'Re-run Agent' deletes the cache and hits the Mistral API live.

[
  {
    "type": "meeting_transcript",
    "id": "Leadership Sync",
    "date": "2026-09-21",
    "content": "Arjun: I told Raghav I'd send him the updated vendor list. Divya: What about the Mumbai Office Lease Renewal? I think it sits with Facilities but it's still unowned - can you confirm who's handling it by end of week?"
  },
  {
    "type": "email",
    "id": "Vendor List",
    "date": "2026-09-22",
    "sender": "Arjun Malhotra",
    "recipient": "Raghav",
    "content": "Raghav, I am reviewing the data. I will send by tomorrow (Wednesday) morning for sure."
  },
  {
    "type": "voice_note",
    "id": "Voice Note 1",
    "date": "2026-09-22",
    "content": "I need to get Raghav that vendor list, remind me."
  },
  {
    "type": "email",
    "id": "Q3 Campaign Deck",
    "date": "2026-09-22",
    "sender": "Neha Kapoor",
    "recipient": "Arjun Malhotra",
    "content": "Arjun, I'll have the Q3 campaign deck ready for you to review. Let's say 9:30 AM Thursday, before your board prep block."
  },
  {
    "type": "email",
    "id": "Expense Variance Report",
    "date": "2026-09-23",
    "sender": "Divya Rao",
    "recipient": "Arjun Malhotra",
    "content": "Arjun, July expense variance report attached, sent as promised."
  }
]`}
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && data && (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-4 gap-4">
            <MetricCard title="Total Actions" value={data.summary.total} icon={<Briefcase className="w-5 h-5 text-blue-500" />} />
            <MetricCard title="Overdue" value={data.summary.overdue} icon={<AlertCircle className="w-5 h-5 text-red-500" />} />
            <MetricCard title="Waiting On" value={data.summary.waiting_on_others} icon={<Clock className="w-5 h-5 text-orange-500" />} />
            <MetricCard title="Unowned" value={data.summary.unowned} icon={<AlertCircle className="w-5 h-5 text-yellow-500" />} />
          </div>

          {/* Main Content Columns */}
          <div className="grid grid-cols-3 gap-8">
            
            {/* Left Col: Today's Actions */}
            <div className="col-span-2 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <h2 className="text-lg font-bold">TODAY'S ATTENTION</h2>
                {loading && <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />}
              </div>
              <div className="flex flex-col gap-3">
                {data.commitments.map((c: any) => (
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
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Ask ExecPilot */}
            <div className="col-span-1 flex flex-col gap-4">
              <h2 className="text-lg font-bold border-b border-gray-200 pb-2">ASK EXECPILOT</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-full flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4">
                  {answer ? (
                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 text-sm text-gray-800 leading-relaxed">
                      <div className="flex items-center gap-2 font-bold text-orange-800 mb-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Agent Response
                      </div>
                      {answer}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                      <p className="font-medium text-gray-800 mb-2">Suggested questions:</p>
                      <ul className="list-disc list-inside space-y-1.5">
                        <li className="cursor-pointer hover:text-orange-600" onClick={() => setQuestion("What did I promise Raghav?")}>What did I promise Raghav?</li>
                        <li className="cursor-pointer hover:text-orange-600" onClick={() => setQuestion("What needs action today?")}>What needs action today?</li>
                      </ul>
                    </div>
                  )}
                </div>
                <form onSubmit={handleAsk} className="relative">
                  <input 
                    type="text" 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask about commitments..."
                    disabled={asking}
                    className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                  />
                  <button 
                    type="submit" 
                    disabled={asking || !question.trim()}
                    className="absolute right-2 top-1.5 p-1.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-50"
                  >
                    {asking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
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
