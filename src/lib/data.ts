import { and, desc, eq, ilike, inArray, count, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  projects,
  media,
  likes,
  bookmarks,
  comments,
  follows,
  type Project,
  type User,
} from "@/db/schema";

export type Author = Pick<User, "id" | "username" | "displayName" | "avatarUrl">;

export type ProjectCardData = Project & {
  author: Author;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  bookmarkedByMe: boolean;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function countByProject(table: typeof likes | typeof comments, ids: string[]) {
  if (ids.length === 0) return {} as Record<string, number>;
  const rows = await db
    .select({ projectId: table.projectId, c: count() })
    .from(table)
    .where(inArray(table.projectId, ids))
    .groupBy(table.projectId);
  return Object.fromEntries(rows.map((r) => [r.projectId, Number(r.c)]));
}

async function likedSet(userId: string, ids: string[]) {
  if (ids.length === 0) return new Set<string>();
  const rows = await db
    .select({ projectId: likes.projectId })
    .from(likes)
    .where(and(eq(likes.userId, userId), inArray(likes.projectId, ids)));
  return new Set(rows.map((r) => r.projectId));
}

async function bookmarkedSet(userId: string, ids: string[]) {
  if (ids.length === 0) return new Set<string>();
  const rows = await db
    .select({ projectId: bookmarks.projectId })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), inArray(bookmarks.projectId, ids)));
  return new Set(rows.map((r) => r.projectId));
}

async function hydrateCards(
  rows: Array<{ project: Project; author: Author }>,
  currentUserId?: string | null,
): Promise<ProjectCardData[]> {
  const ids = rows.map((r) => r.project.id);
  const [likeMap, commentMap] = await Promise.all([
    countByProject(likes, ids),
    countByProject(comments, ids),
  ]);
  const [myLikes, myBookmarks] = currentUserId
    ? await Promise.all([likedSet(currentUserId, ids), bookmarkedSet(currentUserId, ids)])
    : [new Set<string>(), new Set<string>()];

  return rows.map(({ project, author }) => ({
    ...project,
    author,
    likeCount: likeMap[project.id] ?? 0,
    commentCount: commentMap[project.id] ?? 0,
    likedByMe: myLikes.has(project.id),
    bookmarkedByMe: myBookmarks.has(project.id),
  }));
}

