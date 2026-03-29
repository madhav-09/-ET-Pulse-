"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import type { SupportedLanguage } from "@/types";

type ChatBoxProps = {
  context: string;
  language: SupportedLanguage;
};

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

const suggestedQuestions = [
  "What are the key risks?",
  "How does this impact investors?",
  "What should I watch next?",
];

export default function ChatBox({ context, language }: ChatBoxProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Ask me anything about this topic. I'll analyze and respond." },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const askQuestion = async (q: string) => {
    if (!q.trim()) return;
    const userMessage = q.trim();
    const prompt =
      language === "en"
        ? userMessage
        : `${userMessage}\n\nRespond in ${language} with simple, practical wording.`;

    setMessages((cur) => [...cur, { role: "user", text: userMessage }]);
    setQuestion("");
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt, context }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        data?: { answer?: string };
        error?: { message?: string };
      };

      if (!response.ok || !payload.ok) throw new Error(payload.error?.message ?? "No answer returned.");

      setMessages((cur) => [
        ...cur,
        { role: "assistant", text: payload.data?.answer?.trim() || "No answer returned." },
      ]);
    } catch (error) {
      setErrorMessage(String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await askQuestion(question);
  };

  return (
    <section className="glass-card-static p-5">
      <h2 className="mb-4 text-base font-bold flex items-center gap-2">
        <span className="text-amber-400">💬</span> Ask Follow-up
      </h2>

      {/* Messages */}
      <div className="mb-4 max-h-72 space-y-2.5 overflow-y-auto rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        {messages.map((msg, i) => (
          <div
            key={`${msg.role}-${i}`}
            className={`rounded-xl px-3.5 py-2.5 text-sm ${
              msg.role === "user"
                ? "bg-amber-400/10 border border-amber-400/15 ml-8"
                : "bg-white/[0.04] border border-white/[0.06] mr-8"
            }`}
          >
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/25">
              {msg.role === "user" ? "You" : "AI"}
            </p>
            <p className="text-white/70 leading-relaxed">{msg.text}</p>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-white/30">
            <Loader2 className="h-3 w-3 animate-spin" /> Analyzing...
          </div>
        )}
      </div>

      {/* Suggested questions */}
      {messages.length <= 1 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => void askQuestion(q)}
              className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/40 transition hover:border-amber-400/30 hover:text-amber-300"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about causes, impact, or what to watch next..."
          className="flex-1 rounded-xl !bg-white/[0.04] !border-white/[0.08] px-4 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="rounded-xl bg-amber-400 px-4 py-2.5 text-black transition hover:bg-amber-300 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      {errorMessage && <p className="mt-3 text-xs text-rose-400">{errorMessage}</p>}
    </section>
  );
}
