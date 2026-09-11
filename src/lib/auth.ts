import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export { hashPassword, verifyPassword, newId } from "@/lib/password";

export const SESSION_COOKIE = "mh_session";

/** Resolve the currently signed-in user from the session cookie. */
export async function getCurrentUser() {
  const store = await cookies();
  const userId = store.get(SESSION_COOKIE)?.value;
  if (!userId) return null;
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return rows[0] ?? null;
}
