"use client";

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Target, Zap, ShieldCheck, TrendingUp, RefreshCw } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function PortfolioPage() {
  const [data, setData] = useState<any>(null);
  const [method, setMethod] = useState('sharpe');
  const [loading, setLoading] = useState(true);

  const fetchOptimization = async (optMethod: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/optimize?method=${optMethod}`);
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Optimization failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptimization(method);
  }, [method]);

  const chartData = data ? Object.entries(data.weights).map(([name, value]) => ({
    name: name.split('.')[0],
    value: (value as number) * 100
  })) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Portfolio Optimization</h1>
          <p className="text-slate-400">Maximize returns and minimize risk using Modern Portfolio Theory (MPT).</p>
        </div>
        <div className="flex gap-2 bg-slate-900/50 p-1 border border-slate-800 rounded-xl">
          <button 
            onClick={() => setMethod('sharpe')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${method === 'sharpe' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Max Sharpe Ratio
          </button>
          <button 
            onClick={() => setMethod('min_vol')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${method === 'min_vol' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Min Volatility
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Summary Metrics */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Projected Performance</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg"><TrendingUp className="w-5 h-5 text-green-500" /></div>
                  <span className="text-slate-300 font-medium">Expected Return</span>
                </div>
                <span className="text-xl font-bold">{(data?.expected_return * 100).toFixed(2)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg"><ShieldCheck className="w-5 h-5 text-yellow-500" /></div>
                  <span className="text-slate-300 font-medium">Annual Volatility</span>
                </div>
                <span className="text-xl font-bold">{(data?.volatility * 100).toFixed(2)}%</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg"><Zap className="w-5 h-5 text-blue-500" /></div>
                  <span className="text-slate-300 font-medium">Sharpe Ratio</span>
                </div>
                <span className="text-2xl font-black text-blue-400">{data?.sharpe_ratio.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-blue-900/20 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="font-bold mb-4">Optimization Strategy</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              {method === 'sharpe' 
                ? "The Maximum Sharpe Ratio portfolio aims to achieve the best risk-adjusted return. It finds the point on the Efficient Frontier where the ratio of excess return to volatility is highest."
                : "The Minimum Volatility portfolio focuses on capital preservation and stability. It seeks the specific asset combination that results in the lowest possible overall portfolio risk."
              }
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
               <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Updated every 24 hours
            </div>
          </div>
        </div>

        {/* Center: Allocation Pie Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm relative min-h-[400px]">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" /> Optimal Weight Allocation
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 h-full items-center">
            <div className="h-[300px] w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
                      itemStyle={{ color: '#f8fafc' }}
                      formatter={(val: any) => `${val.toFixed(1)}%`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="space-y-4">
               {data && Object.entries(data.weights).map(([ticker, weight], idx) => (
                 <div key={ticker} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="font-bold text-slate-100">{ticker.split('.')[0]}</span>
                    </div>
                    <span className="font-mono text-sm text-slate-300 tracking-tighter">{((weight as number) * 100).toFixed(1)}%</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
