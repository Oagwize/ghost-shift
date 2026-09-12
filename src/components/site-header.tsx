import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/cn";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("font-display text-xl font-medium tracking-tight", className)}>
      Ghost Shift<span className="text-forest">.</span>
    </Link>
  );
}

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  return (
    <header className={cn("px-5 py-5 sm:px-8", solid && "border-b border-line bg-cream")}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Wordmark />
        <nav className="flex items-center gap-1 text-sm sm:gap-3">
          <Link to="/catalog" className="hidden rounded-md px-3 py-2 text-muted hover:text-ink sm:inline">
            Catalog
          </Link>
          <Link to="/how-it-works" className="hidden rounded-md px-3 py-2 text-muted hover:text-ink sm:inline">
            How it works
          </Link>
          <Link to="/about" className="hidden rounded-md px-3 py-2 text-muted hover:text-ink sm:inline">
            About
          </Link>
          <Link to="/enter" className="hidden rounded-md px-3 py-2 text-muted hover:text-ink sm:inline">
            Desk
          </Link>
          <Link to="/audit" className="rounded-md px-3 py-2 text-muted hover:text-ink">
            Report
          </Link>
          <Link
            to="/playbook"
            className="inline-flex min-h-11 items-center rounded-md bg-forest px-4 font-medium text-cream"
          >
            Playbook
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line px-5 py-8 text-sm text-muted sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>Ghost Shift. The shift you never had to hire. Nothing sends itself.</p>
        <div className="flex flex-wrap gap-4">
          <Link to="/catalog" className="hover:text-ink">
            Catalog
          </Link>
          <Link to="/playbook" className="hover:text-ink">
            Playbook
          </Link>
          <Link to="/how-it-works" className="hover:text-ink">
            How it works
          </Link>
          <Link to="/about" className="hover:text-ink">
            About
          </Link>
          <Link to="/audit" className="hover:text-ink">
            Report
          </Link>
          <Link to="/enter" className="hover:text-ink">
            Desk
          </Link>
        </div>
      </div>
    </footer>
  );
}
