import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center py-16">
      <div className="mb-8 text-center">
        <span className="glow-box inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan font-display text-2xl font-black text-black">
          MH
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight">
          Welcome to MH Visuals
        </h1>
        <p className="mt-1 text-sm text-muted">
          Sign in to publish, appreciate and connect.
        </p>
      </div>
      <AuthForm />
    </div>
  );
}
