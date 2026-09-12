import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/playbook")({ component: PlaybookLayout });

function PlaybookLayout() {
  return <Outlet />;
}
