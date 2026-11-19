
"use client";

import { useMemo, useState } from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Lead, LeadStatus, LeadSource } from "@/types/crm";
import { RecentLeadsTable } from "@/components/dashboard/RecentLeadsTable";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface LeadSearchProps {
  leads: Lead[];
}

type SortOption = "newest" | "oldest" | "highest" | "lowest";

export function LeadSearch({ leads }: LeadSearchProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [source, setSource] = useState("All");
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = leads.filter((lead) => {
      const matchesSearch = [
        lead.name,
        lead.email,
        lead.company,
        lead.source,
        lead.owner,
      ].some((value) => value?.toLowerCase().includes(query));

      const matchesStatus =
        status === "All" || lead.status === status;

      const matchesSource =
        source === "All" || lead.source === source;

      return matchesSearch && matchesStatus && matchesSource;
    });

    return result.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
          );

        case "highest":
          return b.value - a.value;

        case "lowest":
          return a.value - b.value;

        default:
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
      }
    });
  }, [leads, search, status, source, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLeads.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const startRecord =
    filteredLeads.length === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const endRecord = Math.min(
    currentPage * pageSize,
    filteredLeads.length
  );

  function resetPage() {
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStatus("All");
    setSource("All");
    setSort("newest");
    setPageSize(10);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
        />

        <input
          type="text"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            resetPage();
          }}
          placeholder="Search by name, email, company..."
          className="w-full rounded-xl border border-line bg-surface-raised py-3 pl-10 pr-10 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-accent"
        />

        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              resetPage();
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Filters and sorting */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Status filter */}
        <CustomSelect
          value={status}
          onChange={(value) => {
            setStatus(value);
            resetPage();
          }}
          options={[
            { value: "All", label: "All Statuses" },
            ...(["New", "Contacted", "Qualified", "Proposal", "Lost"] as LeadStatus[]).map(
              (item) => ({
                value: item,
                label: item,
              })
            ),
          ]}
        />

        {/* Source filter */}
        <CustomSelect
          value={source}
          onChange={(value) => {
            setSource(value);
            resetPage();
          }}
          options={[
            { value: "All", label: "All Sources" },
            ...(["Website", "Referral", "LinkedIn", "Event", "Cold Outreach"] as LeadSource[]).map(
              (item) => ({
                value: item,
                label: item,
              })
            ),
          ]}
        />

        {/* Sorting */}
        <CustomSelect
          value={sort}
          onChange={(value) => {
            setSort(value as SortOption);
            resetPage();
          }}
          options={[
            { value: "newest", label: "Newest First" },
            { value: "oldest", label: "Oldest First" },
            { value: "highest", label: "Highest Value" },
            { value: "lowest", label: "Lowest Value" },
          ]}
        />
      </div>

      {/* Results count and reset */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-ink-muted">
          Showing {filteredLeads.length} of {leads.length} leads
        </p>

        {(search ||
          status !== "All" ||
          source !== "All" ||
          sort !== "newest" ||
          pageSize !== 10) && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-medium text-accent hover:underline"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Leads table */}
      <RecentLeadsTable leads={paginatedLeads} detailed />

      {/* Pagination */}
      <div className="flex flex-col gap-4 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-muted">
            Rows per page
          </span>

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

          <span className="text-xs text-ink-muted">
            Showing {startRecord}-{endRecord} of {filteredLeads.length}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-xs text-ink-muted">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() =>
              setPage((previous) => Math.max(1, previous - 1))
            }
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-sm text-ink-muted transition hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <button
            type="button"
            onClick={() =>
              setPage((previous) =>
                Math.min(totalPages, previous + 1)
              )
            }
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-sm text-ink-muted transition hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
