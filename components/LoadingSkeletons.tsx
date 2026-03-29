type BlockProps = {
  className: string;
};

function Block({ className }: BlockProps) {
  return <div className={`skeleton ${className}`} />;
}

export function FeedSkeleton() {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <article key={index} className="glass-card-static p-5">
          <Block className="h-3 w-20" />
          <Block className="mt-3 h-4 w-4/5" />
          <Block className="mt-2 h-3 w-full" />
          <Block className="mt-1 h-3 w-3/4" />
          <div className="mt-4 flex gap-2">
            <Block className="h-8 w-28 rounded-lg" />
            <Block className="h-8 w-20 rounded-lg" />
          </div>
        </article>
      ))}
    </section>
  );
}

export function BriefingSkeleton() {
  return (
    <section className="glass-card-static p-6">
      <Block className="h-7 w-2/3" />
      <Block className="mt-6 h-3 w-20" />
      <Block className="mt-3 h-4 w-full" />
      <Block className="mt-2 h-4 w-full" />
      <Block className="mt-2 h-4 w-4/5" />
      <Block className="mt-6 h-3 w-24" />
      <Block className="mt-3 h-4 w-full" />
      <Block className="mt-2 h-4 w-3/4" />
    </section>
  );
}

export function StorySkeleton() {
  return (
    <>
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <section className="glass-card-static p-6">
          <Block className="h-5 w-24" />
          <Block className="mt-4 h-56 w-full" />
        </section>
        <section className="glass-card-static p-6">
          <Block className="h-5 w-36" />
          <Block className="mt-4 h-56 w-full" />
        </section>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-card-static p-6">
          <Block className="h-5 w-28" />
          <Block className="mt-4 h-20 w-full" />
        </section>
        <section className="glass-card-static p-6">
          <Block className="h-5 w-32" />
          <Block className="mt-4 h-24 w-full" />
        </section>
      </div>
    </>
  );
}
