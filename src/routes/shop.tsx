import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RequireSession } from "@/components/require-session";

export const Route = createFileRoute("/shop")({ component: ShopLayout });

function ShopLayout() {
  return (
    <RequireSession>
      <AppShell kind="shop">
        <Outlet />
      </AppShell>
    </RequireSession>
  );
}
