"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { loadProfile, saveProfile } from "@/lib/profile-storage";
import type { UserProfile } from "@/types";

const personas: Array<{ value: UserProfile["persona"]; label: string; description: string; icon: string }> = [
  { value: "investor", label: "Investor", description: "Track markets and portfolio opportunities", icon: "📈" },
  { value: "founder", label: "Founder", description: "Funding news and competitor moves", icon: "🚀" },
  { value: "student", label: "Student", description: "Explainer-first business content", icon: "🎓" },
  { value: "trader", label: "Trader", description: "Fast-moving signals and momentum", icon: "⚡" },
];

const topics = ["Markets", "Startups", "Policy", "Banking", "IPO", "Crypto", "Budget", "Tech"];

const languages: Array<{ code: UserProfile["language"]; label: string; native: string }> = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
];

export default function Home() {
  const router = useRouter();
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [step, setStep] = useState(1);
  const [persona, setPersona] = useState<UserProfile["persona"] | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [language, setLanguage] = useState<UserProfile["language"]>("en");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const existing = loadProfile();
    if (existing) { router.replace("/feed"); return; }
    setIsCheckingProfile(false);
  }, [router]);

  const canProceed =
    (step === 1 && Boolean(persona)) ||
    (step === 2 && selectedTopics.length > 0) ||
    step === 3;

  const toggleTopic = (topic: string) => {
    setSelectedTopics((cur) =>
      cur.includes(topic) ? cur.filter((t) => t !== topic) : [...cur, topic],
    );
  };

  const submitProfile = async () => {
    if (!persona || selectedTopics.length === 0) return;
    setIsSubmitting(true);
    try {
      const profile: UserProfile = { persona, topics: selectedTopics, language };
      saveProfile(profile);
      router.push("/feed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = ["Who are you?", "What do you follow?", "Your language"];

  if (isCheckingProfile) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-2xl items-center justify-center p-6">
        <p className="text-sm text-white/40">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-2xl flex-col justify-center gap-8 p-6 animate-fade-in">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          AI-Native News Experience
        </p>
        <h1 className="text-4xl font-bold leading-tight">
          News intelligence for<br />faster decisions.
        </h1>
        <p className="text-white/40">
          Personalized feed · Deep briefings · Story arc tracker · Intelligence search · 5 languages
        </p>
      </header>

      <section className="glass-card-static p-6">
        {/* Progress */}
        <div className="mb-6 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  s <= step ? "bg-amber-400 text-black" : "bg-white/[0.06] text-white/30"
                }`}
              >
                {s < step ? "✓" : s}
              </div>
              {s < 3 && <div className={`h-px w-8 transition-colors ${s < step ? "bg-amber-400" : "bg-white/10"}`} />}
            </div>
          ))}
          <span className="ml-2 text-sm text-white/40">{stepLabels[step - 1]}</span>
        </div>

        {step === 1 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {personas.map((item, i) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setPersona(item.value)}
                className={`rounded-xl border p-5 text-left transition-all animate-slide-up stagger-${i + 1} ${
                  persona === item.value
                    ? "border-amber-400/50 bg-amber-400/[0.08] text-white accent-glow"
                    : "border-white/[0.08] text-white/60 hover:border-white/20 hover:bg-white/[0.04]"
                }`}
              >
                <p className="text-2xl">{item.icon}</p>
                <p className="mt-2 font-semibold text-white/90">{item.label}</p>
                <p className="mt-1 text-sm text-white/40">{item.description}</p>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-sm text-white/40">Select all that apply</p>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => {
                const active = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "border-amber-400/50 bg-amber-400/10 text-amber-300"
                        : "border-white/10 text-white/50 hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-sm text-white/40">Your feed and briefings will adapt to this language</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {languages.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLanguage(item.code)}
                  className={`rounded-xl border p-3.5 text-left transition-all ${
                    language === item.code
                      ? "border-amber-400/50 bg-amber-400/[0.08] text-white"
                      : "border-white/[0.08] text-white/50 hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="font-semibold">{item.native}</span>
                  {item.code !== "en" && (
                    <span className="ml-2 text-xs text-white/30">{item.label}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={isSubmitting}
              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-white/60 transition hover:bg-white/[0.04] disabled:opacity-40"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => canProceed && setStep((s) => s + 1)}
              disabled={!canProceed}
              className="rounded-xl bg-amber-400 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:opacity-40"
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={submitProfile}
              disabled={isSubmitting}
              className="rounded-xl bg-amber-400 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:opacity-40"
            >
              {isSubmitting ? "Setting up..." : "Open My ET →"}
            </button>
          )}
        </div>
      </section>

      <div className="grid grid-cols-4 gap-3 text-center text-xs text-white/30">
        {[
          { icon: "🧠", label: "AI Briefings" },
          { icon: "📊", label: "Story Arc" },
          { icon: "🔎", label: "Intelligence Search" },
          { icon: "🌐", label: "5 Languages" },
        ].map((f, i) => (
          <div key={f.label} className={`glass-card p-3 animate-slide-up stagger-${i + 1}`}>
            <p className="text-lg">{f.icon}</p>
            <p className="mt-1">{f.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
