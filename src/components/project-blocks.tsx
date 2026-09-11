import type { Media } from "@/db/schema";

function embedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

export function ProjectBlocks({ blocks }: { blocks: Media[] }) {
  if (blocks.length === 0) return null;

  return (
    <div className="space-y-8">
      {blocks.map((b) => {
        if (b.type === "image" && b.url) {
          return (
            <figure key={b.id}>
              <img
                src={b.url}
                alt={b.caption ?? ""}
                className="w-full rounded-2xl border border-border"
              />
              {b.caption && (
                <figcaption className="mt-2 text-center text-sm text-muted">
                  {b.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        if (b.type === "video" && b.url) {
          const embed = embedUrl(b.url);
          return (
            <figure key={b.id}>
              <div className="aspect-video overflow-hidden rounded-2xl border border-border bg-surface-2">
                {embed ? (
                  <iframe
                    src={embed}
                    title={b.caption ?? "Video"}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={b.url} controls className="h-full w-full" />
                )}
              </div>
              {b.caption && (
                <figcaption className="mt-2 text-center text-sm text-muted">
                  {b.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        if (b.type === "text" && b.content) {
          return (
            <div key={b.id} className="max-w-2xl">
              {b.caption && (
                <h3 className="mb-3 font-display text-xl font-bold">{b.caption}</h3>
              )}
              {b.content.split(/\n+/).map((para, i) => (
                <p key={i} className="mb-3 leading-relaxed text-text/90">
                  {para}
                </p>
              ))}
            </div>
          );
        }

        if (b.type === "code" && b.content) {
          return (
            <div key={b.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="font-mono text-xs font-semibold text-cyan">
                  {b.caption || "snippet"}
                </span>
                <span className="text-xs text-muted">code</span>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-text/90">
                <code>{b.content}</code>
              </pre>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
