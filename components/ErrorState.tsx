import { AlertTriangle } from "lucide-react";

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export default function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <section className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] p-5">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-rose-400" />
        <h3 className="text-sm font-semibold text-rose-300">{title}</h3>
      </div>
      <p className="text-sm text-rose-200/60">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-300 transition hover:bg-rose-500/20"
        >
          Retry
        </button>
      ) : null}
    </section>
  );
}
