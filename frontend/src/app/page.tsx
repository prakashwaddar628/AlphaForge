"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, Activity, TrendingUp, BarChart3, Newspaper } from 'lucide-react';

const Tickers = ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS"];

export default function Dashboard() {
  const [tickerData, setTickerData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking the fetch from backend for speed in this demo
    // In real app: fetch(`http://localhost:8000/analyze/${ticker}`)
    const fetchData = async () => {
      const data = Tickers.map(ticker => ({
        ticker,
        price: (Math.random() * 2000 + 1000).toFixed(2),
        change: (Math.random() * 5 - 2.5).toFixed(2),
        signal: Math.random() > 0.5 ? "BUY" : "HOLD",
        prediction: Math.random() > 0.5 ? "UP" : "DOWN",
        accuracy: "58.4%"
      }));
      setTickerData(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="text-blue-400 w-5 h-5" /> Market Overview
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-xs text-slate-500 uppercase font-medium">NIFTY 50</p>
              <p className="text-lg font-bold">22,456.80</p>
              <p className="text-xs text-green-500 flex items-center gap-1">+0.45% <ArrowUpRight className="w-3 h-3" /></p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-xs text-slate-500 uppercase font-medium">SENSEX</p>
              <p className="text-lg font-bold">73,672.34</p>
              <p className="text-xs text-green-500 flex items-center gap-1">+0.38% <ArrowUpRight className="w-3 h-3" /></p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-xs text-slate-500 uppercase font-medium">VIX</p>
              <p className="text-lg font-bold">14.25</p>
              <p className="text-xs text-red-500 flex items-center gap-1">-2.10% <ArrowDownRight className="w-3 h-3" /></p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-xs text-slate-500 uppercase font-medium">SENTIMENT</p>
              <p className="text-lg font-bold">Bullish</p>
              <p className="text-xs text-blue-500">Strong Momentum</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="text-blue-400 w-5 h-5" /> AI Prediction Engine
          </h2>
          <button className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">Refresh All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Ticker</th>
                <th className="px-6 py-4">Last Price</th>
                <th className="px-6 py-4">24h Change</th>
                <th className="px-6 py-4">AI Prediction</th>
                <th className="px-6 py-4">Trading Signal</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {tickerData.map((data) => (
                <tr key={data.ticker} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-100">{data.ticker.split('.')[0]}</span>
                      <span className="text-[10px] text-slate-500 uppercase">{data.ticker}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium">₹{data.price}</td>
                  <td className={`px-6 py-4 font-medium ${parseFloat(data.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {parseFloat(data.change) >= 0 ? '+' : ''}{data.change}%
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${data.prediction === 'UP' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
                      <span className="text-sm font-semibold">{data.prediction}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      data.signal === 'BUY' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {data.signal}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/analyze/${data.ticker}`} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg transition-colors border border-slate-700">
                      Analyze
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg"><Newspaper className="w-5 h-5" /></div>
            <h3 className="font-bold">Latest Alpha News</h3>
          </div>
          <p className="text-sm text-slate-400 mb-4 line-clamp-2">FinBERT analyzed 42 major news sources. Overall sentiment remains slightly bullish despite global headwinds.</p>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-xs">
                <p className="font-medium text-slate-200 mb-1">RBI maintains repo rate at 6.5%, market reacts positively...</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-500 font-bold">POS (+0.82)</span>
                  <span className="text-slate-600">2h ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
           <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-600 rounded-lg"><BarChart3 className="w-5 h-5" /></div>
            <h3 className="font-bold">Portfolio Performance</h3>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold">₹12,45,000</span>
            <span className="text-xs text-green-500">+12.4%</span>
          </div>
          <p className="text-xs text-slate-500 mb-6">Past 30 days total return</p>
          <div className="h-24 flex items-end gap-1">
            {[40, 60, 45, 70, 55, 80, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-blue-500/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="font-bold mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Data Feed (NSE)</span>
              <span className="text-green-500 flex items-center gap-1 font-bold"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Active</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Inference Engine</span>
              <span className="text-green-500 font-bold">Ready</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Database Cluster</span>
              <span className="text-green-500 font-bold">Syncing</span>
            </div>
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-[10px] text-blue-400 font-medium">Pro Tip: Deep learning models (LSTM) are currently being retrained for higher precision on volume spikes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
