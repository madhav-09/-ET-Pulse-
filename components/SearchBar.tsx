"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

const popularSearches = [
  "Tesla", "Nvidia", "Apple", "Microsoft", "Google", "Amazon",
  "Reliance Industries", "Tata Group", "Infosys", "Wipro",
  "Adani Group", "HDFC Bank", "Bajaj Finance",
  "Union Budget 2026", "RBI Monetary Policy", "India GDP Growth",
  "Sensex", "Nifty 50", "Bank Nifty",
  "IPO Market", "Crypto", "AI Startups India",
  "Startup Funding", "IT Sector", "Banking Sector",
  "Elon Musk", "Mukesh Ambani", "Sundar Pichai",
  "OpenAI", "Semiconductor", "EV Market", "Gold Price",
  "Inflation India", "Digital Payments", "Oil Price",
];

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    return popularSearches.filter((s) => s.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); inputRef.current?.focus(); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const go = (term: string) => {
    if (!term.trim()) return;
    setIsFocused(false);
    setQuery(term);
    router.push(`/search?q=${encodeURIComponent(term.trim())}`);
  };

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={(e) => { e.preventDefault(); go(query); }}>
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-3.5 w-3.5 text-white/30 pointer-events-none" />
          <input
            ref={inputRef}
            id="global-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Intelligence Search..."
            className="w-44 sm:w-56 lg:w-64 rounded-xl !bg-white/[0.05] !border-white/[0.08] pl-9 pr-14 py-1.5 text-sm text-white/80 placeholder:text-white/30 focus:!border-amber-400/50 focus:!bg-white/[0.08] transition-all"
          />
          <kbd className="absolute right-2.5 hidden sm:inline-flex items-center gap-0.5 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-white/25 pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </form>

      {isFocused && suggestions.length > 0 && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-white/10 bg-[#121118]/95 backdrop-blur-xl p-1.5 shadow-2xl animate-slide-down z-50">
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/25">Suggestions</p>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => go(s)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/[0.06] hover:text-white"
            >
              <Search className="h-3 w-3 text-white/20 shrink-0" />
              {s}
            </button>
          ))}
        </div>
      )}

      {isFocused && query.trim().length < 2 && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-white/10 bg-[#121118]/95 backdrop-blur-xl p-1.5 shadow-2xl animate-slide-down z-50">
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/25">Trending</p>
          {["Nvidia", "Union Budget 2026", "AI Startups India", "RBI Monetary Policy", "Sensex"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => go(s)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/[0.06] hover:text-white"
            >
              <span className="text-amber-400/60 text-xs">↗</span>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
