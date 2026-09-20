import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, Zap, ShieldCheck, Cpu } from 'lucide-react';

const speedData = [
  { time: '09:00', ms: 35 },
  { time: '10:00', ms: 42 },
  { time: '11:00', ms: 38 },
  { time: '12:00', ms: 45 },
  { time: '13:00', ms: 30 },
  { time: '14:00', ms: 28 },
  { time: '15:00', ms: 32 },
];

const accuracyData = [
  { source: 'Emails', accuracy: 98 },
  { source: 'Meetings', accuracy: 95 },
  { source: 'Slack', accuracy: 99 },
  { source: 'Docs', accuracy: 94 },
];

export default function AboutUs({ dark }: { dark: boolean }) {
  // Theme colors based on light/dark mode
  const primaryColor = dark ? '#3b82f6' : '#f97316'; // blue-500 : orange-500
  const secondaryColor = dark ? '#1e3a8a' : '#ffedd5'; // blue-900 : orange-50
  const gridColor = dark ? '#1e3a8a' : '#f3f4f6'; // blue-900 : gray-100
  const textColor = dark ? '#bfdbfe' : '#6b7280'; // blue-200 : gray-500

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-10">
      
      {/* Hero Section */}
      <div className="text-center space-y-4 pt-6">
        <h2 className={`text-4xl font-extrabold tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
          Executive Intelligence, <span className={dark ? 'text-blue-500' : 'text-orange-500'}>Automated.</span>
        </h2>
        <p className={`max-w-2xl mx-auto text-lg ${dark ? 'text-blue-200' : 'text-gray-600'}`}>
          ExecPilot AI is designed to sit alongside you, processing chaos into commitments. 
          It autonomously extracts action items, identifies conflicts, and manages your priorities with zero friction.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: <Zap className="w-6 h-6" />, title: 'Latency', value: '24ms' },
          { icon: <Target className="w-6 h-6" />, title: 'Accuracy', value: '96.5%' },
          { icon: <Cpu className="w-6 h-6" />, title: 'LLM Model', value: 'Mistral-8B' },
          { icon: <ShieldCheck className="w-6 h-6" />, title: 'Uptime', value: '99.99%' },
        ].map((metric, i) => (
          <div key={i} className={`p-5 rounded-2xl border shadow-sm flex flex-col items-center justify-center gap-2 transition-all ${
            dark ? 'bg-[#050505] border-blue-900/50 hover:border-blue-700' : 'bg-white border-gray-100 hover:border-orange-300'
          }`}>
            <div className={`p-3 rounded-xl ${dark ? 'bg-[#0a0a0f] text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
              {metric.icon}
            </div>
            <p className={`text-sm font-medium uppercase tracking-widest ${dark ? 'text-blue-400' : 'text-gray-500'}`}>{metric.title}</p>
            <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speed Chart */}
        <div className={`p-6 rounded-2xl border shadow-sm ${dark ? 'bg-[#050505] border-blue-900/50' : 'bg-white border-gray-100'}`}>
          <h3 className={`text-lg font-bold mb-6 ${dark ? 'text-white' : 'text-gray-900'}`}>Agent Processing Speed</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={speedData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="time" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}ms`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: dark ? '#0a0a0f' : '#ffffff',
                    borderColor: dark ? '#1e3a8a' : '#f3f4f6',
                    color: dark ? '#ffffff' : '#111827',
                    borderRadius: '8px'
                  }}
                  itemStyle={{ color: primaryColor, fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="ms" stroke={primaryColor} strokeWidth={3} fillOpacity={1} fill="url(#colorMs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy Chart */}
        <div className={`p-6 rounded-2xl border shadow-sm ${dark ? 'bg-[#050505] border-blue-900/50' : 'bg-white border-gray-100'}`}>
          <h3 className={`text-lg font-bold mb-6 ${dark ? 'text-white' : 'text-gray-900'}`}>Extraction Accuracy by Source</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="source" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} tickFormatter={(val) => `${val}%`} />
                <Tooltip 
                  cursor={{ fill: secondaryColor, opacity: 0.4 }}
                  contentStyle={{ 
                    backgroundColor: dark ? '#0a0a0f' : '#ffffff',
                    borderColor: dark ? '#1e3a8a' : '#f3f4f6',
                    color: dark ? '#ffffff' : '#111827',
                    borderRadius: '8px'
                  }}
                  itemStyle={{ color: primaryColor, fontWeight: 'bold' }}
                />
                <Bar dataKey="accuracy" fill={primaryColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
