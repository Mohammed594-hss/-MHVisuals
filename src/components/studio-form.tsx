"use client";

import { useRef, useState, useTransition } from "react";
import {
  Code2,
  FileText,
  ImagePlus,
  Link2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { createProject, type BlockInput } from "@/lib/actions";
import { DISCIPLINES, cn } from "@/lib/utils";

type Block = BlockInput & { id: string };

const PRESET_COVERS = [
  "https://images.pexels.com/photos/29506609/pexels-photo-29506609.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/28494632/pexels-photo-28494632.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/29237420/pexels-photo-29237420.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/29450016/pexels-photo-29450016.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/29355994/pexels-photo-29355994.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/8015895/pexels-photo-8015895.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/9594428/pexels-photo-9594428.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/8148722/pexels-photo-8148722.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/8015473/pexels-photo-8015473.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/6167400/pexels-photo-6167400.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/6406691/pexels-photo-6406691.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/15423104/pexels-photo-15423104.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
];

const POSITIONS = ["0% 0%", "50% 0%", "100% 0%", "0% 50%", "50% 50%", "100% 50%", "0% 100%", "50% 100%", "100% 100%"];

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ChipInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  function add() {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  }
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 focus-within:border-cyan">
      {values.map((v) => (
        <span
          key={v}
          className="flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium"
        >
          {v}
          <button
            type="button"
            onClick={() => onChange(values.filter((x) => x !== v))}
            className="text-muted hover:text-red-400"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder={values.length ? "" : placeholder}
        className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
      />
    </div>
  );
}

export function StudioForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discipline, setDiscipline] = useState<string>("branding");
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0]);
  const [coverPos, setCoverPos] = useState("50% 50%");
  const [tools, setTools] = useState<string[]>([]);
  const [palette, setPalette] = useState<string[]>(["#00F0FF", "#0052FF"]);
  const [tags, setTags] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file?: File | null) {
    if (!file) return;
    if (file.size > 3_000_000) {
      setError("Image too large — max 3MB for uploads. Try a preset or URL instead.");
      return;
    }
    const dataUrl = await readFileAsDataURL(file);
    setCoverUrl(dataUrl);
  }

  async function onDropImages(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    for (const f of list) {
      if (f.size > 3_000_000) {
        setError("One or more images were too large (max 3MB) and were skipped.");
        continue;
      }
      const url = await readFileAsDataURL(f);
      setBlocks((prev) => [...prev, { id: crypto.randomUUID(), type: "image", url }]);
    }
  }

  function addBlock(type: Block["type"]) {
    const b: Block = { id: crypto.randomUUID(), type };
    if (type === "text") b.content = "";
    if (type === "code") b.content = "";
    setBlocks((list) => [...list, b]);
  }

  function updateBlock(id: string, patch: Partial<Block>) {
    setBlocks((list) => list.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function moveBlock(id: string, dir: -1 | 1) {
    setBlocks((list) => {
      const i = list.findIndex((b) => b.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function removeBlock(id: string) {
    setBlocks((list) => list.filter((b) => b.id !== id));
  }

  function submit(status: "published" | "draft") {
    setError(null);
    startTransition(async () => {
      const res = await createProject({
        title,
        description,
        discipline,
        coverUrl,
        tools,
        palette,
        tags,
        status,
        blocks: blocks.map(({ id: _id, ...rest }) => rest),
      });
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      {/* Left: builder */}
      <div className="space-y-6">
        {/* Cover */}
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-muted">
            <ImagePlus className="h-4 w-4" /> Cover image
          </h2>
          <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
            <div
              className="relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-border transition-colors hover:border-cyan"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onFile(e.dataTransfer.files?.[0]);
              }}
              onClick={() => fileRef.current?.click()}
            >
              <img
                src={coverUrl}
                alt="Cover preview"
                style={{ objectPosition: coverPos }}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-center text-[11px] text-white">
                Drop or click to upload cover
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:border-cyan hover:text-cyan"
                >
                  <Upload className="h-4 w-4" /> Upload
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
                <div className="flex flex-1 items-center gap-2 rounded-lg border border-border px-3 py-2">
                  <Link2 className="h-4 w-4 text-muted" />
                  <input
                    value={coverUrl.startsWith("data:") ? "" : coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="Paste image URL…"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
                  />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted">Focus point</p>
              <div className="mt-1 grid w-24 grid-cols-3 gap-1">
                {POSITIONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCoverPos(p)}
                    className={cn(
                      "h-6 w-6 rounded",
                      coverPos === p ? "bg-cyan" : "bg-surface-2 hover:bg-surface-3",
                    )}
                  />
                ))}
              </div>
              <p className="mt-3 text-xs font-medium text-muted">Or pick a preset</p>
              <div className="mt-1.5 grid grid-cols-6 gap-1.5">
                {PRESET_COVERS.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setCoverUrl(url)}
                    className={cn(
                      "aspect-[4/3] overflow-hidden rounded-md border-2",
                      coverUrl === url ? "border-cyan" : "border-transparent hover:border-surface-3",
                    )}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Details */}
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-muted">
            Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your project a name"
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-cyan"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Tell the story behind this project…"
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-cyan"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Discipline</label>
              <div className="flex flex-wrap gap-2">
                {DISCIPLINES.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDiscipline(d.value)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                      discipline === d.value
                        ? "bg-cyan text-black"
                        : "border border-border text-muted hover:border-cyan hover:text-cyan",
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Blocks */}
        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted">
              Content blocks
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { t: "image", label: "Image", Icon: ImagePlus },
                  { t: "video", label: "Video", Icon: Sparkles },
                  { t: "text", label: "Text", Icon: FileText },
                  { t: "code", label: "Code", Icon: Code2 },
                ] as const
              ).map(({ t, label, Icon }) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => addBlock(t)}
                  className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:border-cyan hover:text-cyan"
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="mb-4 rounded-xl border-2 border-dashed border-border px-4 py-6 text-center text-sm text-muted transition-colors hover:border-cyan"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onDropImages(e.dataTransfer.files ?? []);
            }}
          >
            <Upload className="mx-auto mb-1.5 h-5 w-5" />
            Drag &amp; drop images here to add them as blocks
          </div>

          {blocks.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
              Or add blocks manually to build a rich, scrollable case study.
            </p>
          )}

          <div className="space-y-4">
            {blocks.map((b, i) => (
              <div key={b.id} className="rounded-xl border border-border bg-bg p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {b.type}
                  </span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveBlock(b.id, -1)} className="rounded p-1 hover:text-cyan">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => moveBlock(b.id, 1)} className="rounded p-1 hover:text-cyan">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => removeBlock(b.id)} className="rounded p-1 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {(b.type === "image" || b.type === "video") && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                      <Link2 className="h-4 w-4 text-muted" />
                      <input
                        value={b.url ?? ""}
                        onChange={(e) => updateBlock(b.id, { url: e.target.value })}
                        placeholder={b.type === "video" ? "Paste a video / YouTube / Vimeo URL…" : "Paste an image URL…"}
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
                      />
                    </div>
                    {b.type === "image" && b.url && (
                      <img src={b.url} alt="" className="max-h-48 rounded-lg object-contain" />
                    )}
                    <input
                      value={b.caption ?? ""}
                      onChange={(e) => updateBlock(b.id, { caption: e.target.value })}
                      placeholder="Caption (optional)"
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-cyan"
                    />
                  </div>
                )}

                {(b.type === "text" || b.type === "code") && (
                  <div className="space-y-2">
                    <textarea
                      value={b.content ?? ""}
                      onChange={(e) => updateBlock(b.id, { content: e.target.value })}
                      rows={b.type === "code" ? 7 : 4}
                      placeholder={
                        b.type === "code"
                          ? "// Paste your code or script here…"
                          : "Write a story block…"
                      }
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm outline-none focus:border-cyan"
                    />
                    <input
                      value={b.caption ?? ""}
                      onChange={(e) => updateBlock(b.id, { caption: e.target.value })}
                      placeholder={b.type === "code" ? "Language (e.g. ExtendScript, JSX, Python)" : "Heading (optional)"}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-cyan"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Right: metadata + publish */}
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-muted">
            Metadata
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tools / Software</label>
              <ChipInput values={tools} onChange={setTools} placeholder="e.g. Illustrator, Blender" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tags</label>
              <ChipInput values={tags} onChange={setTags} placeholder="e.g. minimal, identity" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Color palette</label>
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-3">
                {palette.map((c, i) => (
                  <div key={i} className="group relative">
                    <span
                      className="block h-8 w-8 rounded-lg border border-border"
                      style={{ backgroundColor: c }}
                    />
                    <button
                      type="button"
                      onClick={() => setPalette(palette.filter((_, j) => j !== i))}
                      className="absolute -right-1.5 -top-1.5 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white group-hover:flex"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
                <label className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-border px-2 text-xs text-muted hover:text-cyan">
                  <Plus className="h-3.5 w-3.5" /> Add
                  <input
                    type="color"
                    className="absolute h-0 w-0 opacity-0"
                    onChange={(e) => e.target.value && setPalette([...palette, e.target.value])}
                  />
                </label>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => submit("published")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-electric py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            Publish
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => submit("draft")}
            className="rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted hover:border-cyan hover:text-cyan disabled:opacity-50"
          >
            Save draft
          </button>
        </div>
      </div>
    </div>
  );
}
