import type { NewsItem } from "@/types";
import Link from "next/link";

type NewsCardProps = {
  item: NewsItem;
  language: string;
};

function sentimentBadge(score: number) {
  if (score >= 67) return { text: "Positive", cls: "sentiment-bg-positive sentiment-positive" };
  if (score <= 33) return { text: "Negative", cls: "sentiment-bg-negative sentiment-negative" };
  return { text: "Neutral", cls: "sentiment-bg-neutral sentiment-neutral" };
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

export default function NewsCard({ item, language }: NewsCardProps) {
  const badge = sentimentBadge(item.sentiment);
  const published = new Date(item.publishedAt);
  const timeStr = Number.isNaN(published.getTime()) ? item.publishedAt : timeAgo(published);

  return (
    <article className="glass-card p-5 flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-white/30">{item.source}</p>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge.cls}`}>
          {badge.text}
        </span>
      </div>

      <h2 className="mt-3 text-sm font-semibold leading-snug text-white/90">{item.title}</h2>
      <p className="mt-2 line-clamp-2 flex-1 text-xs leading-5 text-white/40">{item.summary}</p>

      <p className="mt-3 text-[11px] text-white/20">{timeStr}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/briefing?topic=${encodeURIComponent(item.title)}&language=${encodeURIComponent(language)}`}
          className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-amber-300"
        >
          🧠 Deep Briefing
        </Link>
        <Link
          href={`/story?topic=${encodeURIComponent(item.title)}`}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:bg-white/[0.06] hover:text-white"
        >
          📊 Story Arc
        </Link>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/30 transition hover:bg-white/[0.06] hover:text-white/60"
          >
            Source ↗
          </a>
        )}
      </div>
    </article>
  );
}
