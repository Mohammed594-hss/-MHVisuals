import { scryptSync, timingSafeEqual, randomUUID } from "crypto";

const SALT = "mh-visuals-demo-salt";

export function hashPassword(password: string): string {
  return scryptSync(password, SALT, 32).toString("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  const candidate = scryptSync(password, SALT, 32);
  const stored = Buffer.from(hash, "hex");
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}

export function newId(): string {
  return randomUUID();
}
