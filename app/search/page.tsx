"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, TrendingUp, BarChart3, Zap, Users, Eye, MessageSquare, Loader2 } from "lucide-react";
import ChatBox from "@/components/ChatBox";
import SentimentChart from "@/components/SentimentChart";
import Timeline from "@/components/Timeline";
import ErrorState from "@/components/ErrorState";
import type { NewsItem, StoryArc, SearchIntelligence } from "@/types";

type SearchData = {
  query: string;
  news: NewsItem[];
  intelligence: SearchIntelligence;
  arc: StoryArc;
};

const quickSearches = [
  "Nvidia", "Tesla", "Reliance Industries", "Union Budget 2026",
  "RBI Policy", "AI Startups", "Adani Group", "OpenAI",
];

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6"><SearchSkeleton /></div>}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryFromUrl = searchParams.get("q")?.trim() ?? "";

  const [searchInput, setSearchInput] = useState(queryFromUrl);
  const [data, setData] = useState<SearchData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const payload = (await res.json()) as {
        ok?: boolean;
        data?: SearchData;
        error?: { message?: string };
      };
      if (!res.ok || !payload.ok) throw new Error(payload.error?.message ?? "Search failed");
      setData(payload.data ?? null);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (queryFromUrl) {
      setSearchInput(queryFromUrl);
      void doSearch(queryFromUrl);
    }
  }, [queryFromUrl, doSearch]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
  };

  const chatContext = useMemo(
    () => data ? JSON.stringify({ query: data.query, intelligence: data.intelligence, arc: data.arc }) : "",
    [data],
  );

  const sentimentColor = data?.intelligence.sentiment === "Positive"
    ? "sentiment-positive" : data?.intelligence.sentiment === "Negative"
    ? "sentiment-negative" : "sentiment-neutral";

  const sentimentBg = data?.intelligence.sentiment === "Positive"
    ? "sentiment-bg-positive" : data?.intelligence.sentiment === "Negative"
    ? "sentiment-bg-negative" : "sentiment-bg-neutral";

  const impactColor = data?.intelligence.marketImpact === "High"
    ? "text-rose-400" : data?.intelligence.marketImpact === "Medium"
    ? "text-amber-400" : "text-emerald-400";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero Search */}
      <header className="mb-10 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/20">
            <Search className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Intelligence Search</h1>
            <p className="text-sm text-white/40">Search any company, event, or trend</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/25 pointer-events-none" />
            <input
              id="search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search companies, topics, people, events..."
              className="w-full rounded-2xl !bg-white/[0.04] !border-white/[0.08] pl-12 pr-4 py-4 text-lg placeholder:text-white/25 focus:!border-amber-400/50 focus:!bg-white/[0.06]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchInput.trim()}
            className="rounded-2xl bg-amber-400 px-8 py-4 text-sm font-bold text-black transition hover:bg-amber-300 disabled:opacity-40 shrink-0"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search →"}
          </button>
        </form>

        {!data && !isLoading && !error && (
          <div className="mt-4 flex flex-wrap gap-2">
            {quickSearches.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setSearchInput(s); router.push(`/search?q=${encodeURIComponent(s)}`); }}
                className="rounded-full border border-white/10 px-3.5 py-1.5 text-xs text-white/50 transition hover:border-amber-400/30 hover:text-amber-300"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </header>

      {error && <ErrorState title="Search failed" message={error} onRetry={() => doSearch(searchInput)} />}

      {isLoading && <SearchSkeleton />}

      {data && !isLoading && (
        <div className="space-y-8 animate-fade-in">
          {/* Query Badge */}
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-amber-400/10 border border-amber-400/20 px-4 py-1.5 text-sm font-semibold text-amber-300">
              {data.query}
            </span>
            <span className="text-xs text-white/30">{data.news.length} articles · AI analyzed</span>
          </div>

          {/* AI Summary + Metrics */}
          <div className="grid gap-6 lg:grid-cols-3">
            <section className="glass-card-static p-6 lg:col-span-2 animate-slide-up">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-amber-400" />
                <h2 className="text-lg font-bold">AI Intelligence Summary</h2>
              </div>
              <p className="text-sm leading-7 text-white/70">{data.intelligence.summary}</p>
              {data.intelligence.keyThemes.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {data.intelligence.keyThemes.map((theme) => (
                    <span key={theme} className="rounded-full bg-white/[0.06] border border-white/10 px-3 py-1 text-xs text-white/60">
                      {theme}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <div className="flex flex-col gap-4 animate-slide-up stagger-2">
              <div className={`glass-card-static p-5 flex flex-col items-center justify-center text-center`}>
                <BarChart3 className={`h-5 w-5 mb-2 ${sentimentColor}`} />
                <p className="text-xs text-white/40 mb-1">Sentiment</p>
                <p className={`text-xl font-bold ${sentimentColor}`}>{data.intelligence.sentiment}</p>
                <div className={`mt-2 rounded-full px-3 py-0.5 text-xs font-medium ${sentimentBg}`}>
                  Score: {data.intelligence.sentimentScore.toFixed(2)}
                </div>
              </div>
              <div className="glass-card-static p-5 flex flex-col items-center justify-center text-center">
                <TrendingUp className={`h-5 w-5 mb-2 ${impactColor}`} />
                <p className="text-xs text-white/40 mb-1">Market Impact</p>
                <p className={`text-xl font-bold ${impactColor}`}>{data.intelligence.marketImpact}</p>
                <p className="mt-1 text-xs text-white/30">{data.news.length} articles tracked</p>
              </div>
            </div>
          </div>

          {/* Latest News */}
          <section className="animate-slide-up stagger-3">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-4 w-4 text-amber-400" />
              <h2 className="text-lg font-bold">Latest Coverage</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {data.news.map((item, i) => (
                <SearchNewsCard key={item.id} item={item} index={i} />
              ))}
            </div>
          </section>

          {/* Story Arc */}
          {data.arc.events.length > 0 && (
            <section className="animate-slide-up stagger-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-amber-400" />
                <h2 className="text-lg font-bold">Story Arc</h2>
                <span className="text-xs text-white/30">{data.arc.events.length} events tracked</span>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <Timeline events={data.arc.events} />
                <SentimentChart events={data.arc.events} title={data.query} />
              </div>
            </section>
          )}

          {/* Key Players */}
          {data.arc.players.length > 0 && (
            <section className="animate-slide-up stagger-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-amber-400" />
                <h2 className="text-lg font-bold">Key Players</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.arc.players.map((player) => (
                  <div key={`${player.name}-${player.role}`} className="glass-card p-4">
                    <p className="font-semibold text-white/90">{player.name}</p>
                    <p className="mt-1 text-xs text-white/40">{player.role}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contrarian + Predictions */}
          {(data.arc.contrarian || data.arc.predictions.length > 0) && (
            <div className="grid gap-6 lg:grid-cols-2 animate-slide-up stagger-6">
              {data.arc.contrarian && (
                <section className="glass-card-static p-6">
                  <h2 className="text-lg font-bold mb-3">Contrarian View</h2>
                  <p className="text-sm leading-7 text-white/60">{data.arc.contrarian}</p>
                </section>
              )}
              {data.arc.predictions.length > 0 && (
                <section className="glass-card-static p-6">
                  <h2 className="text-lg font-bold mb-3">What to Watch Next</h2>
                  <ul className="space-y-2">
                    {data.arc.predictions.map((p) => (
                      <li key={p} className="flex items-start gap-2 rounded-lg bg-amber-400/[0.06] border border-amber-400/10 px-3 py-2.5 text-sm text-amber-200/80">
                        <span className="text-amber-400 shrink-0">→</span> {p}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}

          {/* Chat */}
          <section className="animate-slide-up stagger-7">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-4 w-4 text-amber-400" />
              <h2 className="text-lg font-bold">Ask Follow-up Questions</h2>
            </div>
            <div className="max-w-2xl">
              <ChatBox context={chatContext} language="en" />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function SearchNewsCard({ item, index }: { item: NewsItem; index: number }) {
  const badge = item.sentiment >= 67
    ? { text: "Positive", cls: "sentiment-bg-positive sentiment-positive" }
    : item.sentiment <= 33
    ? { text: "Negative", cls: "sentiment-bg-negative sentiment-negative" }
    : { text: "Neutral", cls: "sentiment-bg-neutral sentiment-neutral" };

  const published = new Date(item.publishedAt);
  const timeStr = Number.isNaN(published.getTime()) ? item.publishedAt : timeAgo(published);

  return (
    <article className={`glass-card p-5 animate-slide-up stagger-${Math.min(index + 1, 8)}`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-xs font-medium text-white/30">{item.source}</p>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge.cls}`}>{badge.text}</span>
      </div>
      <h3 className="text-sm font-semibold leading-snug text-white/90">{item.title}</h3>
      <p className="mt-2 text-xs leading-5 text-white/40 line-clamp-2">{item.summary}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-white/20">{timeStr}</span>
        {item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-amber-400/60 hover:text-amber-400 transition">
            Read source ↗
          </a>
        )}
      </div>
    </article>
  );
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function SearchSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="skeleton h-6 w-40 rounded-full" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 glass-card-static p-6">
          <div className="skeleton h-5 w-48 mb-4" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-3/4" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="glass-card-static p-5"><div className="skeleton h-16 w-full" /></div>
          <div className="glass-card-static p-5"><div className="skeleton h-16 w-full" /></div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card-static p-5">
            <div className="skeleton h-3 w-20 mb-3" />
            <div className="skeleton h-4 w-full mb-2" />
            <div className="skeleton h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
