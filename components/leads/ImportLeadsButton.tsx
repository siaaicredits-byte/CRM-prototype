
"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import {
  Upload,
  FileSpreadsheet,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  FileUp,
} from "lucide-react";

type LeadRow = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  value: number;
};

type PreviewRow = LeadRow & {
  rowNumber: number;
  error?: string;
};

const SOURCES = [
  "Website",
  "Referral",
  "LinkedIn",
  "Event",
  "Cold Outreach",
];

const STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL",
  "LOST",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ROWS = 500;

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getCell(
  row: Record<string, unknown>,
  aliases: string[]
): string {
  for (const key of Object.keys(row)) {
    if (aliases.includes(normalizeHeader(key))) {
      return String(row[key] ?? "").trim();
    }
  }

  return "";
}

function validateRows(rows: LeadRow[]): PreviewRow[] {
  const seenEmails = new Set<string>();

  return rows.map((row, index) => {
    let error = "";
    const email = row.email.toLowerCase();

    if (!row.firstName) {
      error = "First name is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      error = "Invalid email address.";
    } else if (seenEmails.has(email)) {
      error = "Duplicate email in this file.";
    } else if (!SOURCES.includes(row.source)) {
      error = "Invalid lead source.";
    } else if (!STATUSES.includes(row.status)) {
      error = "Invalid lead status.";
    } else if (!Number.isFinite(row.value) || row.value < 0) {
      error = "Invalid lead value.";
    }

    if (email) seenEmails.add(email);

    return {
      ...row,
      email,
      rowNumber: index + 2,
      error,
    };
  });
}

