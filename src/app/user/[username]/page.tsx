import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getUserProfile,
  getLikedProjects,
  getDrafts,
  type ProjectCardData,
} from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/lib/actions";
import { Avatar } from "@/components/avatar";
import { ProjectCard } from "@/components/project-card";
import { FollowButton } from "@/components/follow-button";
import { formatCount, cn } from "@/lib/utils";
import {
  Globe,
  MapPin,
  LinkIcon,
  LogOut,
  Plus,
} from "lucide-react";

export const dynamic = "force-dynamic";

type Tab = "projects" | "appreciated" | "about" | "drafts";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { username } = await params;
  const sp = await searchParams;
  const tab = (sp.tab ?? "projects") as Tab;

  const currentUser = await getCurrentUser();
  const profile = await getUserProfile(username, currentUser?.id);
  if (!profile) notFound();

  const { user, stats, isFollowing, isSelf } = profile;

  let projects: ProjectCardData[] = profile.projects;
  if (tab === "appreciated") {
    projects = await getLikedProjects(user.id, currentUser?.id);
  } else if (tab === "drafts") {
    projects = isSelf ? await getDrafts(user.id) : [];
  }

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: "projects", label: "Projects" },
    { key: "appreciated", label: "Appreciated" },
    { key: "about", label: "About" },
    ...(isSelf ? [{ key: "drafts" as Tab, label: "Drafts" }] : []),
  ];

  const socialEntries = Object.entries(user.socials ?? {});

  return (
    <div className="pb-8">
      {/* Banner */}
      <div className="relative -mx-4 h-44 overflow-hidden sm:-mx-6 sm:h-56 lg:-mx-8 lg:rounded-b-2xl">
        {user.bannerUrl ? (
          <img src={user.bannerUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-electric via-surface-2 to-cyan" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg/60 to-transparent" />
      </div>

      {/* Header */}
      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Avatar
              src={user.avatarUrl}
              name={user.displayName}
              size="xl"
              className="ring-4 ring-bg"
            />
            <div className="pb-1">
              <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                {user.displayName}
              </h1>
              <p className="text-sm text-muted">@{user.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSelf ? (
              <>
                <Link
                  href="/studio"
                  className="flex items-center gap-1.5 rounded-xl bg-electric px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
                >
                  <Plus className="h-4 w-4" /> New project
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted hover:border-red-500 hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </form>
              </>
            ) : currentUser ? (
              <FollowButton targetUserId={user.id} initial={isFollowing} />
            ) : (
              <Link
                href="/login"
                className="rounded-xl bg-electric px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
              >
                Follow
              </Link>
            )}

            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted hover:border-cyan hover:text-cyan"
              >
                <Globe className="h-4 w-4" /> Contact
              </a>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
          <Stat value={stats.projects} label="Projects" />
          <Stat value={stats.appreciations} label="Appreciations" />
          <Stat value={stats.followers} label="Followers" />
          <Stat value={stats.following} label="Following" />
        </div>

        {user.location && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
            <MapPin className="h-4 w-4" /> {user.location}
          </p>
        )}

        {socialEntries.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {socialEntries.map(([name, url]) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium capitalize text-muted transition-colors hover:border-cyan hover:text-cyan"
              >
                <LinkIcon className="h-4 w-4" />
                {name}
              </a>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap gap-1 border-b border-border">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/user/${user.username}${t.key === "projects" ? "" : `?tab=${t.key}`}`}
              className={cn(
                "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                tab === t.key
                  ? "border-cyan text-text"
                  : "border-transparent text-muted hover:text-text",
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Content */}
      {tab === "about" ? (
        <AboutTab user={user} />
      ) : projects.length === 0 ? (
        <div className="mt-12 flex flex-col items-center rounded-3xl border border-dashed border-border py-20 text-center">
          <p className="font-display text-lg font-semibold">Nothing here yet</p>
          <p className="mt-1 text-sm text-muted">
            {tab === "drafts"
              ? "No drafts — create one in the Creator Studio."
              : tab === "appreciated"
                ? "No appreciated projects yet."
                : "No published projects yet."}
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

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-display text-xl font-bold">{formatCount(value)}</span>
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}

function AboutTab({
  user,
}: {
  user: {
    bio: string | null;
    skills: string[];
    location: string | null;
    website: string | null;
    createdAt: Date;
  };
}) {
  return (
    <div className="mt-8 max-w-2xl space-y-6">
      {user.bio && (
        <section>
          <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-muted">
            Bio
          </h2>
          <p className="leading-relaxed text-text/90">{user.bio}</p>
        </section>
      )}

      {user.skills.length > 0 && (
        <section>
          <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-muted">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((s) => (
              <span
                key={s}
                className="rounded-full bg-surface px-3 py-1.5 text-sm font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
        {user.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {user.location}
          </span>
        )}
        {user.website && (
          <a
            href={user.website}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-cyan"
          >
            <LinkIcon className="h-4 w-4" /> {user.website.replace(/^https?:\/\//, "")}
          </a>
        )}
        <span>Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
      </section>
    </div>
  );
}
