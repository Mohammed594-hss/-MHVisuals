"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SendHorizonal } from "lucide-react";
import { addComment } from "@/lib/actions";
import { timeAgo } from "@/lib/utils";
import { Avatar } from "@/components/avatar";

export type CommentItem = {
  id: string;
  body: string;
  createdAt: Date | string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
};

export function CommentSection({
  projectId,
  comments,
  isAuthed,
}: {
  projectId: string;
  comments: CommentItem[];
  isAuthed: boolean;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const value = text;
    setText("");
    startTransition(async () => {
      await addComment(projectId, value);
      router.refresh();
    });
  }

  return (
    <section id="comments" className="scroll-mt-24">
      <h2 className="font-display text-lg font-bold">
        Comments <span className="text-muted">({comments.length})</span>
      </h2>

      {isAuthed ? (
        <form onSubmit={submit} className="mt-4 flex items-start gap-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none placeholder:text-muted focus:border-cyan"
          />
          <button
            type="submit"
            disabled={pending || !text.trim()}
            className="flex h-11 items-center gap-1.5 rounded-xl bg-electric px-4 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          >
            <SendHorizonal className="h-4 w-4" />
            Post
          </button>
        </form>
      ) : (
        <p className="mt-4 rounded-xl border border-border bg-surface p-4 text-sm text-muted">
          <Link href="/login" className="font-medium text-cyan hover:underline">
            Sign in
          </Link>{" "}
          to join the conversation.
        </p>
      )}

      <div className="mt-6 space-y-4">
        {comments.length === 0 && (
          <p className="text-sm text-muted">No comments yet — be the first to share your thoughts.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <Link href={`/user/${c.author.username}`}>
              <Avatar src={c.author.avatarUrl} name={c.author.displayName} size="sm" />
            </Link>
            <div className="flex-1 rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center gap-2">
                <Link
                  href={`/user/${c.author.username}`}
                  className="text-sm font-semibold hover:text-cyan"
                >
                  {c.author.displayName}
                </Link>
                <span className="text-xs text-muted">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-text/90">{c.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
