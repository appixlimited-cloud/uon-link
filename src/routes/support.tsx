import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail } from "lucide-react";

const FAQ = [
  { q: "I can't log in", a: "Use the password reset link on the login page, or email appixlimited@gmail.com." },
  { q: "I registered but can't find the event", a: "Check your dashboard for a list of all events you've registered for." },
  { q: "How do I unsubscribe?", a: "Email appixlimited@gmail.com and we'll remove you within 24 hours." },
];

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Support — UoN Link" }] }),
  component: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold">Support</h1>
        <div className="mt-6 rounded-lg border border-border bg-card p-6">
          <p className="text-sm">Email support</p>
          <p className="text-xl font-semibold text-primary">appixlimited@gmail.com</p>
          <a href="mailto:appixlimited@gmail.com" className="mt-4 inline-block"><Button><Mail className="h-4 w-4 mr-1.5" /> Email Support</Button></a>
        </div>
        <h2 className="mt-10 text-2xl font-bold">FAQ</h2>
        <Accordion type="single" collapsible className="mt-3">
          {FAQ.map((f, i) => (
            <AccordionItem key={i} value={`s${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </PageShell>
  ),
});
