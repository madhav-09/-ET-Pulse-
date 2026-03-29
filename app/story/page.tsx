"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ErrorState from "@/components/ErrorState";
import { StorySkeleton } from "@/components/LoadingSkeletons";
import SentimentChart from "@/components/SentimentChart";
import Timeline from "@/components/Timeline";
import type { StoryArc } from "@/types";

const emptyArc: StoryArc = { events: [], players: [], contrarian: "", predictions: [] };

const suggestedTopics = [
  "Jio Financial Services", "Union Budget 2025", "Adani Group",
  "RBI Rate Decision", "Zomato IPO", "India GDP Growth",
];

export default function StoryPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-6xl p-6"><StorySkeleton /></div>}>
      <StoryPageContent />
    </Suspense>
  );
}

function StoryPageContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic")?.trim() ?? "";

  const [query, setQuery] = useState(initialTopic || "Jio Financial Services");
  const [arc, setArc] = useState<StoryArc>(emptyArc);
  const [activeTopic, setActiveTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadTopic = async (nextTopic: string) => {
    if (!nextTopic.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/arc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: nextTopic.trim(), language: "en" }),
      });
      const payload = (await response.json()) as {
        ok?: boolean; data?: { arc?: StoryArc }; error?: { message?: string };
      };
      if (!response.ok || !payload.ok || !payload.data?.arc) throw new Error(payload.error?.message ?? "Failed to load story arc");
      setActiveTopic(nextTopic.trim());
      setArc(payload.data.arc);
    } catch (error) {
      setErrorMessage(String(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialTopic) {
      setQuery(initialTopic);
      void loadTopic(initialTopic);
    }
  }, [initialTopic]);

  const onSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await loadTopic(query);
  };

  const hasData = useMemo(() => arc.events.length > 0, [arc.events.length]);

  return (
    <div className="mx-auto w-full max-w-6xl p-6 animate-fade-in">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-2xl">📊</span>
        <h1 className="text-3xl font-bold">Story Arc Tracker</h1>
      </div>
      <p className="mb-6 text-white/40 text-sm">
        AI builds a complete visual narrative — timeline, key players, sentiment shifts, and what to watch next.
      </p>

      <form onSubmit={onSearch} className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl !bg-white/[0.04] !border-white/[0.08] px-4 py-3 text-sm placeholder:text-white/25 focus:!border-amber-400/50"
          placeholder="e.g. Jio Financial, Union Budget 2025, Adani Group..."
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="rounded-xl bg-amber-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:opacity-40"
        >
          {isLoading ? "Analyzing..." : "Build Arc →"}
        </button>
      </form>

      {!hasData && !isLoading && (
        <div className="mb-6 flex flex-wrap gap-2">
          {suggestedTopics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setQuery(t); void loadTopic(t); }}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/40 transition hover:border-amber-400/30 hover:text-amber-200"
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {errorMessage && <ErrorState title="Story arc unavailable" message={errorMessage} onRetry={() => void loadTopic(query)} />}
      {isLoading && <StorySkeleton />}

      {hasData && (
        <>
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-amber-400/10 border border-amber-400/20 px-3 py-1 text-sm font-medium text-amber-300">
              {activeTopic}
            </span>
            <span className="text-xs text-white/30">{arc.events.length} events tracked</span>
          </div>

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <Timeline events={arc.events} />
            <SentimentChart events={arc.events} title={activeTopic} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="glass-card-static p-6">
              <h2 className="mb-4 text-lg font-bold">Key Players</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {arc.players.map((player) => (
                  <article key={`${player.name}-${player.role}`} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5">
                    <p className="font-semibold text-white/90 text-sm">{player.name}</p>
                    <p className="mt-1 text-xs text-white/40">{player.role}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="glass-card-static p-6">
              <h2 className="mb-3 text-lg font-bold">Contrarian View</h2>
              <p className="text-sm leading-7 text-white/60">{arc.contrarian}</p>

              <h3 className="mb-3 mt-5 text-base font-bold">What to Watch Next</h3>
              <ul className="space-y-2">
                {arc.predictions.map((p) => (
                  <li key={p} className="flex items-start gap-2 rounded-lg bg-amber-400/[0.06] border border-amber-400/10 px-3 py-2.5 text-sm text-amber-200/80">
                    <span className="text-amber-400 shrink-0">→</span> {p}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
