"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Heart, MessageCircle } from "lucide-react";
import { toggleAppreciate } from "@/lib/actions";
import { formatCount, disciplineLabel, cn } from "@/lib/utils";
import type { ProjectCardData } from "@/lib/data";
import { Avatar } from "@/components/avatar";

const ASPECTS = [
  "aspect-[4/5]",
  "aspect-[1/1]",
  "aspect-[4/3]",
  "aspect-[3/4]",
  "aspect-[16/10]",
  "aspect-square",
];

function aspectFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ASPECTS[h % ASPECTS.length];
}

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const [liked, setLiked] = useState(project.likedByMe);
  const [likeCount, setLikeCount] = useState(project.likeCount);
  const [pending, startTransition] = useTransition();

  function onAppreciate(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => (next ? c + 1 : c - 1));
    startTransition(() => {
      toggleAppreciate(project.id);
    });
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative mb-6 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-cyan/40"
    >
      <Link href={`/project/${project.slug}`} className="block">
        <div className={cn("relative overflow-hidden", aspectFor(project.id))}>
          <img
            src={project.coverUrl}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Hover overlay: creator + quick appreciate */}
          <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/20 via-transparent to-black/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex items-center justify-between p-3">
              <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                {disciplineLabel(project.discipline)}
              </span>
              <button
                type="button"
                onClick={onAppreciate}
                disabled={pending}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold backdrop-blur transition-all",
                  liked
                    ? "bg-cyan text-black"
                    : "bg-black/60 text-white hover:bg-cyan hover:text-black",
                )}
              >
                <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                <span>{formatCount(likeCount)}</span>
              </button>
            </div>
            <div className="flex items-center gap-2 p-3">
              <Avatar src={project.author.avatarUrl} name={project.author.displayName} size="sm" />
              <span className="truncate text-sm font-medium text-white">
                {project.author.displayName}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="line-clamp-1 font-display text-[15px] font-semibold leading-snug">
            {project.title}
          </h3>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <Heart className={cn("h-3.5 w-3.5", liked && "fill-cyan text-cyan")} />
              {formatCount(likeCount)}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5" />
              {formatCount(project.commentCount)}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              {formatCount(project.viewCount)}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
