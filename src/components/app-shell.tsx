import { Link, useNavigate } from "@tanstack/react-router";
import { Wordmark } from "@/components/site-header";
import { Button } from "@/components/ui";
import { NoticeBar } from "@/components/notice-bar";
import { useDesk } from "@/lib/engine/store";
import { cn } from "@/lib/cn";

export function AppShell({
  kind,
  children,
}: {
  kind: "desk" | "shop";
  children: React.ReactNode;
}) {
  const session = useDesk((s) => s.session);
  const leave = useDesk((s) => s.leave);
  const resetDemo = useDesk((s) => s.resetDemo);
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-paper">
      <header className="border-b border-line bg-cream px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Wordmark className="text-lg" />
            <span className="hidden text-xs tracking-wide text-muted uppercase sm:inline">
              {kind === "desk" ? "Mission Control" : "Rep queue"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm sm:gap-2">
            <span className="hidden truncate text-muted sm:inline">{session?.actorName}</span>
            {session?.role === "operator" || kind === "desk" ? (
              <>
                <Link to="/catalog" className={cn("hidden rounded-md px-3 py-2 text-muted hover:text-ink sm:inline")}>
                  Catalog
                </Link>
                <Link to="/desk/ops" className={cn("rounded-md px-3 py-2 text-muted hover:text-ink")}>
                  Boards
                </Link>
                <Link
                  to={kind === "desk" ? "/shop" : "/desk"}
                  className={cn("rounded-md px-3 py-2 text-muted hover:text-ink")}
                >
                  {kind === "desk" ? "Rep queue" : "Mission Control"}
                </Link>
              </>
            ) : (
              <Link to="/catalog" className={cn("hidden rounded-md px-3 py-2 text-muted hover:text-ink sm:inline")}>
                Catalog
              </Link>
            )}
            <Button
              variant="ghost"
              className="min-h-11 px-3 text-sm"
              onClick={() => {
                resetDemo();
              }}
            >
              Reset sample
            </Button>
            <Button
              variant="outline"
              className="min-h-11 px-3 text-sm"
              onClick={() => {
                leave();
                void navigate({ to: "/enter" });
              }}
            >
              Leave
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <NoticeBar />
        {children}
      </div>
    </div>
  );
}
