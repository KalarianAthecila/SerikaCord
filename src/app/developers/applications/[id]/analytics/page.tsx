"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useApplication } from "../useApplication";
import { Loader2, Activity, TrendingUp, Server, Users } from "lucide-react";

export default function AnalyticsPage() {
  const params = useParams();
  const appId = params.id as string;
  const { app, loading } = useApplication(appId);
  const [range, setRange] = useState("7d");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-[#8B5CF6]" />
      </div>
    );
  }

  const stats = [
    {
      label: "Active Servers",
      value: app?.serverCount || 0,
      icon: Server,
      change: "+0%",
    },
    {
      label: "Active Users (7d)",
      value: 0,
      icon: Users,
      change: "+0%",
    },
    {
      label: "Commands Used (7d)",
      value: 0,
      icon: TrendingUp,
      change: "+0%",
    },
    {
      label: "Daily Active Servers",
      value: 0,
      icon: Activity,
      change: "+0%",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Analytics</h1>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="bg-[#1a1a1a] border border-white/[0.08] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/50"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="size-5 text-[#8B5CF6]" />
              <span className="text-xs text-green-400 font-medium">{stat.change}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
            <p className="text-xs text-[#888] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-6">
        <h3 className="text-sm font-semibold mb-4">Server Growth Over Time</h3>
        <div className="h-48 flex items-end justify-between gap-1">
          {Array.from({ length: 30 }).map((_, i) => {
            const height = Math.max(4, Math.sin(i / 5) * 30 + 40 + (app?.serverCount || 0) / 10);
            return (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-[#8B5CF6]/40 to-[#8B5CF6]/80 rounded-sm"
                style={{ height: `${Math.min(height, 100)}%` }}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-[#555]">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>

      <p className="text-xs text-[#555] mt-6 text-center">
        Analytics data updates every 24 hours. More detailed metrics available after verification.
      </p>
    </div>
  );
}
