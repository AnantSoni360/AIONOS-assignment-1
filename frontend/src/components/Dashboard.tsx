"use client";
import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, Search, ChevronRight, X, MessageSquare, Briefcase } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCommitment, setSelectedCommitment] = useState<any>(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/brief')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading Executive Intelligence...</div>;
  }

  if (!data) {
    return <div className="text-red-500">Failed to load brief data. Ensure backend is running.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
            ExecPilot AI
          </h1>
          <p className="text-gray-500 text-sm">Executive Intelligence for {data.executive}</p>
        </div>
        <div className="text-right">
          <p className="font-medium">Good morning, Arjun</p>
          <p className="text-sm text-gray-500">Wednesday · 23 September 2026</p>
        </div>
      </header>

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
          <h2 className="text-lg font-bold border-b border-gray-200 pb-2">TODAY'S ATTENTION</h2>
          <div className="flex flex-col gap-3">
            {data.commitments.map((c: any) => (
              <div 
                key={c.id} 
                onClick={() => setSelectedCommitment(c)}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-orange-300 hover:shadow-md transition-all flex justify-between items-center"
              >
                <div className="flex items-start gap-3">
                  <StatusIcon status={c.status} />
                  <div>
                    <h3 className="font-medium">{c.action}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {c.status.toUpperCase()} · Deadline: {c.deadline}
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full flex flex-col">
            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 mb-4">
                <p className="font-medium text-gray-800 mb-1">Example questions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>What did I promise Raghav?</li>
                  <li>Who owns the Mumbai lease?</li>
                  <li>Is the Q3 deck ready?</li>
                </ul>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Ask about your commitments..."
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Right Drawer (Evidence) */}
      {selectedCommitment && (
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
                  {selectedCommitment.evidence.map((ev: any, idx: number) => (
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
