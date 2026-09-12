import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RequireSession } from "@/components/require-session";

export const Route = createFileRoute("/desk")({ component: DeskLayout });

function DeskLayout() {
  return (
    <RequireSession role="operator">
      <AppShell kind="desk">
        <Outlet />
      </AppShell>
    </RequireSession>
  );
}
