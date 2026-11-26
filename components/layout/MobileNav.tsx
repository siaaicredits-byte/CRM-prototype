"use client";

import { Menu, X } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Brand } from "./Brand";
import { SidebarNav, SidebarNavFallback } from "./SidebarNav";
import { UserCard } from "./UserCard";

interface MobileNavProps {
  user: {
    name: string | null;
    email: string;
    role: string;
  };
}

/** Hamburger button + slide-out drawer, shown below the `lg` breakpoint. */
export function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="inline-flex size-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-navy-950/70 backdrop-blur-sm transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          inert={!open}
          className={cn(
            "absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-line bg-navy-900 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] shadow-2xl transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between pb-6">
            <Brand />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
              className="inline-flex size-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-raised hover:text-ink"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Suspense fallback={<SidebarNavFallback />}>
              <SidebarNav
  role={user.role}
  onNavigate={() => setOpen(false)}
/>
            </Suspense>
          </div>
          <div className="pt-4">
          <UserCard user={user} />
          </div>
        </aside>
      </div>
    </>
  );
}
