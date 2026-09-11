import { getCurrentUser } from "@/lib/auth";
import { getFeed } from "@/lib/data";
import { FilterBar } from "@/components/filter-bar";
import { ProjectCard } from "@/components/project-card";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ discipline?: string; q?: string }>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const discipline = params.discipline ?? "all";
  const q = params.q ?? "";
  const user = await getCurrentUser();
  const projects = await getFeed({ discipline, q, currentUserId: user?.id });

  return (
    <div>
      <header className="py-10 sm:py-14">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan">
          The creative portfolio network
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
          Discover world-class{" "}
          <span className="text-cyan glow-text">visual craft</span>.
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Showcase projects, get appreciated and collaborate with graphic designers,
          3D artists, packaging specialists and visual creators from around the world.
        </p>
      </header>

      <FilterBar active={discipline} q={q} />

      {projects.length === 0 ? (
        <div className="mt-16 flex flex-col items-center rounded-3xl border border-dashed border-border py-20 text-center">
          <p className="font-display text-lg font-semibold">No projects found</p>
          <p className="mt-1 text-sm text-muted">
            Try a different filter, or be the first to publish in this category.
          </p>
        </div>
      ) : (
        <div className="mt-8 columns-1 gap-6 sm:columns-2 lg:columns-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
