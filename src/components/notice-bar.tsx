import { useEffect } from "react";
import { useDesk } from "@/lib/engine/store";
import { cn } from "@/lib/cn";

export function NoticeBar() {
  const notice = useDesk((s) => s.notice);
  const clear = useDesk((s) => s.clearNotice);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(clear, 4200);
    return () => window.clearTimeout(t);
  }, [notice, clear]);

  return (
    <div aria-live="polite" aria-atomic="true" className="min-h-0">
      {notice ? (
        <p
          className={cn(
            "mb-4 rounded-md px-3 py-2 text-sm",
            notice.kind === "ok" && "bg-forest/10 text-forest",
            notice.kind === "warn" && "bg-warn/10 text-warn",
            notice.kind === "danger" && "bg-danger/10 text-danger",
          )}
        >
          {notice.text}
        </p>
      ) : null}
    </div>
  );
}
