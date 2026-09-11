"use client";

import { useState, useTransition } from "react";
import { toggleFollow } from "@/lib/actions";
import { cn } from "@/lib/utils";

export function FollowButton({
  targetUserId,
  initial,
}: {
  targetUserId: string;
  initial: boolean;
}) {
  const [following, setFollowing] = useState(initial);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setFollowing((f) => !f);
        startTransition(() => {
          toggleFollow(targetUserId);
        });
      }}
      className={cn(
        "rounded-xl px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.03] disabled:opacity-60",
        following
          ? "border border-border text-muted hover:text-text"
          : "bg-electric text-white",
      )}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
