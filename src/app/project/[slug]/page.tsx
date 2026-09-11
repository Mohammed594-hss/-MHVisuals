import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, incrementProjectViews } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { EngageBar } from "@/components/engage-bar";
import { CommentSection } from "@/components/comment-section";
import { ProjectBlocks } from "@/components/project-blocks";
import { Avatar } from "@/components/avatar";
import { disciplineLabel } from "@/lib/utils";
import { Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const data = await getProjectBySlug(slug, user?.id);
  if (!data) notFound();

  await incrementProjectViews(data.project.id);

  const { project, author, blocks, comments, likeCount, commentCount, likedByMe, bookmarkedByMe } =
    data;

  return (
    <article className="py-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-cyan/10 px-3 py-1 text-xs font-semibold text-cyan">
          {disciplineLabel(project.discipline)}
        </span>
        {project.status === "draft" && (
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
            Draft
          </span>
        )}
      </div>

      <h1 className="max-w-4xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
        {project.title}
      </h1>

      <div className="mt-4 flex items-center gap-3">
        <Link href={`/user/${author.username}`}>
          <Avatar src={author.avatarUrl} name={author.displayName} size="md" />
        </Link>
        <div className="flex flex-col">
          <Link
            href={`/user/${author.username}`}
            className="text-sm font-semibold hover:text-cyan"
          >
            {author.displayName}
          </Link>
          <span className="flex items-center gap-1 text-xs text-muted">
            <Eye className="h-3.5 w-3.5" /> {project.viewCount} views
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="min-w-0 space-y-8">
          <img
            src={project.coverUrl}
            alt={project.title}
            className="w-full rounded-2xl border border-border"
          />

          {project.description && (
            <p className="max-w-3xl text-lg leading-relaxed text-text/90">
              {project.description}
            </p>
          )}

          <ProjectBlocks blocks={blocks} />

          <div className="border-t border-border pt-8">
            <CommentSection
              projectId={project.id}
              comments={comments}
              isAuthed={Boolean(user)}
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
          <EngageBar
            projectId={project.id}
            initialLiked={likedByMe}
            initialBookmarked={bookmarkedByMe}
            likeCount={likeCount}
            commentCount={commentCount}
          />

          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-muted">
              Project info
            </h2>

            {project.tools.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-medium text-muted">Software / Tools</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.tools.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-border px-2.5 py-1 text-xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.palette.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-medium text-muted">Color palette</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.palette.map((c) => (
                    <span
                      key={c}
                      title={c}
                      className="h-7 w-7 rounded-md border border-border"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}

            {project.tags.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <Avatar src={author.avatarUrl} name={author.displayName} size="md" />
              <div className="min-w-0">
                <Link
                  href={`/user/${author.username}`}
                  className="block truncate text-sm font-semibold hover:text-cyan"
                >
                  {author.displayName}
                </Link>
                <p className="truncate text-xs text-muted">@{author.username}</p>
              </div>
            </div>
            {author.bio && (
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
                {author.bio}
              </p>
            )}
            <Link
              href={`/user/${author.username}`}
              className="mt-4 block rounded-xl bg-electric py-2.5 text-center text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              View profile
            </Link>
          </section>
        </aside>
      </div>
    </article>
  );
}
