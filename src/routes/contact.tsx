import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail } from "lucide-react";

const FAQ = [
  { q: "How do I register for an event?", a: "Sign up, verify your account, then open any event page and click Register." },
  { q: "How do I post an event?", a: "Only the UoN Link admin can post events. Contact appixlimited@gmail.com to submit one." },
  { q: "How do I report a problem?", a: "Email us at appixlimited@gmail.com." },
];

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — UoN Link" }, { name: "description", content: "Get in touch with the UoN Link team." }] }),
  component: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold">Contact</h1>
        <p className="mt-2 text-muted-foreground">We respond within 24 hours Monday to Friday.</p>
        <div className="mt-6 rounded-lg border border-border bg-card p-6">
          <p className="text-sm">Email us at</p>
          <p className="text-xl font-semibold text-primary">appixlimited@gmail.com</p>
          <a href="mailto:appixlimited@gmail.com" className="mt-4 inline-block"><Button><Mail className="h-4 w-4 mr-1.5" /> Send Email</Button></a>
        </div>
        <h2 className="mt-10 text-2xl font-bold">Frequently asked</h2>
        <Accordion type="single" collapsible className="mt-3">
          {FAQ.map((f, i) => (
            <AccordionItem key={i} value={`i${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </PageShell>
  ),
});