// ---------------------------------------------------------------------------
// Feed / exploration
// ---------------------------------------------------------------------------
export async function getFeed(opts: {
  discipline?: string;
  q?: string;
  currentUserId?: string | null;
}): Promise<ProjectCardData[]> {
  const conditions = [eq(projects.status, "published")];
  if (opts.discipline && opts.discipline !== "all") {
    conditions.push(eq(projects.discipline, opts.discipline));
  }
  if (opts.q) {
    const term = `%${opts.q.trim()}%`;
    conditions.push(or(ilike(projects.title, term), ilike(projects.description, term))!);
  }

  const rows = await db
    .select({ project: projects, author: users })
    .from(projects)
    .innerJoin(users, eq(projects.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(projects.createdAt));

  return hydrateCards(rows, opts.currentUserId);
}

// ---------------------------------------------------------------------------
// Project detail
// ---------------------------------------------------------------------------
export async function getProjectBySlug(slug: string, currentUserId?: string | null) {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);

  if (!project) return null;
  // Drafts are only visible to their owner.
  if (project.status === "draft" && project.userId !== currentUserId) return null;

  const [author] = await db.select().from(users).where(eq(users.id, project.userId)).limit(1);
  const blocks = await db
    .select()
    .from(media)
    .where(eq(media.projectId, project.id))
    .orderBy(media.sortOrder);

  const commentRows = await db
    .select({ comment: comments, author: users })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.projectId, project.id))
    .orderBy(desc(comments.createdAt));

  const likeCount = await db
    .select({ c: count() })
    .from(likes)
    .where(eq(likes.projectId, project.id));
  const commentCount = await db
    .select({ c: count() })
    .from(comments)
    .where(eq(comments.projectId, project.id));

  let likedByMe = false;
  let bookmarkedByMe = false;
  if (currentUserId) {
    const [l] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.projectId, project.id), eq(likes.userId, currentUserId)))
      .limit(1);
    const [b] = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.projectId, project.id), eq(bookmarks.userId, currentUserId)))
      .limit(1);
    likedByMe = Boolean(l);
    bookmarkedByMe = Boolean(b);
  }

  return {
    project,
    author,
    blocks,
    comments: commentRows.map(({ comment, author }) => ({
      ...comment,
      author: {
        id: author.id,
        username: author.username,
        displayName: author.displayName,
        avatarUrl: author.avatarUrl,
      },
    })),
    likeCount: Number(likeCount[0]?.c ?? 0),
    commentCount: Number(commentCount[0]?.c ?? 0),
    likedByMe,
    bookmarkedByMe,
  };
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------
export async function getUserProfile(username: string, currentUserId?: string | null) {
  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (!user) return null;

  const published = await db
    .select({ project: projects, author: users })
    .from(projects)
    .innerJoin(users, eq(projects.userId, users.id))
    .where(and(eq(projects.userId, user.id), eq(projects.status, "published")))
    .orderBy(desc(projects.createdAt));

  const projectsCards = await hydrateCards(published, currentUserId);

  const followerCount = await db
    .select({ c: count() })
    .from(follows)
    .where(eq(follows.followingId, user.id));
  const followingCount = await db
    .select({ c: count() })
    .from(follows)
    .where(eq(follows.followerId, user.id));

  const totalAppreciations = await db
    .select({ c: count() })
    .from(likes)
    .innerJoin(projects, eq(likes.projectId, projects.id))
    .where(eq(projects.userId, user.id));

  let isFollowing = false;
  if (currentUserId && currentUserId !== user.id) {
    const [f] = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, user.id)))
      .limit(1);
    isFollowing = Boolean(f);
  }

  return {
    user,
    projects: projectsCards,
    stats: {
      projects: projectsCards.length,
      followers: Number(followerCount[0]?.c ?? 0),
      following: Number(followingCount[0]?.c ?? 0),
      appreciations: Number(totalAppreciations[0]?.c ?? 0),
    },
    isFollowing,
    isSelf: Boolean(currentUserId && currentUserId === user.id),
  };
}

export async function getLikedProjects(
  userId: string,
  viewerId?: string | null,
): Promise<ProjectCardData[]> {
  const likedRows = await db
    .select({ projectId: likes.projectId })
    .from(likes)
    .where(eq(likes.userId, userId));
  const ids = likedRows.map((r) => r.projectId);
  if (ids.length === 0) return [];
  const rows = await db
    .select({ project: projects, author: users })
    .from(projects)
    .innerJoin(users, eq(projects.userId, users.id))
    .where(and(inArray(projects.id, ids), eq(projects.status, "published")))
    .orderBy(desc(projects.createdAt));
  return hydrateCards(rows, viewerId ?? userId);
}

export async function getDrafts(userId: string): Promise<ProjectCardData[]> {
  const rows = await db
    .select({ project: projects, author: users })
    .from(projects)
    .innerJoin(users, eq(projects.userId, users.id))
    .where(and(eq(projects.userId, userId), eq(projects.status, "draft")))
    .orderBy(desc(projects.createdAt));
  return hydrateCards(rows, userId);
}

export async function incrementProjectViews(projectId: string): Promise<void> {
  await db
    .update(projects)
    .set({ viewCount: sql`${projects.viewCount} + 1` })
    .where(eq(projects.id, projectId));
}

export async function getBookmarkedProjects(userId: string): Promise<ProjectCardData[]> {
  const bmRows = await db
    .select({ projectId: bookmarks.projectId })
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId));
  const ids = bmRows.map((r) => r.projectId);
  if (ids.length === 0) return [];
  const rows = await db
    .select({ project: projects, author: users })
    .from(projects)
    .innerJoin(users, eq(projects.userId, users.id))
    .where(and(inArray(projects.id, ids), eq(projects.status, "published")))
    .orderBy(desc(projects.createdAt));
  return hydrateCards(rows, userId);
}
