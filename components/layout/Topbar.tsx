
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Avatar } from "@/components/ui/Avatar";
import { MobileNav } from "./MobileNav";
import { GlobalSearch } from "./GlobalSearch";

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

        <GlobalSearch />

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <NotificationBell />

          <span
            className="hidden h-6 w-px bg-line sm:block"
            aria-hidden="true"
          />

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
