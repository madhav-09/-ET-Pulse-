import type { BriefingData } from "@/types";

type BriefingPanelProps = {
  topic: string;
  briefing: BriefingData;
};

export default function BriefingPanel({ topic, briefing }: BriefingPanelProps) {
  return (
    <section className="glass-card-static p-6">
      <h2 className="text-2xl font-bold gradient-text">{topic}</h2>

      <div className="mt-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400/80 mb-2">Summary</h3>
          <p className="leading-7 text-white/70 text-sm">{briefing.summary}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400/80 mb-2">Market Impact</h3>
          <p className="leading-7 text-white/70 text-sm">{briefing.marketImpact}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400/80 mb-2">Key Players</h3>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {briefing.keyPlayers.length > 0 ? (
              briefing.keyPlayers.map((player) => (
                <article key={`${player.name}-${player.role}`} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5">
                  <p className="font-semibold text-white/90 text-sm">{player.name}</p>
                  <p className="mt-1 text-xs text-white/40">{player.role}</p>
                </article>
              ))
            ) : (
              <p className="text-sm text-white/40">No key players identified yet.</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400/80 mb-2">Sector Impact</h3>
          <p className="leading-7 text-white/70 text-sm">{briefing.sectorImpact}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400/80 mb-2">What Changed</h3>
          <p className="leading-7 text-white/70 text-sm">{briefing.whatChanged}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400/80 mb-2">Timeline</h3>
          <ul className="mt-2 space-y-2 text-sm text-white/60">
            {briefing.timeline.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/50" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400/80 mb-3">What to Watch</h3>
          <div className="flex flex-wrap gap-2">
            {briefing.watchSignals.map((signal) => (
              <span key={signal} className="rounded-full bg-amber-400/[0.08] border border-amber-400/20 px-3 py-1.5 text-xs text-amber-200/80">
                {signal}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
