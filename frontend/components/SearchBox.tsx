/**
 * 列表页检索表单（GET 提交）。
 * children 可传入隐藏字段（如保留当前筛选条件）。
 */

export function SearchBox({
  action,
  placeholder,
  buttonLabel = "检索",
  className = "",
  defaultValue = "",
  children,
}: {
  action: string;
  placeholder: string;
  buttonLabel?: string;
  className?: string;
  defaultValue?: string;
  /** 隐藏字段等额外内容（保留当前筛选条件） */
  children?: React.ReactNode;
}) {
  return (
    <form action={action} method="get" className={`flex flex-col sm:flex-row gap-2.5 mb-6 ${className}`}>
      {children}
      <input
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-thu-purple focus:ring-2 focus:ring-thu-purple/20 transition-all shadow-2xs"
      />
      <button
        type="submit"
        className="rounded-xl bg-gradient-to-r from-thu-purple to-thu-purple-dark px-6 py-2.5 text-sm font-medium text-white hover:shadow-md transition-all active-press"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
