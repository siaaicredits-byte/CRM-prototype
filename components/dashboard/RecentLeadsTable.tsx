
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Lead } from "@/types/crm";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { EditLeadButton } from "@/components/leads/EditLeadButton";
import { DeleteLeadButton } from "@/components/leads/DeleteLeadButton";

interface RecentLeadsTableProps {
  leads: Lead[];
  /** Show the extended columns (email, owner). */
  detailed?: boolean;
}

export function RecentLeadsTable({
  leads,
  detailed = false,
}: RecentLeadsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-[11px] uppercase tracking-wider text-ink-faint">
            <th scope="col" className="px-5 py-2.5 font-medium">Lead</th>
            {detailed ? (
              <th scope="col" className="px-3 py-2.5 font-medium">Email</th>
            ) : null}
            <th scope="col" className="px-3 py-2.5 font-medium">Source</th>
            <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
            {detailed ? (
              <th scope="col" className="px-3 py-2.5 font-medium">Owner</th>
            ) : null}
            <th scope="col" className="px-3 py-2.5 text-right font-medium">Value</th>
            <th scope="col" className="px-5 py-2.5 text-right font-medium">Added</th>
            {detailed ? (
              <th scope="col" className="px-5 py-2.5 text-right font-medium">Action</th>
            ) : null}
          </tr>
        </thead>

        <tbody className="divide-y divide-line/70">
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="transition-colors hover:bg-surface-raised/60"
            >
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={lead.name} />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{lead.name}</p>
                    <p className="truncate text-xs text-ink-muted">
                      {lead.company}
                    </p>
                  </div>
                </div>
              </td>

              {detailed ? (
                <td className="px-3 py-3 text-ink-muted">{lead.email}</td>
              ) : null}

              <td className="whitespace-nowrap px-3 py-3 text-ink-muted">
                {lead.source}
              </td>

              <td className="px-3 py-3">
                <LeadStatusBadge status={lead.status} />
              </td>

              {detailed ? (
                <td className="whitespace-nowrap px-3 py-3 text-ink-muted">
                  {lead.owner}
                </td>
              ) : null}

              <td className="px-3 py-3 text-right font-medium tabular-nums text-ink">
                {formatCurrency(lead.value)}
              </td>

              <td className="whitespace-nowrap px-5 py-3 text-right text-ink-muted">
                {formatDate(lead.createdAt)}
              </td>

              {detailed ? (
                <td className="px-5 py-3 text-right">
  <div className="flex items-center justify-end gap-2">
    <EditLeadButton lead={lead} />
    <DeleteLeadButton lead={lead} />
  </div>
</td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
