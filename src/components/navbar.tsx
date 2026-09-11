import Link from "next/link";
import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/avatar";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan font-black text-black glow-box">
            MH
          </span>
          <span className="hidden sm:inline">
            MH<span className="text-cyan">Visuals</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {[
            { href: "/", label: "Explore" },
            { href: "/?discipline=3d", label: "3D" },
            { href: "/?discipline=packaging", label: "Packaging" },
            { href: "/?discipline=branding", label: "Branding" },
          ].map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/studio"
            className="flex items-center gap-1.5 rounded-full bg-electric px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Upload</span>
          </Link>

          <ThemeToggle />

          {user ? (
            <Link href={`/user/${user.username}`} className="ml-1">
              <Avatar src={user.avatarUrl} name={user.displayName} size="sm" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-cyan hover:text-cyan"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
