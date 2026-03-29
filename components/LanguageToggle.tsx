"use client";

import type { SupportedLanguage } from "@/types";

type LanguageToggleProps = {
  value: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
};

const options: Array<{ code: SupportedLanguage; label: string }> = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिंदी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "bn", label: "বাংলা" },
];

export default function LanguageToggle({ value, onChange }: LanguageToggleProps) {
  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1 gap-0.5">
      {options.map((lang) => (
        <button
          key={lang.code}
          type="button"
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            value === lang.code
              ? "bg-amber-400 text-black shadow-sm"
              : "text-white/50 hover:bg-white/[0.06] hover:text-white/70"
          }`}
          onClick={() => onChange(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
