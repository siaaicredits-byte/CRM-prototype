
import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Users,
  ArrowLeft,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { db } from "@/src/prisma/db";

export const metadata: Metadata = {
  title: "Company Details",
};

type CompanyDetailsPageProps = {
  params: Promise<{ id: string }>;
};

async function CompanyDetailsData({ id }: { id: number }) {
  const [company, contacts] = await Promise.all([
    db.orm.public.Company.where({ id }).first(),
    db.orm.public.Contact.where({ companyId: id }).all(),
  ]);

  if (!company) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/companies"
          className="mb-4 inline-flex items-center gap-2 text-sm text-ink-muted transition hover:text-accent"
        >
          <ArrowLeft size={16} />
          Back to Companies
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent ring-1 ring-accent/20">
            <Building2 size={24} />
          </span>

          <div>
            <h1 className="text-2xl font-bold text-ink">
              {company.name}
            </h1>
            <p className="text-sm text-ink-muted">
              {company.industry || "Industry not specified"}
            </p>
          </div>

          <div className="ml-auto">
            <Badge tone="accent">Live database</Badge>
          </div>
        </div>
      </div>

      <Card delay={1} className="p-5">
        <CardHeader
          title="Company information"
          description="Business account details"
        />

        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Globe size={18} className="mt-0.5 text-ink-muted" />
            <div>
              <p className="text-xs text-ink-muted">Website</p>
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-accent hover:underline"
                >
                  {company.website}
                </a>
              ) : (
                <p className="text-sm text-ink">—</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail size={18} className="mt-0.5 text-ink-muted" />
            <div>
              <p className="text-xs text-ink-muted">Email</p>
              <p className="text-sm text-ink">{company.email || "—"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone size={18} className="mt-0.5 text-ink-muted" />
            <div>
              <p className="text-xs text-ink-muted">Phone</p>
              <p className="text-sm text-ink">{company.phone || "—"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin size={18} className="mt-0.5 text-ink-muted" />
            <div>
              <p className="text-xs text-ink-muted">Address</p>
              <p className="text-sm text-ink">{company.address || "—"}</p>
            </div>
          </div>
        </div>

        {company.description && (
          <div className="mt-5 border-t border-line pt-4">
            <p className="text-xs text-ink-muted">Description</p>
            <p className="mt-1 text-sm text-ink">
              {company.description}
            </p>
          </div>
        )}
      </Card>

      <Card delay={2} className="overflow-hidden">
        <CardHeader
          title="Associated contacts"
          description={`${contacts.length} contacts linked to this company`}
        />

        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <Users size={20} className="text-accent" />
          <span className="text-sm font-medium text-ink">
            {contacts.length} associated contacts
          </span>
        </div>

        {contacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-ink-muted">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Job Title</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                </tr>
              </thead>

              <tbody>
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-b border-line/70 hover:bg-surface-hover/50"
                  >
                    <td className="px-5 py-4 font-medium text-ink">
                      {[contact.firstName, contact.lastName]
                        .filter(Boolean)
                        .join(" ")}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">
                      {contact.jobTitle || "—"}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">
                      {contact.email || "—"}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">
                      {contact.phone || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <Users size={30} className="mx-auto text-ink-muted" />
            <p className="mt-3 font-medium text-ink">
              No contacts linked yet
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              Assign contacts to this company from the Contacts page.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

async function CompanyDetailsContent({
  params,
}: CompanyDetailsPageProps) {
  await connection();

  const { id } = await params;
  const companyId = Number(id);

  if (!Number.isInteger(companyId) || companyId <= 0) {
    notFound();
  }

  return <CompanyDetailsData id={companyId} />;
}

export default function CompanyDetailsPage({
  params,
}: CompanyDetailsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-line bg-surface p-8 text-center text-sm text-ink-muted">
          Loading company details...
        </div>
      }
    >
      <CompanyDetailsContent params={params} />
    </Suspense>
  );
}
