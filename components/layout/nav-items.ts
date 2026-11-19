import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Building2,
  CalendarDays,
  ChartColumn,
  Handshake,
  LayoutDashboard,
  Settings,
  UserPlus,
  Users,
  Workflow,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Sales",
    items: [
      { label: "Leads", href: "/leads", icon: UserPlus },
      { label: "Contacts", href: "/contacts", icon: Users },
      { label: "Companies", href: "/companies", icon: Building2 },
      { label: "Deals", href: "/deals", icon: Handshake },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Automations", href: "/automations", icon: Workflow },
      { label: "AI Agents", href: "/agents", icon: Bot },
      { label: "Calendar", href: "/calendar", icon: CalendarDays },
      { label: "Analytics", href: "/analytics", icon: ChartColumn },
    ],
  },
  {
    label: "System",
    items: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
];

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
