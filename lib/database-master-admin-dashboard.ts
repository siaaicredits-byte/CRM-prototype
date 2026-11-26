
import "server-only";

import { getCurrentUser } from "@/lib/auth/authenticate";
import { db } from "@/src/prisma/db";

const openDealStages = [
  "discovery",
  "qualified",
  "proposal",
  "negotiation",
];

export async function getMasterAdminDashboardData() {
  const currentUser = await getCurrentUser();

  // Never return organisation-wide data to another role.
  if (!currentUser || currentUser.role !== "MASTER_ADMIN") {
    return null;
  }

  const [
    users,
    projects,
    memberships,
    leads,
    contacts,
    deals,
    tasks,
  ] = await Promise.all([
    db.orm.public.User.all(),
    db.orm.public.Project.all(),
    db.orm.public.ProjectMember.all(),
    db.orm.public.Lead.all(),
    db.orm.public.Contact.all(),
    db.orm.public.Deal.all(),
    db.orm.public.Task.all(),
  ]);

  const activeUsers = users.filter((user) => user.isActive);
  const activeProjects = projects.filter((project) => project.isActive);
  const activeDeals = deals.filter((deal) =>
    openDealStages.includes(deal.stage.toLowerCase())
  );

  const completedTasks = tasks.filter((task) => task.done);
  const pendingTasks = tasks.filter((task) => !task.done);

  const pipelineValue = activeDeals.reduce(
    (total, deal) => total + Number(deal.value ?? 0),
    0
  );

  const roleCounts = {
    MASTER_ADMIN: users.filter((user) => user.role === "MASTER_ADMIN").length,
    MANAGER: users.filter((user) => user.role === "MANAGER").length,
    SALES_REP: users.filter((user) => user.role === "SALES_REP").length,
  };

  const projectPerformance = projects.map((project) => {
    const projectMemberships = memberships.filter(
      (membership) => membership.projectId === project.id
    );

    const projectMembers = projectMemberships
      .map((membership) => {
        const member = users.find(
          (user) => user.id === membership.userId
        );

        if (!member) return null;

        return {
          id: Number(member.id),
          name: member.name || member.email,
          role: member.role,
          isActive: member.isActive,
        };
      })
      .filter((member) => member !== null);

    const projectLeads = leads.filter(
      (lead) => lead.projectId === project.id
    );

    return {
      id: Number(project.id),
      name: project.name,
      description: project.description,
      isActive: project.isActive,
      createdAt: project.createdAt.toISOString(),
      leadCount: projectLeads.length,
      memberCount: projectMembers.length,
      salesExecutiveCount: projectMembers.filter(
        (member) => member.role === "SALES_REP"
      ).length,
      members: projectMembers,
    };
  });

  const recentUsers = [...users]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5)
    .map((user) => ({
      id: Number(user.id),
      name: user.name || user.email,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    }));

  return {
    user: {
      name: currentUser.name || "Administrator",
    },
    stats: {
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      inactiveUsers: users.length - activeUsers.length,
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      inactiveProjects: projects.length - activeProjects.length,
      totalLeads: leads.length,
      totalContacts: contacts.length,
      totalDeals: deals.length,
      activeDeals: activeDeals.length,
      wonDeals: deals.filter(
        (deal) => deal.stage.toLowerCase() === "won"
      ).length,
      pipelineValue,
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
    },
    roleCounts,
    projects: projectPerformance,
    recentUsers,
    today: new Date().toISOString().slice(0, 10),
  };
}
