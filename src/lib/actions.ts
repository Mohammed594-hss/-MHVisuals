"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  projects,
  likes,
  bookmarks,
  comments,
  media,
  follows,
} from "@/db/schema";
import {
  getCurrentUser,
  hashPassword,
  verifyPassword,
  newId,
  SESSION_COOKIE,
} from "@/lib/auth";
import { slugify } from "@/lib/utils";

function revalidateAll() {
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export async function registerUser(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("displayName") ?? "").trim() || username;
  const password = String(formData.get("password") ?? "");

  if (!username || !email || !password) {
    return { error: "All fields are required." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const existing = await db
    .select()
    .from(users)
    .where(or(eq(users.email, email), eq(users.username, username)))
    .limit(1);
  if (existing.length) {
    return { error: "Email or username is already taken." };
  }

  const id = newId();
  await db.insert(users).values({
    id,
    username: slugify(username) || username.toLowerCase(),
    email,
    displayName,
    passwordHash: hashPassword(password),
    skills: [],
    socials: {},
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidateAll();
  redirect("/");
}

export async function loginUser(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Invalid email or password." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidateAll();
  redirect("/");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  revalidateAll();
  redirect("/");
}

// ---------------------------------------------------------------------------
// Engagement
// ---------------------------------------------------------------------------
export async function toggleAppreciate(projectId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "auth" };

  const [existing] = await db
    .select()
    .from(likes)
    .where(and(eq(likes.projectId, projectId), eq(likes.userId, user.id)))
    .limit(1);

  if (existing) {
    await db
      .delete(likes)
      .where(and(eq(likes.projectId, projectId), eq(likes.userId, user.id)));
  } else {
    await db.insert(likes).values({ id: newId(), projectId, userId: user.id });
  }
  revalidateAll();
  return { ok: true };
}

export async function toggleBookmark(projectId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "auth" };

  const [existing] = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.projectId, projectId), eq(bookmarks.userId, user.id)))
    .limit(1);

  if (existing) {
    await db
      .delete(bookmarks)
      .where(and(eq(bookmarks.projectId, projectId), eq(bookmarks.userId, user.id)));
  } else {
    await db.insert(bookmarks).values({ id: newId(), projectId, userId: user.id });
  }
  revalidateAll();
  return { ok: true };
}

export async function toggleFollow(targetUserId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "auth" };
  if (user.id === targetUserId) return { error: "self" };

  const [existing] = await db
    .select()
    .from(follows)
    .where(and(eq(follows.followerId, user.id), eq(follows.followingId, targetUserId)))
    .limit(1);

  if (existing) {
    await db
      .delete(follows)
      .where(and(eq(follows.followerId, user.id), eq(follows.followingId, targetUserId)));
  } else {
    await db.insert(follows).values({
      id: newId(),
      followerId: user.id,
      followingId: targetUserId,
    });
  }
  revalidateAll();
  return { ok: true };
}

export async function addComment(projectId: string, body: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "auth" };
  const text = body.trim();
  if (!text) return { error: "empty" };

  await db.insert(comments).values({
    id: newId(),
    projectId,
    userId: user.id,
    body: text,
  });
  revalidateAll();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Project creation
// ---------------------------------------------------------------------------
export type BlockInput = {
  type: "image" | "video" | "text" | "code";
  url?: string;
  content?: string;
  caption?: string;
};

export type CreateProjectInput = {
  title: string;
  description: string;
  discipline: string;
  coverUrl: string;
  tools: string[];
  palette: string[];
  tags: string[];
  status: "published" | "draft";
  blocks: BlockInput[];
};

export async function createProject(input: CreateProjectInput) {
  const user = await getCurrentUser();
  if (!user) return { error: "auth" };

  const title = input.title.trim();
  if (!title) return { error: "Title is required." };
  if (!input.coverUrl) return { error: "Cover image is required." };

  const id = newId();
  const base = slugify(title) || "project";
  const slug = `${base}-${id.slice(0, 6)}`;

  await db.insert(projects).values({
    id,
    slug,
    userId: user.id,
    title,
    description: input.description.trim(),
    coverUrl: input.coverUrl,
    discipline: input.discipline || "branding",
    tools: input.tools,
    palette: input.palette,
    tags: input.tags,
    status: input.status,
    viewCount: 0,
  });

  const blocks = input.blocks.filter(
    (b) => (b.type === "text" || b.type === "code" ? b.content?.trim() : b.url?.trim()),
  );
  if (blocks.length) {
    await db.insert(media).values(
      blocks.map((b, i) => ({
        id: newId(),
        projectId: id,
        type: b.type,
        url: b.url ?? null,
        content: b.content ?? null,
        caption: b.caption ?? null,
        sortOrder: i,
      })),
    );
  }

  revalidateAll();
  redirect(`/project/${slug}`);
}
