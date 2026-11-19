
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DatabaseCompany } from "@/lib/database-companies";
import { EditCompanyButton } from "@/components/companies/EditCompanyButton";
import { DeleteCompanyButton } from "@/components/companies/DeleteCompanyButton";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface CompanySearchProps {
  companies: DatabaseCompany[];
}

export function CompanySearch({ companies }: CompanySearchProps) {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [sort, setSort] = useState("newest");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const industries = useMemo(
    () =>
      Array.from(
        new Set(companies.map((company) => company.industry).filter(Boolean))
      ).sort(),
    [companies]
  );

  const filteredCompanies = useMemo(() => {
    const query = search.toLowerCase().trim();

    const filtered = companies.filter((company) => {
      const matchesSearch = [
        company.name,
        company.email,
        company.industry,
        company.phone,
        company.address,
        company.website,
      ].some((value) => value.toLowerCase().includes(query));

      const matchesIndustry =
        industry === "All" || company.industry === industry;

      return matchesSearch && matchesIndustry;
    });

    return filtered.sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "oldest":
          return (
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
          );
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
      }
    });
  }, [companies, search, industry, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCompanies.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  const visibleCompanies = filteredCompanies.slice(
    startIndex,
    startIndex + pageSize
  );

  function resetFilters() {
    setSearch("");
    setIndustry("All");
    setSort("newest");
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search companies..."
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        />

        <CustomSelect
          value={industry}
          onChange={(value) => {
            setIndustry(value);
            setPage(1);
          }}
          placeholder="All industries"
          options={[
            { value: "All", label: "All industries" },
            ...industries.map((item) => ({
              value: item,
              label: item,
            })),
          ]}
        />

        <CustomSelect
          value={sort}
          onChange={(value) => {
            setSort(value);
            setPage(1);
          }}
          options={[
            { value: "newest", label: "Recently added" },
            { value: "oldest", label: "Oldest added" },
            { value: "name-asc", label: "Name A–Z" },
            { value: "name-desc", label: "Name Z–A" },
          ]}
        />

        <button
          type="button"
          onClick={resetFilters}
          className="rounded-lg border border-line px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-hover"
        >
          Reset filters
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-ink-muted">
              <th className="px-3 py-3 font-medium">Company</th>
              <th className="px-3 py-3 font-medium">Industry</th>
              <th className="px-3 py-3 font-medium">Email</th>
              <th className="px-3 py-3 font-medium">Phone</th>
              <th className="px-3 py-3 font-medium">Added</th>
              <th className="px-3 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {visibleCompanies.map((company) => (
              <tr
                key={company.id}
                className="border-b border-line/70 transition-colors hover:bg-surface-hover/50"
              >
                <td className="px-3 py-4">
                  <Link
                    href={`/companies/${company.id}`}
                    className="font-medium text-ink transition-colors hover:text-accent hover:underline"
                  >
                    {company.name}
                  </Link>

                  {company.website && (
                    <div className="mt-1 max-w-48 truncate text-xs text-ink-muted">
                      {company.website}
                    </div>
                  )}
                </td>

                <td className="px-3 py-4 text-ink-muted">
                  {company.industry || "—"}
                </td>

                <td className="px-3 py-4 text-ink-muted">
                  {company.email || "—"}
                </td>

                <td className="px-3 py-4 text-ink-muted">
                  {company.phone || "—"}
                </td>

                <td className="px-3 py-4 text-ink-muted">
                  {new Date(company.createdAt).toLocaleDateString("en-IN")}
                </td>

                <td className="px-3 py-4">
                  <div className="flex justify-end gap-2">
                    <EditCompanyButton company={company} />
                    <DeleteCompanyButton
                      companyId={company.id}
                      companyName={company.name}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {visibleCompanies.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-12 text-center text-sm text-ink-muted"
                >
                  {companies.length === 0
                    ? "No companies added yet. Create your first company to get started."
                    : "No companies match your search or filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
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

          <span>
            {filteredCompanies.length === 0
              ? "0 companies"
              : `${startIndex + 1}–${Math.min(
                  startIndex + pageSize,
                  filteredCompanies.length
                )} of ${filteredCompanies.length} companies`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink-muted hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-xs text-ink-muted">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink-muted hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
