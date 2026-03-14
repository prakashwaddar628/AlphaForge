"use client";

import React, { use } from 'react';
import Link from 'next/link';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  ArrowLeft, Brain, Scan, Zap, ShieldCheck, Target, 
  BarChart2, Info, TrendingUp, TrendingDown 
} from 'lucide-react';

// Mock historical data
const generateMockData = (ticker: string) => {
  return Array.from({ length: 30 }, (_, i) => ({
    date: `2024-02-${i + 1}`,
    price: 1400 + Math.random() * 100 + (h => (h > 15 ? i * 2 : i * -2))(i),
    sma: 1420 + i,
    volume: Math.floor(Math.random() * 1000000 + 500000)
  }));
};

export default function AnalysisPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = use(params);
  const data = generateMockData(ticker);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-800 rounded-lg text-xs font-medium border border-slate-700 hover:bg-slate-700">1D</button>
            <button className="px-4 py-2 bg-slate-800 rounded-lg text-xs font-medium border border-slate-700 hover:bg-slate-700">1W</button>
            <button className="px-4 py-2 bg-blue-600 rounded-lg text-xs font-medium border border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]">1M</button>
            <button className="px-4 py-2 bg-slate-800 rounded-lg text-xs font-medium border border-slate-700 hover:bg-slate-700">1Y</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Price & Chart */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">{ticker.split('.')[0]}</h1>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">{ticker} • NSE INDIA</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-100">₹1,452.80</p>
                <p className="text-green-500 font-medium flex items-center justify-end gap-1">
                  +₹24.30 (+1.24%) <TrendingUp className="w-4 h-4" />
                </p>
              </div>
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                  <Line type="monotone" dataKey="sma" stroke="#94a3b8" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="font-bold flex items-center gap-2 mb-4 text-slate-200">
                    <BarChart2 className="w-4 h-4 text-blue-400" /> Technical Indicators
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                        <span className="text-slate-400">RSI (14)</span>
                        <span className="font-mono text-blue-400 font-bold">42.50 (Neutral)</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                        <span className="text-slate-400">MACD</span>
                        <span className="font-mono text-green-500 font-bold">Bullish Crossover</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                        <span className="text-slate-400">SMA 50/200</span>
                        <span className="font-mono text-slate-200 font-bold">Golden Cross Approaching</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Bollinger Bands</span>
                        <span className="font-mono text-slate-200 font-bold">Price near Mid-band</span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="font-bold flex items-center gap-2 mb-4 text-slate-200">
                    <Zap className="w-4 h-4 text-yellow-400" /> Sentiment Analysis (FinBERT)
                </h3>
                <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl font-bold text-green-500">+0.74</div>
                    <div className="text-xs text-slate-500">
                        Based on 12 news articles and 435 social mentions in the last 24h.
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                        <div className="h-full bg-green-500" style={{ width: '70%' }}></div>
                        <div className="h-full bg-slate-700" style={{ width: '20%' }}></div>
                        <div className="h-full bg-red-500" style={{ width: '10%' }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 tracking-tighter">
                        <span>70% Positive</span>
                        <span>20% Neutral</span>
                        <span>10% Negative</span>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-blue-800 rounded-2xl p-6 backdrop-blur-sm shadow-[0_0_20px_rgba(30,58,138,0.2)]">
            <h3 className="font-bold flex items-center gap-2 mb-6 text-slate-100">
              <Brain className="w-5 h-5 text-blue-300" /> AI Recommendation
            </h3>
            
            <div className="mb-6 text-center">
                <div className="inline-block px-8 py-4 bg-blue-600 rounded-2xl text-2xl font-black mb-2 shadow-lg border border-blue-400 uppercase">
                    Strong Buy
                </div>
                <p className="text-xs text-blue-300 font-medium tracking-wide">CONFIDENCE SCORE: 88.4%</p>
            </div>

            <div className="space-y-4">
                <div className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <Target className="w-4 h-4 text-blue-300" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-100 mb-0.5">Price Target</p>
                        <p className="text-sm text-blue-200">₹1,540.00 (+6.0%)</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <ShieldCheck className="w-4 h-4 text-blue-300" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-100 mb-0.5">Risk Level</p>
                        <p className="text-sm text-blue-200">Low to Moderate</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <Scan className="w-4 h-4 text-blue-300" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-100 mb-0.5">Top Catalyst</p>
                        <p className="text-sm text-blue-200">Strong earnings beat expectations and positive management guidance.</p>
                    </div>
                </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="font-bold flex items-center gap-2 mb-4 text-slate-200">
                <BarChart2 className="w-4 h-4 text-blue-400" /> Key Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <p className="text-slate-500 mb-1">Mkt Cap</p>
                    <p className="font-bold">18.52T</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <p className="text-slate-500 mb-1">P/E Ratio</p>
                    <p className="font-bold">24.5</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <p className="text-slate-500 mb-1">ROE</p>
                    <p className="font-bold">14.2%</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <p className="text-slate-500 mb-1">Div Yield</p>
                    <p className="font-bold">0.8%</p>
                </div>
            </div>
          </div>
          
          <Link href="#" className="block w-full text-center py-4 bg-slate-100 hover:bg-white text-slate-950 font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg">
            Add to Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
