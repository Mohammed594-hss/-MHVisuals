"use client";

import { useState, useTransition } from "react";
import { loginUser, registerUser } from "@/lib/actions";
import { cn } from "@/lib/utils";

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res =
        mode === "login" ? await loginUser(fd) : await registerUser(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="mb-6 flex rounded-xl bg-surface-2 p-1">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-semibold transition-colors",
                mode === m ? "bg-cyan text-black" : "text-muted hover:text-text",
              )}
            >
              {m === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <Field label="Display name" name="displayName" placeholder="Mona Haddad" />
              <Field label="Username" name="username" placeholder="mona" />
            </>
          )}
          <Field label="Email" name="email" type="email" placeholder="you@example.com" />
          <Field label="Password" name="password" type="password" placeholder="••••••••" />

          {error && (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-electric py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {pending
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>
      </div>
      <p className="mt-4 text-center text-xs text-muted">
        Demo build — any credentials work for registration.
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm outline-none focus:border-cyan"
      />
    </div>
  );
}
