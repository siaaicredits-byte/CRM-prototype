import { Suspense } from "react";
import { Brand } from "./Brand";
import { SidebarNav, SidebarNavFallback } from "./SidebarNav";
import { UserCard } from "./UserCard";

/** Fixed desktop sidebar (lg and up). Mobile uses <MobileNav />. */
export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-navy-900/90 px-4 py-5 backdrop-blur lg:flex">
      <div className="pb-7">
        <Brand />
      </div>
      <div className="-mx-1 flex-1 overflow-y-auto px-1">
        <Suspense fallback={<SidebarNavFallback />}>
          <SidebarNav />
        </Suspense>
      </div>
      <div className="pt-4">
        <UserCard />
      </div>
    </aside>
  );
}
