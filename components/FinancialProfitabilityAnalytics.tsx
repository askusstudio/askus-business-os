'use client'
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function FinancialProfitabilityAnalytics({
  projects,
  invoices,
  projectHoursMap,
}: {
  projects: any[];
  invoices: any[];
  projectHoursMap: Record<string, number>;
}) {
  const HOURLY_STUDIO_COST = 500; // e.g. ₹500/hr internal operational cost

  const chartData = projects.slice(0, 6).map((proj) => {
    const billedAmount = invoices
      .filter((i) => String(i.project_id) === String(proj.id) && i.status === 'Paid')
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    const loggedHrs = projectHoursMap[proj.id] || 0;
    const internalCost = loggedHrs * HOURLY_STUDIO_COST;
    const netProfit = Math.max(0, billedAmount - internalCost);

    return {
      name: proj.title.length > 12 ? proj.title.slice(0, 12) + '...' : proj.title,
      revenue: billedAmount,
      cost: internalCost,
      profit: netProfit,
    };
  });

  const totalBilled = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((a, c) => a + Number(c.amount || 0), 0);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Financial Health & Project Margins</h2>
          <p className="text-xs text-slate-500">Collected Revenue vs Logged Team Cost</p>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Collected: ₹{totalBilled.toLocaleString()}
        </span>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
            <YAxis stroke="#94a3b8" fontSize={10} />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
            />
            <Bar dataKey="revenue" fill="#059669" name="Revenue (₹)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cost" fill="#f43f5e" name="Team Cost (₹)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}