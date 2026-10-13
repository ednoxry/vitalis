"use client";

import { useEffect } from "react";

export default function SiteInteractions() {
  useEffect(() => {
    let cancelled = false;
    import("@/lib/interactions")
      .then((mod) => {
        if (!cancelled) mod.initInteractions();
      })
      .catch((err) => {
        console.error("[vitalis] falha ao iniciar interações", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
