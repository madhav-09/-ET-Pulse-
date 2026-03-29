"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import BriefingPanel from "@/components/BriefingPanel";
import ChatBox from "@/components/ChatBox";
import ErrorState from "@/components/ErrorState";
import LanguageToggle from "@/components/LanguageToggle";
import { BriefingSkeleton } from "@/components/LoadingSkeletons";
import type { BriefingData, SupportedLanguage } from "@/types";

const emptyBriefing: BriefingData = {
  summary: "", marketImpact: "", keyPlayers: [], sectorImpact: "", timeline: [], whatChanged: "", watchSignals: [],
};

const languageNames: Record<SupportedLanguage, string> = {
  en: "English", hi: "Hindi", ta: "Tamil", te: "Telugu", bn: "Bengali",
};

const suggestedTopics = [
  "Union Budget 2025", "RBI Monetary Policy", "India GDP Growth", "Sensex Rally", "Startup Funding Winter",
];

async function translateChunk(text: string, language: SupportedLanguage) {
  if (!text.trim() || language === "en") return text;
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });
  const payload = (await response.json()) as {
    ok?: boolean; data?: { translation?: string }; error?: { message?: string };
  };
  if (!response.ok || !payload.ok) throw new Error(payload.error?.message ?? "Translation failed");
  return payload.data?.translation ?? text;
}

export default function BriefingPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-6xl p-6"><BriefingSkeleton /></div>}>
      <BriefingPageContent />
    </Suspense>
  );
}

function BriefingPageContent() {
  const searchParams = useSearchParams();
  const topicFromQuery = searchParams.get("topic")?.trim() || "";
  const initialLanguage = (searchParams.get("language")?.trim().toLowerCase() ?? "en") as SupportedLanguage;

  const [topicInput, setTopicInput] = useState(topicFromQuery || "Union Budget 2025");
  const [topic, setTopic] = useState(topicFromQuery || "Union Budget 2025");
  const [language, setLanguage] = useState<SupportedLanguage>(
    ["en", "hi", "ta", "te", "bn"].includes(initialLanguage) ? initialLanguage : "en",
  );
  const [baseBriefing, setBaseBriefing] = useState<BriefingData>(emptyBriefing);
  const [displayBriefing, setDisplayBriefing] = useState<BriefingData>(emptyBriefing);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadBriefing = useCallback(async (t: string) => {
    if (!t.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t }),
      });
      const payload = (await response.json()) as {
        ok?: boolean; data?: { briefing?: BriefingData }; error?: { message?: string };
      };
      if (!response.ok || !payload.ok || !payload.data?.briefing) throw new Error(payload.error?.message ?? "Failed to load briefing");
      setBaseBriefing(payload.data.briefing);
    } catch (error) {
      setErrorMessage(String(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadBriefing(topic); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (topicFromQuery && topicFromQuery !== topic) {
      setTopic(topicFromQuery);
      setTopicInput(topicFromQuery);
      void loadBriefing(topicFromQuery);
    }
  }, [topicFromQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const run = async () => {
      if (!baseBriefing.summary) { setDisplayBriefing(baseBriefing); return; }
      if (language === "en") { setDisplayBriefing(baseBriefing); return; }
      setIsTranslating(true);
      setErrorMessage(null);
      try {
        const [summary, marketImpact, sectorImpact, whatChanged, timelineText, watchSignalsText] = await Promise.all([
          translateChunk(baseBriefing.summary, language),
          translateChunk(baseBriefing.marketImpact, language),
          translateChunk(baseBriefing.sectorImpact, language),
          translateChunk(baseBriefing.whatChanged, language),
          translateChunk(baseBriefing.timeline.join("\n"), language),
          translateChunk(baseBriefing.watchSignals.join("\n"), language),
        ]);
        setDisplayBriefing({
          ...baseBriefing, summary, marketImpact, sectorImpact, whatChanged,
          timeline: timelineText.split("\n").map((s) => s.trim()).filter(Boolean),
          watchSignals: watchSignalsText.split("\n").map((s) => s.trim()).filter(Boolean),
        });
      } catch (error) {
        setErrorMessage(String(error));
      } finally {
        setIsTranslating(false);
      }
    };
    void run();
  }, [language, baseBriefing]);

  const chatContext = useMemo(
    () => JSON.stringify({ topic, language, briefing: displayBriefing }),
    [topic, language, displayBriefing],
  );

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!topicInput.trim()) return;
    setTopic(topicInput.trim());
    void loadBriefing(topicInput.trim());
  };

  return (
    <div className="mx-auto w-full max-w-6xl p-6 animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <span className="text-amber-400">🧠</span> Deep Briefing
          </h1>
          <p className="mt-1 text-sm text-white/40">
            AI synthesizes all coverage into one explorable document
          </p>
        </div>
        <LanguageToggle value={language} onChange={setLanguage} />
      </div>

      <form onSubmit={onSearch} className="mb-3 flex gap-2">
        <input
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          className="w-full rounded-xl !bg-white/[0.04] !border-white/[0.08] px-4 py-3 text-sm placeholder:text-white/25 focus:!border-amber-400/50"
          placeholder="Enter any business topic..."
        />
        <button
          type="submit"
          disabled={isLoading || !topicInput.trim()}
          className="rounded-xl bg-amber-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:opacity-40"
        >
          {isLoading ? "..." : "Brief →"}
        </button>
      </form>

      <div className="mb-6 flex flex-wrap gap-2">
        {suggestedTopics.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTopicInput(t); setTopic(t); void loadBriefing(t); }}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              topic === t
                ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {isTranslating && (
        <p className="mb-3 text-sm text-amber-400/60">Translating to {languageNames[language]}...</p>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          {isLoading && <BriefingSkeleton />}
          {errorMessage && (
            <ErrorState title="Briefing unavailable" message={errorMessage} onRetry={() => void loadBriefing(topic)} />
          )}
          {!isLoading && !errorMessage && <BriefingPanel topic={topic} briefing={displayBriefing} />}
        </div>
        <aside className="w-full lg:w-96">
          <ChatBox context={chatContext} language={language} />
        </aside>
      </div>
    </div>
  );
}
