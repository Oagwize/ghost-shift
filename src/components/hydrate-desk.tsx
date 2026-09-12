import { useEffect } from "react";
import { useDesk } from "@/lib/engine/store";
import { usePlaybooks } from "@/lib/engine/playbook-store";
import { useAudits } from "@/lib/engine/audit-store";

export function HydrateDesk() {
  useEffect(() => {
    let alive = true;
    const finishDesk = () => {
      if (alive) useDesk.setState({ hydrated: true });
    };
    const finishPlaybooks = () => {
      if (!alive) return;
      usePlaybooks.getState().ensureSeed();
      usePlaybooks.setState({ hydrated: true });
    };
    const finishAudits = () => {
      if (alive) useAudits.setState({ hydrated: true });
    };
    void Promise.resolve(useDesk.persist.rehydrate()).then(finishDesk, finishDesk);
    void Promise.resolve(usePlaybooks.persist.rehydrate()).then(finishPlaybooks, finishPlaybooks);
    void Promise.resolve(useAudits.persist.rehydrate()).then(finishAudits, finishAudits);
    return () => {
      alive = false;
    };
  }, []);
  return null;
}
