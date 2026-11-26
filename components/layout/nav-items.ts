
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Building2,
  CalendarDays,
  ChartColumn,
  CheckSquare,
  FolderKanban,
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

const dashboard: NavItem = {
  label: "Dashboard",
  href: "/dashboard",
  icon: LayoutDashboard,
};

const salesItems: NavItem[] = [
  { label: "Leads", href: "/leads", icon: UserPlus },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Deals", href: "/deals", icon: Handshake },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
];

const intelligenceItems: NavItem[] = [
  { label: "Automations", href: "/automations", icon: Workflow },
  { label: "AI Agents", href: "/agents", icon: Bot },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Analytics", href: "/analytics", icon: ChartColumn },
];

export function getNavGroups(role: string): NavGroup[] {
  const groups: NavGroup[] = [
    {
      label: "Overview",
      items: [dashboard],
    },
  ];

  // Master Admin navigation
  if (role === "MASTER_ADMIN") {
    groups.push(
      {
        label: "Organisation",
        items: [
          { label: "All Leads", href: "/leads", icon: UserPlus },
          { label: "All Contacts", href: "/contacts", icon: Users },
          { label: "All Deals", href: "/deals", icon: Handshake },
          { label: "Analytics", href: "/analytics", icon: ChartColumn },
        ],
      },
      {
        label: "Intelligence",
        items: intelligenceItems.filter(
          (item) => item.href !== "/analytics"
        ),
      },
      {
        label: "System",
        items: [
          {
            label: "User Management",
            href: "/admin/users",
            icon: Users,
          },
          {
            label: "Project Management",
            href: "/admin/projects",
            icon: FolderKanban,
          },
          {
            label: "Settings",
            href: "/settings",
            icon: Settings,
          },
        ],
      }
    );

    return groups;
  }

  // Sales and other non-admin users
  groups.push(
    {
      label: "Sales",
      items: salesItems,
    },
    {
      label: "Intelligence",
      items: intelligenceItems,
    },
    {
      label: "System",
      items: [
        {
          label: "Settings",
          href: "/settings",
          icon: Settings,
        },
      ],
    }
  );

  return groups;
}

export function isActivePath(
  pathname: string,
  href: string
): boolean {
  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}
