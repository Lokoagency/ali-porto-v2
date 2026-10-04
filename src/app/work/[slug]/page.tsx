import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/projects";
import { Gallery } from "@/components/work/Gallery";
import { StatusTag } from "@/components/home/Work";
import { Arrow, Reveal } from "@/components/primitives";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const p = getProject((await params).slug);
  return p ? { title: p.name, description: p.summary } : {};
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const i = projects.indexOf(p);
  const next = projects[(i + 1) % projects.length];

  return (
    <article className="mx-auto max-w-[1200px] px-5 pb-24 pt-32 sm:px-8 md:pt-36">
      <Reveal>
        <Link href="/#work" className="press group inline-flex items-center gap-2 text-[0.88rem] text-ink-soft hover:text-teal">
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            <Arrow className="size-4 rotate-180" />
          </span>
          All work
        </Link>
      </Reveal>

      <header className="mt-10 max-w-[860px]">
        <Reveal className="flex flex-wrap items-center gap-2">
          <StatusTag status={p.status} />
          <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-wider text-ink-soft">
            {p.category === "No-Code" ? "No-code development" : "Product management"}
          </span>
          {p.ecosystem && <span className="font-mono text-[0.66rem] uppercase tracking-wider text-muted">· {p.ecosystem}</span>}
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mt-6 font-display text-[clamp(2.4rem,5.6vw,4.6rem)] leading-[1.02]">{p.name}</h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-6 text-[1.12rem] leading-relaxed text-ink-soft">{p.header}</p>
        </Reveal>
      </header>

      <Reveal delay={0.18} className="mt-14">
        <Gallery shots={p.screenshots} name={p.name} device={p.device} />
      </Reveal>

      <div className="mt-20 grid gap-14 lg:grid-cols-[1fr_300px]">
        <div>
          <p className="eyebrow mb-8">How it was organized</p>
          <ol className="space-y-0">
            {p.story.map((para, n) => (
              <Reveal as="li" key={n} delay={n * 0.04} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-line py-7">
                <span className="font-mono text-xs text-teal tabular">{String(n + 1).padStart(2, "0")}</span>
                <p className="text-[1.02rem] leading-relaxed text-ink-soft">{para}</p>
              </Reveal>
            ))}
          </ol>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[24px] border border-line bg-card p-6">
            <p className="eyebrow mb-4 text-muted">Tools used</p>
            <ul className="flex flex-wrap gap-2">
              {p.tools.map((t) => (
                <li key={t} className="rounded-full bg-teal-tint px-3 py-1 text-[0.82rem] text-teal">
                  {t}
                </li>
              ))}
            </ul>
            {p.link && (
              <a
                href={p.link}
                target="_blank"
                rel="noreferrer"
                className="press group mt-6 flex h-11 items-center justify-center gap-2 rounded-full bg-ink text-[0.88rem] text-paper hover:bg-teal"
              >
                Visit live site
                <span className="transition-transform duration-300 group-hover:-rotate-45">
                  <Arrow />
                </span>
              </a>
            )}
            <Link
              href="/#contact"
              className="press mt-3 flex h-11 items-center justify-center rounded-full border border-line-strong text-[0.88rem] text-ink hover:border-teal hover:text-teal"
            >
              Interested in similar work?
            </Link>
          </div>
        </aside>
      </div>

      <Reveal className="mt-24">
        <Link
          href={`/work/${next.slug}`}
          className="group flex items-end justify-between gap-6 border-t border-line pt-10"
        >
          <div>
            <p className="eyebrow mb-3 text-muted">Next case</p>
            <p className="font-display text-[clamp(1.8rem,4vw,3rem)] leading-tight transition-colors duration-300 group-hover:text-teal">
              {next.name}
            </p>
          </div>
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full border border-line-strong transition-[transform,background-color,color,border-color] duration-300 group-hover:-rotate-45 group-hover:border-teal group-hover:bg-teal group-hover:text-paper">
            <Arrow className="size-5" />
          </span>
        </Link>
      </Reveal>
    </article>
  );
}
