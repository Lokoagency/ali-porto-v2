import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPost, toMeta } from "@/lib/journal";
import { formatDate, PostCard } from "@/components/journal/PostCard";
import { ReadingProgress } from "@/components/journal/ReadingProgress";
import { Arrow, Reveal } from "@/components/primitives";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getAllPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return post ? { title: post.title, description: post.excerpt } : {};
}

export default async function PostPage({ params }: PageProps<"/journal/[slug]">) {
  const { slug } = await params;
  const all = await getAllPosts();
  const post = all.find((p) => p.slug === slug);
  if (!post) notFound();
  const more = all.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <>
      <ReadingProgress />
      <article className="mx-auto max-w-[720px] px-5 pb-20 pt-36 sm:px-8 md:pt-44">
        <Reveal>
          <Link href="/journal" className="press group inline-flex items-center gap-2 text-[0.88rem] text-ink-soft hover:text-teal">
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              <Arrow className="size-4 rotate-180" />
            </span>
            Journal
          </Link>
        </Reveal>
        <Reveal delay={0.05} className="mt-10 flex flex-wrap items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted">
          <time dateTime={post.date} className="tabular">{formatDate(post.date)}</time>
          <span>·</span>
          <span className="tabular">{post.minutes} min read</span>
          {post.tags.map((t) => (
            <span key={t} className="rounded-full bg-teal-tint px-2.5 py-0.5 normal-case tracking-normal text-teal">
              {t}
            </span>
          ))}
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mt-6 font-display text-[clamp(2.4rem,6vw,4rem)] leading-[1.04]">{post.title}</h1>
        </Reveal>
        {post.excerpt && (
          <Reveal delay={0.15}>
            <p className="mt-6 font-display-italic text-[1.3rem] leading-snug text-ink-soft">{post.excerpt}</p>
          </Reveal>
        )}
        <Reveal delay={0.2}>
          <div className="mt-10 h-px w-full bg-line-strong" />
          <div className="prose-ali mt-10" dangerouslySetInnerHTML={{ __html: post.html }} />
        </Reveal>
      </article>

      {more.length > 0 && (
        <section className="mx-auto max-w-[1200px] px-5 pb-16 sm:px-8">
          <p className="eyebrow mb-6">Keep reading</p>
          <div className="grid gap-4 md:grid-cols-2">
            {more.map(toMeta).map((m) => (
              <PostCard key={m.slug} post={m} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
