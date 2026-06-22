import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "All Events — UoN Link" }, { name: "description", content: "Browse all events happening at the University of Nairobi." }] }),
  component: () => <Outlet />,
});
