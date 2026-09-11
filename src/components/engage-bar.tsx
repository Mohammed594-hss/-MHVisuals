"use client";

import { useState, useTransition } from "react";
import { Bookmark, Heart, MessageCircle, Share2, Check } from "lucide-react";
import { toggleAppreciate, toggleBookmark } from "@/lib/actions";
import { formatCount, cn } from "@/lib/utils";

export function EngageBar({
  projectId,
  initialLiked,
  initialBookmarked,
  likeCount,
  commentCount,
}: {
  projectId: string;
  initialLiked: boolean;
  initialBookmarked: boolean;
  likeCount: number;
  commentCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(likeCount);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function onLike() {
    const next = !liked;
    setLiked(next);
    setLikes((c) => (next ? c + 1 : c - 1));
    startTransition(() => {
      toggleAppreciate(projectId);
    });
  }

  function onBookmark() {
    setBookmarked((b) => !b);
    startTransition(() => {
      toggleBookmark(projectId);
    });
  }

  function onShare() {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  function scrollToComments() {
    document.getElementById("comments")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const base =
    "flex flex-1 flex-col items-center gap-1 rounded-xl py-3 text-xs font-medium transition-colors";

  return (
    <div className="flex items-stretch gap-1.5">
      <button
        type="button"
        onClick={onLike}
        disabled={pending}
        className={cn(
          base,
          liked ? "bg-cyan text-black" : "bg-surface-2 text-muted hover:text-cyan",
        )}
      >
        <Heart className={cn("h-5 w-5", liked && "fill-current")} />
        <span>{formatCount(likes)}</span>
      </button>

      <button
        type="button"
        onClick={onBookmark}
        disabled={pending}
        className={cn(
          base,
          bookmarked ? "bg-electric text-white" : "bg-surface-2 text-muted hover:text-cyan",
        )}
      >
        <Bookmark className={cn("h-5 w-5", bookmarked && "fill-current")} />
        <span>Save</span>
      </button>

      <button
        type="button"
        onClick={scrollToComments}
        className={cn(base, "bg-surface-2 text-muted hover:text-cyan")}
      >
        <MessageCircle className="h-5 w-5" />
        <span>{formatCount(commentCount)}</span>
      </button>

      <button
        type="button"
        onClick={onShare}
        className={cn(base, "bg-surface-2 text-muted hover:text-cyan")}
      >
        {copied ? <Check className="h-5 w-5 text-cyan" /> : <Share2 className="h-5 w-5" />}
        <span>{copied ? "Copied" : "Share"}</span>
      </button>
    </div>
  );
}
