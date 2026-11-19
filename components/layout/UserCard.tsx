import { Avatar } from "@/components/ui/Avatar";
import { DEMO_USER } from "@/lib/demo-data";

export function UserCard() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface/60 p-3">
      <Avatar name={DEMO_USER.name} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{DEMO_USER.name}</p>
        <p className="truncate text-xs text-ink-muted">{DEMO_USER.role}</p>
      </div>
    </div>
  );
}
