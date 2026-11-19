
"use client";

import { useMemo, useState } from "react";
import type { Deal, DealStageId } from "@/types/crm";
import { EditDealButton } from "./EditDealButton";
import { DeleteDealButton } from "./DeleteDealButton";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface DealSearchProps {
  deals: Deal[];
}

const stageNames: Record<DealStageId, string> = {
  discovery: "Discovery",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Closed Won",
};

const stageStyles: Record<DealStageId, string> = {
  discovery: "bg-blue-500/10 text-blue-400",
  qualified: "bg-cyan-500/10 text-cyan-400",
  proposal: "bg-violet-500/10 text-violet-400",
  negotiation: "bg-amber-500/10 text-amber-400",
  won: "bg-emerald-500/10 text-emerald-400",
};

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export function DealSearch({ deals }: DealSearchProps) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const filteredDeals = useMemo(() => {
    const query = search.toLowerCase().trim();

    const result = deals.filter((deal) => {
      const matchesSearch = [
        deal.title,
        deal.company,
        deal.owner,
      ].some((field) => field.toLowerCase().includes(query));

      const matchesStage =
        stageFilter === "all" || deal.stage === stageFilter;

      return matchesSearch && matchesStage;
    });

    return result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return a.closeDate.localeCompare(b.closeDate);

        case "value-high":
          return b.value - a.value;

        case "value-low":
          return a.value - b.value;

        case "closing-soon":
          return a.closeDate.localeCompare(b.closeDate);

        case "title":
          return a.title.localeCompare(b.title);

        default:
          return b.closeDate.localeCompare(a.closeDate);
      }
    });
  }, [deals, search, stageFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDeals.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  const visibleDeals = filteredDeals.slice(
    startIndex,
    startIndex + pageSize
  );

  function resetFilters() {
    setSearch("");
    setStageFilter("all");
    setSortBy("newest");
    setPageSize(10);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search deals, companies, owners..."
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-white outline-none focus:border-accent lg:col-span-2"
        />

        {/* Stage filter */}
        <CustomSelect
          value={stageFilter}
          onChange={(value) => {
            setStageFilter(value);
            setPage(1);
          }}
          options={[
            { value: "all", label: "All stages" },
            { value: "discovery", label: "Discovery" },
            { value: "qualified", label: "Qualified" },
            { value: "proposal", label: "Proposal" },
            { value: "negotiation", label: "Negotiation" },
            { value: "won", label: "Closed Won" },
          ]}
        />

        {/* Sorting */}
        <CustomSelect
          value={sortBy}
          onChange={(value) => {
            setSortBy(value);
            setPage(1);
          }}
          options={[
            { value: "newest", label: "Closing date: latest" },
            { value: "oldest", label: "Closing date: oldest" },
            { value: "closing-soon", label: "Closing soonest" },
            { value: "value-high", label: "Value: highest" },
            { value: "value-low", label: "Value: lowest" },
            { value: "title", label: "Deal title: A–Z" },
          ]}
        />
      </div>

      {/* Results information */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Showing{" "}
          {filteredDeals.length === 0 ? 0 : startIndex + 1}–
          {Math.min(startIndex + pageSize, filteredDeals.length)} of{" "}
          {filteredDeals.length} deals
        </p>

        <button
          type="button"
          onClick={resetFilters}
          className="text-sm text-accent hover:underline"
        >
          Reset filters
        </button>
      </div>

      {/* Deals table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 font-medium">Deal</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Stage</th>
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Closing date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {visibleDeals.map((deal) => (
              <tr
                key={deal.id}
                className="transition hover:bg-surface-hover"
              >
                <td className="px-4 py-4 text-sm font-medium text-white">
                  {deal.title}
                </td>

                <td className="px-4 py-4 text-sm text-muted">
                  {deal.company}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      stageStyles[deal.stage]
                    }`}
                  >
                    {stageNames[deal.stage]}
                  </span>
                </td>

                <td className="px-4 py-4 text-sm font-semibold text-white">
                  {currency(deal.value)}
                </td>

                <td className="px-4 py-4 text-sm text-muted">
                  {deal.owner}
                </td>

                <td className="px-4 py-4 text-sm text-muted">
                  {deal.closeDate}
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <EditDealButton deal={deal} />

                    <DeleteDealButton
                      dealId={deal.id}
                      dealTitle={deal.title}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {visibleDeals.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-sm text-muted"
                >
                  No deals found. Try changing your search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex items-center gap-2 text-sm text-muted">
          <span>Rows per page</span>

          <div className="w-24">
            <CustomSelect
              value={String(pageSize)}
              onChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
              options={[
                { value: "10", label: "10" },
                { value: "25", label: "25" },
                { value: "50", label: "50" },
              ]}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((previous) => previous - 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm text-muted">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((previous) => previous + 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
