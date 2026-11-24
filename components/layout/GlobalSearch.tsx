
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Users,
  Building2,
  Handshake,
  UserRound,
  Loader2,
} from "lucide-react";

interface SearchResult {
  id: string;
  type: "Lead" | "Contact" | "Company" | "Deal";
  title: string;
  subtitle?: string;
  href: string;
}

export function GlobalSearch() {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const value = query.trim();

    if (value.length < 2) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/search?q=${encodeURIComponent(value)}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Search failed.");
        }

        setResults(data.results || []);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError("Unable to search. Please try again.");
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function selectResult(result: SearchResult) {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(result.href);
  }

  function getIcon(type: SearchResult["type"]) {
    switch (type) {
      case "Lead":
        return Users;
      case "Contact":
        return UserRound;
      case "Company":
        return Building2;
      case "Deal":
        return Handshake;
    }
  }

  return (
    <div
      ref={wrapperRef}
      className="relative flex min-w-0 max-w-md flex-1"
    >
      <div className="relative w-full">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />

        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder="Search leads, contacts, deals..."
          aria-label="Search CRM records"
          aria-expanded={open}
          className="h-9 w-full rounded-lg border border-line bg-surface/70 pl-9 pr-9 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-accent"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-line bg-surface shadow-2xl">
          {loading && (
            <div className="flex items-center justify-center gap-2 p-5 text-sm text-ink-muted">
              <Loader2 size={16} className="animate-spin" />
              Searching records...
            </div>
          )}

          {!loading && error && (
            <p className="p-4 text-sm text-red-400">{error}</p>
          )}

          {!loading && !error && results.length === 0 && (
            <p className="p-5 text-center text-sm text-ink-muted">
              No matching records found.
            </p>
          )}

          {!loading &&
            !error &&
            results.map((result) => {
              const Icon = getIcon(result.type);

              return (
                <button
                  key={`${result.type}-${result.id}`}
                  type="button"
                  onClick={() => selectResult(result)}
                  className="flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left last:border-b-0 hover:bg-surface-raised"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-raised text-accent">
                    <Icon size={17} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {result.title}
                    </span>
                    <span className="block truncate text-xs text-ink-muted">
                      {result.type}
                      {result.subtitle ? ` · ${result.subtitle}` : ""}
                    </span>
                  </span>
                </button>
              );
            })}
        </div>
      )}

      {open && query.trim().length === 1 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-line bg-surface p-4 text-sm text-ink-muted shadow-xl">
          Type at least 2 characters to search.
        </div>
      )}
    </div>
  );
}
