/**
 * 附件下载列表，统一详情页 / 栏目页附件展示
 */

export function AttachmentList({
  items,
  title = "附件下载",
}: {
  items: { name: string; url: string; size?: number }[];
  title?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-8 border-t border-zinc-200 pt-6">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <ul className="space-y-2">
        {items.map((att, i) => (
          <li key={`${att.url}-${i}`}>
            <a
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-thu-purple hover:underline text-sm"
            >
              {att.name}
              {att.size ? ` (${(att.size / 1024).toFixed(1)} KB)` : ""}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