export function ImportLeadsButton() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
    total: number;
    errors: { row: number; email: string; reason: string }[];
  } | null>(null);

  const validRows = rows.filter((row) => !row.error);
  const invalidRows = rows.length - validRows.length;

  function resetImport() {
    setFileName("");
    setRows([]);
    setError("");
    setResult(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function downloadTemplate(format: "csv" | "xlsx") {
    const data = [
      [
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Source",
        "Status",
        "Value",
      ],
      [
        "John",
        "Smith",
        "john@example.com",
        "9876543210",
        "Website",
        "NEW",
        1000,
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Leads"
    );

    if (format === "csv") {
      XLSX.writeFile(workbook, "CRM_Leads_Template.csv", {
        bookType: "csv",
      });
    } else {
      XLSX.writeFile(workbook, "CRM_Leads_Template.xlsx");
    }
  }

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    setError("");
    setResult(null);
    setRows([]);

    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["csv", "xlsx", "xls"].includes(extension || "")) {
      setError("Please select a CSV or Excel file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be 5 MB or less.");
      return;
    }

    try {
      const buffer = await file.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
      });

      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        throw new Error("The selected file contains no worksheet.");
      }

      const worksheet = workbook.Sheets[sheetName];

      const rawRows = XLSX.utils.sheet_to_json<
        Record<string, unknown>
      >(worksheet, {
        defval: "",
        raw: false,
      });

      if (rawRows.length === 0) {
        throw new Error("The selected file contains no lead records.");
      }

      if (rawRows.length > MAX_ROWS) {
        throw new Error("Maximum 500 leads per file.");
      }

      const mappedRows: LeadRow[] = rawRows.map((raw) => {
        const valueText = getCell(raw, [
          "value",
          "leadvalue",
          "dealvalue",
        ]);

        return {
          firstName: getCell(raw, [
            "firstname",
            "first",
            "name",
          ]),
          lastName: getCell(raw, [
            "lastname",
            "last",
          ]),
          email: getCell(raw, [
            "email",
            "emailaddress",
          ]).toLowerCase(),
          phone: getCell(raw, [
            "phone",
            "phonenumber",
            "mobile",
          ]),
          source:
            getCell(raw, [
              "source",
              "leadsource",
            ]) || "Website",
          status:
            getCell(raw, [
              "status",
              "leadstatus",
            ]).toUpperCase() || "NEW",
          value:
            valueText === "" ? 0 : Number(valueText),
        };
      });

      setRows(validateRows(mappedRows));
      setFileName(file.name);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to read this file."
      );
    }
  }

  async function handleImport() {
    if (validRows.length === 0) {
      setError("There are no valid leads to import.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const leads = validRows.map(
        ({
          firstName,
          lastName,
          email,
          phone,
          source,
          status,
          value,
        }) => ({
          firstName,
          lastName,
          email,
          phone,
          source,
          status,
          value,
        })
      );

      const response = await fetch("/api/leads/bulk-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leads }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to import leads."
        );
      }

      const serverErrors = Array.isArray(data.errors)
        ? data.errors
        : [];

      setResult({
        total: rows.length,
        imported: data.summary?.imported ?? 0,
        skipped:
          invalidRows + (data.summary?.skipped ?? 0),
        errors: [
          ...rows
            .filter((row) => row.error)
            .map((row) => ({
              row: row.rowNumber,
              email: row.email,
              reason: row.error || "Invalid row.",
            })),
          ...serverErrors,
        ],
      });

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Import failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-raised"
      >
        <Upload size={16} />
        Import Leads
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !loading) {
                setOpen(false);
              }
            }}
          >
            <div className="my-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-2xl">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-ink">
                    Import Leads
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    Upload leads from a CSV or Excel file.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-ink-muted hover:bg-surface-raised disabled:opacity-50"
                  aria-label="Close import"
                >
                  <X size={20} />
                </button>
              </div>

              {!result && (
                <>
                  <div className="mb-5 rounded-xl border border-line bg-surface-raised p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <FileSpreadsheet
                        size={19}
                        className="text-accent"
                      />
                      <h3 className="text-sm font-semibold text-ink">
                        Download import template
                      </h3>
                    </div>

                    <p className="mb-3 text-xs text-ink-muted">
                      Use the template headings to prepare your
                      lead records. First Name and Email are required.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => downloadTemplate("csv")}
                        className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink hover:bg-surface"
                      >
                        <Download size={14} />
                        CSV Template
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadTemplate("xlsx")}
                        className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink hover:bg-surface"
                      >
                        <Download size={14} />
                        Excel Template
                      </button>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id="lead-import-file"
                  />

                  <label
                    htmlFor="lead-import-file"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-surface-raised px-5 py-9 text-center transition hover:border-accent"
                  >
                    <FileUp
                      size={32}
                      className="mb-3 text-accent"
                    />
                    <span className="text-sm font-semibold text-ink">
                      {fileName || "Choose a CSV or Excel file"}
                    </span>
                    <span className="mt-1 text-xs text-ink-muted">
                      CSV, XLSX or XLS · Maximum 5 MB · 500 leads
                    </span>
                  </label>

                  {rows.length > 0 && (
                    <div className="mt-5">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-ink">
                          Import preview
                        </h3>
                        <div className="flex gap-3 text-xs">
                          <span className="text-green-500">
                            {validRows.length} valid
                          </span>
                          <span className="text-red-400">
                            {invalidRows} invalid
                          </span>
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-lg border border-line">
                        <table className="w-full min-w-[650px] text-left text-xs">
                          <thead className="bg-surface-raised text-ink-muted">
                            <tr>
                              <th className="p-3">Row</th>
                              <th className="p-3">Name</th>
                              <th className="p-3">Email</th>
                              <th className="p-3">Source</th>
                              <th className="p-3">Status</th>
                              <th className="p-3">Validation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.slice(0, 8).map((row) => (
                              <tr
                                key={row.rowNumber}
                                className="border-t border-line"
                              >
                                <td className="p-3">
                                  {row.rowNumber}
                                </td>
                                <td className="p-3">
                                  {row.firstName} {row.lastName}
                                </td>
                                <td className="p-3">
                                  {row.email}
                                </td>
                                <td className="p-3">
                                  {row.source}
                                </td>
                                <td className="p-3">
                                  {row.status}
                                </td>
                                <td className="p-3">
                                  {row.error ? (
                                    <span className="text-red-400">
                                      {row.error}
                                    </span>
                                  ) : (
                                    <span className="text-green-500">
                                      Valid
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {rows.length > 8 && (
                        <p className="mt-2 text-xs text-ink-muted">
                          Showing 8 of {rows.length} records.
                        </p>
                      )}
                    </div>
                  )}

                  {error && (
                    <p className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      {error}
                    </p>
                  )}

                  <div className="mt-6 flex justify-end gap-3 border-t border-line pt-4">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        resetImport();
                        setOpen(false);
                      }}
                      className="rounded-lg border border-line px-4 py-2.5 text-sm text-ink-muted hover:bg-surface-raised"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={loading || validRows.length === 0}
                      onClick={handleImport}
                      className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading
                        ? "Importing..."
                        : `Import ${validRows.length} Leads`}
                    </button>
                  </div>
                </>
              )}

              {result && (
                <div>
                  <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                    <CheckCircle2
                      size={26}
                      className="text-green-500"
                    />
                    <div>
                      <h3 className="font-semibold text-ink">
                        Import completed
                      </h3>
                      <p className="text-xs text-ink-muted">
                        {result.imported} of {result.total} records imported.
                      </p>
                    </div>
                  </div>

                  <div className="mb-5 grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-line p-3">
                      <p className="text-xs text-ink-muted">Total</p>
                      <p className="mt-1 text-xl font-semibold text-ink">
                        {result.total}
                      </p>
                    </div>
                    <div className="rounded-lg border border-line p-3">
                      <p className="text-xs text-ink-muted">Imported</p>
                      <p className="mt-1 text-xl font-semibold text-green-500">
                        {result.imported}
                      </p>
                    </div>
                    <div className="rounded-lg border border-line p-3">
                      <p className="text-xs text-ink-muted">Skipped</p>
                      <p className="mt-1 text-xl font-semibold text-red-400">
                        {result.skipped}
                      </p>
                    </div>
                  </div>

                  {result.errors.length > 0 && (
                    <div className="max-h-52 overflow-y-auto rounded-lg border border-line p-3">
                      <h4 className="mb-2 text-sm font-semibold text-ink">
                        Skipped records
                      </h4>
                      {result.errors.map((item, index) => (
                        <p
                          key={`${item.row}-${index}`}
                          className="border-t border-line py-2 text-xs text-ink-muted"
                        >
                          Row {item.row} ({item.email || "No email"}):{" "}
                          {item.reason}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end gap-3 border-t border-line pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        resetImport();
                        setOpen(false);
                      }}
                      className="rounded-lg border border-line px-4 py-2.5 text-sm text-ink-muted hover:bg-surface-raised"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={resetImport}
                      className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
                    >
                      Import Another File
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
