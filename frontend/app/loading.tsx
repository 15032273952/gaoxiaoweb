export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16" aria-busy="true" aria-live="polite">
      <p className="sr-only">页面加载中</p>
      <div className="h-8 w-40 bg-zinc-100 rounded mb-6 animate-pulse" />
      <div className="space-y-3">
        <div className="h-4 bg-zinc-100 rounded animate-pulse" />
        <div className="h-4 bg-zinc-100 rounded w-5/6 animate-pulse" />
        <div className="h-4 bg-zinc-100 rounded w-2/3 animate-pulse" />
      </div>
    </div>
  );
}
