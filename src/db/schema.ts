import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),
  location: text("location"),
  website: text("website"),
  socials: jsonb("socials").$type<Record<string, string>>().notNull().default(sql`'{}'::jsonb`),
  skills: jsonb("skills").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
export const projects = pgTable(
  "projects",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    coverUrl: text("cover_url").notNull(),
    discipline: text("discipline").notNull(),
    tools: jsonb("tools").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    palette: jsonb("palette").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    tags: jsonb("tags").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    status: text("status").notNull().default("published"), // published | draft
    viewCount: integer("view_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("projects_user_idx").on(t.userId),
    index("projects_discipline_idx").on(t.discipline),
  ],
);

// ---------------------------------------------------------------------------
// Media (content blocks inside a project)
// ---------------------------------------------------------------------------
export const media = pgTable(
  "media",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // image | video | text | code
    url: text("url"),
    content: text("content"),
    caption: text("caption"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("media_project_idx").on(t.projectId)],
);

// ---------------------------------------------------------------------------
// Likes (Appreciations)
// ---------------------------------------------------------------------------
export const likes = pgTable(
  "likes",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("likes_project_user").on(t.projectId, t.userId)],
);

// ---------------------------------------------------------------------------
// Bookmarks
// ---------------------------------------------------------------------------
export const bookmarks = pgTable(
  "bookmarks",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("bookmarks_project_user").on(t.projectId, t.userId)],
);

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------
export const comments = pgTable(
  "comments",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("comments_project_idx").on(t.projectId)],
);

// ---------------------------------------------------------------------------
// Follows
// ---------------------------------------------------------------------------
export const follows = pgTable(
  "follows",
  {
    id: text("id").primaryKey(),
    followerId: text("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: text("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("follows_pair").on(t.followerId, t.followingId)],
);

// ---------------------------------------------------------------------------
// Relations (enables db.query.*.with(...))
// ---------------------------------------------------------------------------
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  likes: many(likes),
  bookmarks: many(bookmarks),
  comments: many(comments),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  media: many(media),
  likes: many(likes),
  bookmarks: many(bookmarks),
  comments: many(comments),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  project: one(projects, { fields: [media.projectId], references: [projects.id] }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  project: one(projects, { fields: [likes.projectId], references: [projects.id] }),
  user: one(users, { fields: [likes.userId], references: [users.id] }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  project: one(projects, { fields: [bookmarks.projectId], references: [projects.id] }),
  user: one(users, { fields: [bookmarks.userId], references: [users.id] }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  project: one(projects, { fields: [comments.projectId], references: [projects.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
}));

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------
export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Media = typeof media.$inferSelect;
export type Comment = typeof comments.$inferSelect;
