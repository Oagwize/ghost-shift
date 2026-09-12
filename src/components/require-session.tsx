import { Navigate } from "@tanstack/react-router";
import { useDesk } from "@/lib/engine/store";
import type { Role } from "@/lib/engine/types";

export function RequireSession({
  role,
  children,
}: {
  role?: Role;
  children: React.ReactNode;
}) {
  const hydrated = useDesk((s) => s.hydrated);
  const session = useDesk((s) => s.session);

  if (!hydrated) {
    return <div className="min-h-dvh bg-paper" aria-hidden />;
  }
  if (!session) {
    return <Navigate to="/enter" />;
  }
  if (role === "operator" && session.role !== "operator") {
    return <Navigate to="/shop" />;
  }
  return children;
}
