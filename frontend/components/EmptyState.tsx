/**
 * 列表/检索结果空状态提示
 */

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center py-12 bg-white rounded-xl border border-zinc-150 text-zinc-400 text-sm">
      {children}
    </div>
  );
}
