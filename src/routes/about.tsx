import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/page-shell";
import { BookOpen, Users, Briefcase, GraduationCap } from "lucide-react";

const PILLARS = [
  { icon: BookOpen, title: "Academic Excellence", desc: "Stay on top of academic events, seminars, and research opportunities." },
  { icon: Users, title: "Community Building", desc: "Connect with clubs, societies, and a vibrant campus community." },
  { icon: Briefcase, title: "Career Growth", desc: "Internships, career fairs, and professional development." },
  { icon: GraduationCap, title: "Lifelong Learning", desc: "Workshops, scholarships, and opportunities beyond the classroom." },
];

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — UoN Link" }, { name: "description", content: "UoN Link is the central platform for campus life at the University of Nairobi." }] }),
  component: () => (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold">About UoN Link</h1>
        <p className="mt-4 text-base text-muted-foreground">UoN Link is the central platform for campus life at the University of Nairobi. We bring together events, opportunities, notices, and clubs so every student can make the most of their time on campus.</p>
        <h2 className="mt-10 text-2xl font-bold">Our Pillars</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {PILLARS.map((p) => (
            <div key={p.title} className="rounded-lg border border-border bg-card p-5">
              <p.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  ),
});
