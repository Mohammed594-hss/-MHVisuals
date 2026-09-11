import { cn, initials } from "@/lib/utils";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const sizes: Record<Size, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-24 w-24 text-3xl",
};

export function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src?: string | null;
  name: string;
  size?: Size;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "shrink-0 rounded-full object-cover ring-1 ring-border",
          sizes[size],
          className,
        )}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br from-cyan to-electric font-semibold text-black",
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </div>
  );
}
