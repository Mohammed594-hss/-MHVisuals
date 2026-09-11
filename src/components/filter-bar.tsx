import Link from "next/link";
import { Search } from "lucide-react";
import { DISCIPLINES, cn } from "@/lib/utils";

export function FilterBar({ active, q }: { active: string; q?: string }) {
  const isAll = !active || active === "all";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex flex-wrap items-center gap-1.5">
        <Link
          href="/"
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            isAll
              ? "bg-cyan text-black"
              : "border border-border text-muted hover:border-cyan hover:text-cyan",
          )}
        >
          All
        </Link>
        {DISCIPLINES.map((d) => {
          const isActive = active === d.value;
          return (
            <Link
              key={d.value}
              href={`/?discipline=${d.value}`}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-cyan text-black"
                  : "border border-border text-muted hover:border-cyan hover:text-cyan",
              )}
            >
              {d.label}
            </Link>
          );
        })}
      </div>

      <form action="/" method="get" className="flex items-center sm:ml-auto">
        {!isAll && <input type="hidden" name="discipline" value={active} />}
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 focus-within:border-cyan">
          <Search className="h-4 w-4 text-muted" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search projects…"
            className="w-40 bg-transparent text-sm outline-none placeholder:text-muted sm:w-56"
          />
        </div>
      </form>
    </div>
  );
}
