import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/page-shell";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — UoN Link" }] }),
  component: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-12 prose prose-sm">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-4 text-muted-foreground">We collect the information you provide when signing up (name, email, registration number, faculty, year, interests) to personalise your experience on UoN Link.</p>
        <p className="mt-3 text-muted-foreground">Your registration information for events is shared only with the event admin. We never sell your data.</p>
        <p className="mt-3 text-muted-foreground">For questions or to request deletion of your data, contact <a className="text-primary" href="mailto:appixlimited@gmail.com">appixlimited@gmail.com</a>.</p>
      </div>
    </PageShell>
  ),
});
