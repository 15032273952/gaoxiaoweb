/**
 * 站内搜索表单（GET /search?q=），无需客户端 JS
 */

export function SearchForm({
  compact = false,
  defaultQuery = "",
  id = "site-search",
}: {
  compact?: boolean;
  defaultQuery?: string;
  id?: string;
}) {
  return (
    <form action="/search" method="get" role="search" className="flex items-stretch gap-0">
      <label htmlFor={id} className="sr-only">
        站内搜索
      </label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultQuery}
        placeholder={compact ? "搜索…" : "搜索新闻、通知、师资、部门"}
        className={
          compact
            ? "w-44 lg:w-56 rounded-l border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-800 outline-none focus:border-thu-purple"
            : "flex-1 rounded-l border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-thu-purple"
        }
      />
      <button
        type="submit"
        className="rounded-r bg-thu-purple px-3 text-sm text-white hover:bg-thu-purple-dark transition-colors"
      >
        搜索
      </button>
    </form>
  );
}
