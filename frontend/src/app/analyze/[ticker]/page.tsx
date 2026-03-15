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
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const chartData = generateMockData(ticker); // Keep mock chart data for now as it needs a separate history endpoint

  React.useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await fetch(`http://localhost:8000/analyze/${ticker}`);
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Fetch failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [ticker]);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]">Loading AI Insights...</div>;
  if (!data) return <div className="p-8 text-center text-red-400">Failed to load analysis for {ticker}</div>;

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
                <p className="text-3xl font-bold text-slate-100">₹{data.last_close.toLocaleString()}</p>
                <p className="text-green-500 font-medium flex items-center justify-end gap-1">
                  AI Conf: {(data.prediction?.probability * 100).toFixed(1)}% <TrendingUp className="w-4 h-4" />
                </p>
              </div>
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
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
                        <span className="text-slate-400">RSI</span>
                        <span className="font-mono text-blue-400 font-bold">{data.technicals.RSI.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                        <span className="text-slate-400">MACD</span>
                        <span className={`font-mono font-bold ${data.technicals.MACD > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {data.technicals.MACD.toFixed(4)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                        <span className="text-slate-400">Volatility (ATR)</span>
                        <span className="font-mono text-slate-200 font-bold">{data.technicals.ATR.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">SMA 20</span>
                        <span className="font-mono text-slate-200 font-bold">{data.technicals.SMA_20.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="font-bold flex items-center gap-2 mb-4 text-slate-200">
                    <Zap className="w-4 h-4 text-yellow-400" /> Sentiment Analysis (FinBERT)
                </h3>
                <div className="flex items-center gap-4 mb-4">
                    <div className={`text-4xl font-bold ${data.sentiment_score >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {data.sentiment_score >= 0 ? '+' : ''}{data.sentiment_score.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500">
                        Institutional sentiment index based on latest news cycle.
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                        <div className="h-full bg-green-500" style={{ width: `${(data.sentiment_score + 1) * 50}%` }}></div>
                        <div className="h-full bg-slate-700" style={{ width: `${100 - (data.sentiment_score + 1) * 50}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 tracking-tighter">
                        <span>Bullish Bias</span>
                        <span>Neutral</span>
                        <span>Bearish Bias</span>
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
                    {data.signal}
                </div>
                <p className="text-xs text-blue-300 font-medium tracking-wide">
                  MODEL: {data.prediction?.prediction} ({(data.prediction?.probability * 100).toFixed(1)}%)
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <Target className="w-4 h-4 text-blue-300" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-100 mb-0.5">LSTM Price Target</p>
                        <p className="text-sm text-blue-200">
                          ₹{data.price_target?.toLocaleString() || 'N/A'} 
                          {data.price_target && ` (${((data.price_target / data.last_close - 1) * 100).toFixed(1)}%)`}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <ShieldCheck className="w-4 h-4 text-blue-300" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-100 mb-0.5">Risk Level</p>
                        <p className="text-sm text-blue-200">{data.sentiment_score > 0.5 ? 'Low' : 'Moderate'}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <Scan className="w-4 h-4 text-blue-300" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-100 mb-0.5">Optimization Suggestion</p>
                        <p className="text-sm text-blue-200">
                          {data.signal.includes('BUY') ? 'Weight up in Max Sharpe portfolio.' : 'Maintain current allocation.'}
                        </p>
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
                    <p className="text-slate-500 mb-1">Last Close</p>
                    <p className="font-bold">₹{data.last_close.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <p className="text-slate-500 mb-1">Probability</p>
                    <p className="font-bold">{(data.prediction?.probability * 100).toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <p className="text-slate-500 mb-1">Sentiment</p>
                    <p className="font-bold">{data.sentiment_score.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <p className="text-slate-500 mb-1">Direction</p>
                    <p className="font-bold">{data.prediction?.prediction}</p>
                </div>
            </div>
          </div>
          
          <Link href="/portfolio" className="block w-full text-center py-4 bg-slate-100 hover:bg-white text-slate-950 font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg">
            Optimize Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
