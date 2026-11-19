import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

interface AvatarProps {
  name: string;
  size?: "sm" | "md";
  className?: string;
}

export function Avatar({ name, size = "sm", className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/80 to-accent/30 font-semibold text-white ring-1 ring-white/10",
        size === "sm" ? "size-8 text-[11px]" : "size-10 text-sm",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
