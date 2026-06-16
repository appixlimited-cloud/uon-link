import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/page-shell";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — UoN Link" }] }),
  component: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="mt-4 text-muted-foreground">By using UoN Link you agree to use the platform responsibly and abide by University of Nairobi policies.</p>
        <p className="mt-3 text-muted-foreground">All event content is posted by the platform admin. We are not liable for the actions of third-party organisers.</p>
        <p className="mt-3 text-muted-foreground">For questions, contact <a className="text-primary" href="mailto:appixlimited@gmail.com">appixlimited@gmail.com</a>.</p>
      </div>
    </PageShell>
  ),
});
