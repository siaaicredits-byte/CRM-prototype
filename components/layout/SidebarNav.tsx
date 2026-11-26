
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { getNavGroups, isActivePath } from "./nav-items";

interface SidebarNavProps {
  role: string;
  onNavigate?: () => void;
}

export function SidebarNav({ role, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const navGroups = getNavGroups(role);

  return (
    <nav aria-label="Main" className="flex flex-col gap-6">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            {group.label}
          </p>

          <ul className="flex flex-col gap-0.5">
            {group.items.map(({ label, href, icon: Icon }) => {
              const active = isActivePath(pathname, href);

              return (
                <li key={`${group.label}-${href}`}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                      active
                        ? "bg-accent-soft text-ink"
                        : "text-ink-muted hover:bg-surface-raised hover:text-ink",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-accent transition-opacity",
                        active ? "opacity-100" : "opacity-0",
                      )}
                    />

                    <Icon
                      className={cn(
                        "size-[18px] shrink-0 transition-colors",
                        active
                          ? "text-accent"
                          : "text-ink-faint group-hover:text-ink-muted",
                      )}
                      aria-hidden="true"
                    />

                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function SidebarNavFallback() {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="h-9 rounded-lg bg-surface-raised/50" />
      ))}
    </div>
  );
}
