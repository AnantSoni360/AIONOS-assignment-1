import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, Zap, ShieldCheck, Cpu, Database, BrainCircuit, Server, LayoutDashboard, Activity } from 'lucide-react';

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

      {/* Technical Architecture Flow */}
      <div className="w-full flex flex-col items-center mb-4 mt-2">
        <h3 className={`text-2xl font-bold mb-10 bg-clip-text text-transparent bg-gradient-to-r ${dark ? 'from-blue-400 to-blue-600' : 'from-orange-400 to-orange-600'}`}>
          System Architecture
        </h3>
        
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-4xl gap-2 md:gap-0">
          
          {/* Step 1: Sources */}
          <div className={`flex flex-col items-center justify-center p-5 rounded-2xl border shadow-sm w-48 h-32 relative z-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${dark ? 'bg-[#0a0a0f] border-blue-900/50 hover:border-blue-500' : 'bg-white border-gray-100 hover:border-orange-400'}`}>
            <Database className={`w-8 h-8 mb-3 ${dark ? 'text-blue-500' : 'text-orange-500'}`} />
            <span className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>Raw Sources</span>
            <span className={`text-xs text-center mt-1 font-medium ${dark ? 'text-blue-300/70' : 'text-gray-500'}`}>Slack, Mail, Cal</span>
          </div>

          {/* Animated Arrow 1 */}
          <div className="hidden md:flex flex-1 items-center justify-center h-0.5 relative min-w-[40px] max-w-[80px]">
            <div className={`absolute w-full border-t-2 border-dashed ${dark ? 'border-blue-900/50' : 'border-gray-200'}`}></div>
            <Activity className={`w-5 h-5 absolute animate-pulse ${dark ? 'text-blue-400' : 'text-orange-400'}`} />
          </div>
          
          <div className="flex md:hidden h-8 border-l-2 border-dashed border-gray-200 dark:border-blue-900/50 my-1 animate-pulse"></div>

          {/* Step 2: Extraction Engine */}
          <div className={`flex flex-col items-center justify-center p-5 rounded-2xl border shadow-sm w-48 h-32 relative z-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${dark ? 'bg-[#0a0a0f] border-blue-900/50 hover:border-blue-500' : 'bg-white border-gray-100 hover:border-orange-400'}`}>
            <BrainCircuit className={`w-8 h-8 mb-3 ${dark ? 'text-blue-500' : 'text-orange-500'}`} />
            <span className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>LLM Engine</span>
            <span className={`text-xs text-center mt-1 font-medium ${dark ? 'text-blue-300/70' : 'text-gray-500'}`}>Mistral-8B</span>
          </div>

          {/* Animated Arrow 2 */}
          <div className="hidden md:flex flex-1 items-center justify-center h-0.5 relative min-w-[40px] max-w-[80px]">
            <div className={`absolute w-full border-t-2 border-dashed ${dark ? 'border-blue-900/50' : 'border-gray-200'}`}></div>
            <Activity className={`w-5 h-5 absolute animate-pulse delay-75 ${dark ? 'text-blue-400' : 'text-orange-400'}`} />
          </div>

          <div className="flex md:hidden h-8 border-l-2 border-dashed border-gray-200 dark:border-blue-900/50 my-1 animate-pulse delay-75"></div>

          {/* Step 3: Fast API */}
          <div className={`flex flex-col items-center justify-center p-5 rounded-2xl border shadow-sm w-48 h-32 relative z-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${dark ? 'bg-[#0a0a0f] border-blue-900/50 hover:border-blue-500' : 'bg-white border-gray-100 hover:border-orange-400'}`}>
            <Server className={`w-8 h-8 mb-3 ${dark ? 'text-blue-500' : 'text-orange-500'}`} />
            <span className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>Decision Logic</span>
            <span className={`text-xs text-center mt-1 font-medium ${dark ? 'text-blue-300/70' : 'text-gray-500'}`}>FastAPI Backend</span>
          </div>
          
          {/* Animated Arrow 3 */}
          <div className="hidden md:flex flex-1 items-center justify-center h-0.5 relative min-w-[40px] max-w-[80px]">
            <div className={`absolute w-full border-t-2 border-dashed ${dark ? 'border-blue-900/50' : 'border-gray-200'}`}></div>
            <Activity className={`w-5 h-5 absolute animate-pulse delay-150 ${dark ? 'text-blue-400' : 'text-orange-400'}`} />
          </div>

          <div className="flex md:hidden h-8 border-l-2 border-dashed border-gray-200 dark:border-blue-900/50 my-1 animate-pulse delay-150"></div>

          {/* Step 4: UI Dashboard */}
          <div className={`flex flex-col items-center justify-center p-5 rounded-2xl border w-48 h-32 relative z-10 transition-all duration-300 hover:-translate-y-1 ${dark ? 'bg-[#050505] border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)]'}`}>
            <LayoutDashboard className={`w-8 h-8 mb-3 ${dark ? 'text-blue-500' : 'text-orange-500'}`} />
            <span className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>ExecPilot UI</span>
            <span className={`text-xs text-center mt-1 font-medium ${dark ? 'text-blue-300/70' : 'text-gray-500'}`}>Next.js App</span>
          </div>
        </div>
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
