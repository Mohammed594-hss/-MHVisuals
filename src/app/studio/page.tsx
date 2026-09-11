import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { StudioForm } from "@/components/studio-form";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="py-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Creator Studio
        </h1>
        <p className="mt-1 text-muted">
          Build a rich case study with modular blocks, then publish it to the world.
        </p>
      </header>
      <StudioForm />
    </div>
  );
}
