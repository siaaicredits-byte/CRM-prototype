
"use client";

import { useMemo, useState } from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Contact } from "@/types/crm";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/format";
import { EditContactButton } from "@/components/contacts/EditContactButton";
import { DeleteContactButton } from "@/components/contacts/DeleteContactButton";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface ContactSearchProps {
  contacts: Contact[];
}

type SortOption = "name-asc" | "name-desc" | "newest" | "oldest";

export function ContactSearch({ contacts }: ContactSearchProps) {
  const [search, setSearch] = useState("");
  const [company, setCompany] = useState("All");
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const companies = useMemo(
    () =>
      Array.from(
        new Set(
          contacts
            .map((contact) => contact.company)
            .filter((value) => value && value !== "—")
        )
      ).sort(),
    [contacts]
  );

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = contacts.filter((contact) => {
      const matchesSearch = [
        contact.name,
        contact.email,
        contact.phone,
        contact.title,
        contact.company,
      ].some((value) => value?.toLowerCase().includes(query));

      const matchesCompany =
        company === "All" || contact.company === company;

      return matchesSearch && matchesCompany;
    });

    return result.sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name);

        case "name-desc":
          return b.name.localeCompare(a.name);

        case "oldest":
          return (
            new Date(a.lastContacted).getTime() -
            new Date(b.lastContacted).getTime()
          );

        default:
          return (
            new Date(b.lastContacted).getTime() -
            new Date(a.lastContacted).getTime()
          );
      }
    });
  }, [contacts, search, company, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredContacts.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const startRecord =
    filteredContacts.length === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const endRecord = Math.min(
    currentPage * pageSize,
    filteredContacts.length
  );

  function resetFilters() {
    setSearch("");
    setCompany("All");
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
            setPage(1);
          }}
          placeholder="Search by name, email, phone, company..."
          className="w-full rounded-xl border border-line bg-surface-raised py-3 pl-10 pr-10 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-accent"
        />

        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Company filter and sorting */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <CustomSelect
          value={company}
          onChange={(value) => {
            setCompany(value);
            setPage(1);
          }}
          options={[
            { value: "All", label: "All Companies" },
            ...companies.map((item) => ({
              value: item,
              label: item,
            })),
          ]}
        />

        <CustomSelect
          value={sort}
          onChange={(value) => {
            setSort(value as SortOption);
            setPage(1);
          }}
          options={[
            { value: "newest", label: "Recently Contacted" },
            { value: "oldest", label: "Oldest Contacted" },
            { value: "name-asc", label: "Name (A–Z)" },
            { value: "name-desc", label: "Name (Z–A)" },
          ]}
        />
      </div>

      {/* Results count and reset */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-ink-muted">
          Showing {filteredContacts.length} of {contacts.length} contacts
        </p>

        {(search || company !== "All" || sort !== "newest" || pageSize !== 10) && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-medium text-accent hover:underline"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Contacts table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wider text-ink-faint">
              <th scope="col" className="px-5 py-2.5 font-medium">Name</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Company</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Email</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Phone</th>
              <th scope="col" className="px-3 py-2.5 text-right font-medium">Last contacted</th>
              <th scope="col" className="px-5 py-2.5 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-line/70">
            {paginatedContacts.map((contact) => (
              <tr
                key={contact.id}
                className="transition-colors hover:bg-surface-raised/60"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={contact.name} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">
                        {contact.name}
                      </p>
                      <p className="truncate text-xs text-ink-muted">
                        {contact.title}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="whitespace-nowrap px-3 py-3 text-ink">
                  {contact.company}
                </td>

                <td className="px-3 py-3 text-ink-muted">
                  {contact.email}
                </td>

                <td className="whitespace-nowrap px-3 py-3 text-ink-muted">
                  {contact.phone}
                </td>

                <td className="whitespace-nowrap px-3 py-3 text-right text-ink-muted">
                  {formatDate(contact.lastContacted)}
                </td>

                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <EditContactButton contact={contact} />
                    <DeleteContactButton
                      contactId={contact.id}
                      contactName={contact.name}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {paginatedContacts.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-sm text-ink-muted"
                >
                  No contacts found. Try changing your search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-4 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-muted">Rows per page</span>

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
            Showing {startRecord}-{endRecord} of {filteredContacts.length}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-xs text-ink-muted">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((previous) => Math.max(1, previous - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-sm text-ink-muted transition hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <button
            type="button"
            onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
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
