"use client";

import type { StoryArcEvent } from "@/types";

type TimelineProps = {
  events: StoryArcEvent[];
};

const sentimentStyles: Record<StoryArcEvent["sentiment"], { dot: string; border: string }> = {
  positive: { dot: "bg-emerald-400 shadow-emerald-400/30", border: "border-emerald-400/20" },
  neutral: { dot: "bg-amber-400 shadow-amber-400/30", border: "border-amber-400/20" },
  negative: { dot: "bg-rose-400 shadow-rose-400/30", border: "border-rose-400/20" },
};

export default function Timeline({ events }: TimelineProps) {
  if (events.length === 0) return null;

  const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <section className="glass-card-static p-6">
      <h2 className="mb-5 text-lg font-bold">Timeline</h2>
      <div className="relative pl-8">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-px timeline-line" />

        {sorted.map((event, i) => {
          const style = sentimentStyles[event.sentiment];
          const date = new Date(event.date);
          const dateStr = Number.isNaN(date.getTime())
            ? event.date
            : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

          return (
            <div
              key={`${event.date}-${i}`}
              className={`relative mb-6 last:mb-0 animate-slide-up stagger-${Math.min(i + 1, 8)}`}
            >
              {/* Dot */}
              <div
                className={`timeline-dot absolute -left-8 top-1 h-[22px] w-[22px] rounded-full border-[3px] border-[#0b0a10] ${style.dot}`}
                style={{ boxShadow: `0 0 8px currentColor` }}
              />

              {/* Card */}
              <div className={`rounded-xl border ${style.border} bg-white/[0.03] p-3.5 transition hover:bg-white/[0.05]`}>
                <p className="text-[11px] text-white/30 mb-1">{dateStr}</p>
                <p className="text-sm font-medium text-white/80 leading-snug">{event.headline}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize sentiment-bg-${event.sentiment} sentiment-${event.sentiment}`}>
                    {event.sentiment}
                  </span>
                  <span className="text-[10px] text-white/25">Score: {event.sentimentScore.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
