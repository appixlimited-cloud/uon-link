import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/page-shell";
import { SignupForm } from "@/components/signup-form";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign Up — UoN Link" }] }),
  component: SignupPage,
});

function SignupPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <SignupForm />
      </div>
    </PageShell>
  );
}
