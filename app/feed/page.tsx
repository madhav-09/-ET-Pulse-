"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import ErrorState from "@/components/ErrorState";
import LanguageToggle from "@/components/LanguageToggle";
import { FeedSkeleton } from "@/components/LoadingSkeletons";
import { clearProfile, loadProfile } from "@/lib/profile-storage";
import NewsCard from "@/components/NewsCard";
import type { NewsItem, SupportedLanguage, UserProfile } from "@/types";

const personaLabel: Record<string, string> = {
  investor: "📈 Investor",
  founder: "🚀 Founder",
  student: "🎓 Student",
  trader: "⚡ Trader",
};

export default function FeedPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchNews = useCallback(async (p: UserProfile, lang: SupportedLanguage) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const topicQuery = p.topics.join(", ");
      const response = await fetch(
        `/api/news?topic=${encodeURIComponent(topicQuery)}&language=${encodeURIComponent(lang)}&limit=8`,
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        data?: { news?: NewsItem[] };
        error?: { message?: string };
      };
      if (!response.ok || !payload.ok) throw new Error(payload.error?.message ?? "Failed to load feed");
      setNews(payload.data?.news ?? []);
    } catch (error) {
      setErrorMessage(String(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const parsed = loadProfile();
    if (!parsed) { setIsLoading(false); return; }
    try {
      setProfile(parsed);
      setLanguage(parsed.language);
    } catch {
      setErrorMessage("Saved profile is invalid. Please onboard again.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profile) void fetchNews(profile, language);
  }, [profile, language, fetchNews]);

  if (!profile && !isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl p-6 animate-fade-in">
        <h1 className="mb-2 text-3xl font-bold">My ET</h1>
        <p className="mb-4 text-white/40">Complete onboarding to unlock your personalized feed.</p>
        <Link href="/" className="inline-flex rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black">
          Start Onboarding →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-6 animate-fade-in">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My ET</h1>
          {profile && (
            <p className="mt-1 text-sm text-white/40">
              {personaLabel[profile.persona]} · {profile.topics.join(", ")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <LanguageToggle value={language} onChange={setLanguage} />
          {profile && (
            <button
              type="button"
              onClick={() => void fetchNews(profile, language)}
              disabled={isLoading}
              className="rounded-xl border border-white/10 px-4 py-1.5 text-sm text-white/50 transition hover:bg-white/[0.06] disabled:opacity-40"
            >
              {isLoading ? "Loading..." : "↻ Refresh"}
            </button>
          )}
          {profile && (
            <button
              type="button"
              onClick={() => { clearProfile(); window.location.assign("/"); }}
              className="rounded-xl border border-white/10 px-4 py-1.5 text-sm text-white/50 transition hover:bg-white/[0.06]"
            >
              Switch User
            </button>
          )}
        </div>
      </header>

      {/* Intelligence Search CTA */}
      <div className="mb-6 glass-card-static p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 border border-amber-400/20">
            <Search className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-sm text-white/60">
            Search any company, topic, or trend for instant AI intelligence
          </p>
        </div>
        <Link
          href="/search"
          className="rounded-lg bg-amber-400 px-4 py-1.5 text-xs font-semibold text-black transition hover:bg-amber-300 shrink-0"
        >
          Intelligence Search →
        </Link>
      </div>

      {/* Story Arc CTA */}
      <div className="mb-6 flex items-center justify-between rounded-xl border border-amber-400/15 bg-amber-400/[0.04] px-4 py-3">
        <p className="text-sm text-amber-200/60">
          🔍 Track how any story evolves over time with AI
        </p>
        <Link
          href="/story"
          className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-amber-300"
        >
          Story Arc →
        </Link>
      </div>

      {/* Trending Topics */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/25">Trending Stories</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "🇮🇷 Iran-Israel War", q: "Iran Israel War" },
            { label: "🇺🇸 US Tariffs", q: "US Tariffs Trump" },
            { label: "🤖 OpenAI", q: "OpenAI" },
            { label: "⚡ Nvidia", q: "Nvidia" },
            { label: "🇺🇦 Ukraine War", q: "Ukraine Russia War" },
            { label: "📱 Paytm Crisis", q: "Paytm Crisis" },
            { label: "🏦 RBI Rate Cut", q: "RBI Rate Decision" },
            { label: "📊 Adani Group", q: "Adani Group" },
            { label: "🛢️ Oil Prices", q: "Iran Israel War" },
            { label: "🇮🇳 India GDP", q: "India GDP Growth" },
          ].map((t) => (
            <Link
              key={t.label}
              href={`/story?topic=${encodeURIComponent(t.q)}`}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/50 transition hover:border-amber-400/40 hover:bg-amber-400/[0.06] hover:text-amber-300"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {isLoading && <FeedSkeleton />}
      {errorMessage && (
        <ErrorState
          title="Feed unavailable"
          message={errorMessage}
          onRetry={() => profile && void fetchNews(profile, language)}
        />
      )}
      {!isLoading && !errorMessage && news.length === 0 && (
        <p className="text-white/40">No relevant stories found right now. Try refreshing.</p>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        {news.map((item) => (
          <NewsCard key={item.id} item={item} language={language} />
        ))}
      </section>
    </div>
  );
}
