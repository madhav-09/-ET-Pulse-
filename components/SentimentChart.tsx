"use client";

import type { StoryArcEvent } from "@/types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SentimentChartProps = {
  events: StoryArcEvent[];
  title: string;
};

export default function SentimentChart({ events, title }: SentimentChartProps) {
  const points = events
    .map((event) => ({
      timestamp: new Date(event.date).getTime(),
      date: new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      score: event.sentimentScore,
      headline: event.headline,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  return (
    <section className="glass-card-static p-6">
      <h2 className="mb-1 text-lg font-bold">Sentiment Trend</h2>
      <p className="mb-5 text-xs text-white/40">{title}</p>
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <AreaChart data={points}>
            <defs>
              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={[-1, 1]} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "rgba(10, 10, 16, 0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                color: "#f0ebe5",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#fbbf24"
              strokeWidth={2}
              fill="url(#sentimentGradient)"
              dot={{ fill: "#fbbf24", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: "#fbbf24", stroke: "#0b0a10", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
