
import { Bell, Search } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { MobileNav } from "./MobileNav";

interface TopbarProps {
  user: {
    name: string | null;
    email: string;
    role: string;
  };
}

export function Topbar({ user }: TopbarProps) {
  const displayName = user.name || user.email;

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-navy-950/75 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <MobileNav user={user} />

        <label className="relative flex min-w-0 max-w-md flex-1 items-center">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute left-3 size-4 text-ink-faint" aria-hidden="true" />
          <input
            type="search"
            disabled
            placeholder="Search leads, deals, companies…"
            title="Search becomes available once the database is connected"
            className="h-9 w-full rounded-lg border border-line bg-surface/70 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint disabled:cursor-not-allowed"
          />
        </label>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            disabled
            aria-label="Notifications"
            title="Notifications become available in a later phase"
            className="inline-flex size-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <Bell className="size-[18px]" aria-hidden="true" />
          </button>

          <span className="hidden h-6 w-px bg-line sm:block" aria-hidden="true" />

          <div className="flex items-center gap-2.5 pl-1">
            <Avatar name={displayName} />
            <span className="hidden text-sm font-medium text-ink md:block">
              {displayName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
