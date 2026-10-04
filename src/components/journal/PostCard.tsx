import Link from "next/link";
import type { Post } from "@/lib/journal";

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export type PostMeta = Omit<Post, "html">;

export function PostCard({ post, index }: { post: PostMeta; index?: number }) {
  return (
    <Link
      href={`/journal/${post.slug}`}
      className="spotlight group relative flex h-full flex-col rounded-[24px] border border-line bg-card p-6 transition-[box-shadow,transform,border-color] duration-500 hover:-translate-y-1 hover:border-teal/30 hover:shadow-[var(--shadow-md)]"
    >
      <div className="flex items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">
        <time dateTime={post.date} className="tabular">{formatDate(post.date)}</time>
        <span className="tabular">{post.minutes} min</span>
      </div>
      <h3 className="mt-8 font-display text-[1.5rem] leading-tight transition-colors duration-300 group-hover:text-teal">{post.title}</h3>
      <p className="mt-3 flex-1 text-[0.92rem] leading-relaxed text-ink-soft">{post.excerpt}</p>
      <div className="mt-6 flex items-center justify-between">
        <ul className="flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <li key={t} className="rounded-full bg-teal-tint px-2.5 py-0.5 text-[0.72rem] text-teal">
              {t}
            </li>
          ))}
        </ul>
        {index !== undefined && <span className="font-mono text-xs text-muted tabular">{String(index + 1).padStart(2, "0")}</span>}
      </div>
    </Link>
  );
}
