import { Zap } from "lucide-react";
import Link from "next/link";

export function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-1">
      <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-glow/70 shadow-[0_0_24px_-4px_rgb(47_128_255/0.8)]">
        <Zap className="size-4 text-white" aria-hidden="true" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-ink">
        Pulse<span className="text-accent">CRM</span>
      </span>
    </Link>
  );
}
