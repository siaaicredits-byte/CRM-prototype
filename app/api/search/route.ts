
import { connection, NextRequest, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";


export async function GET(request: NextRequest) {
  await connection();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const query = request.nextUrl.searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, results: [] });
    }

    if (query.length > 100) {
      return NextResponse.json(
        { success: false, message: "Search query is too long." },
        { status: 400 }
      );
    }

    const [leads, contacts, companies, deals] = await Promise.all([
      db.orm.public.Lead.where({ userId: currentUser.id }).all(),
      db.orm.public.Contact.where({ userId: currentUser.id }).all(),
      db.orm.public.Company.where({ userId: currentUser.id }).all(),
      db.orm.public.Deal.where({ userId: currentUser.id }).all(),
    ]);

    const matches = (value: unknown) =>
      typeof value === "string" &&
      value.toLowerCase().includes(query.toLowerCase());

    const results = [
      ...leads
        .filter((lead) =>
          [lead.firstName, lead.lastName, lead.email, lead.phone].some(matches)
        )
        .map((lead) => ({
          id: lead.id,
          type: "Lead",
          title: `${lead.firstName} ${lead.lastName ?? ""}`.trim(),
          subtitle: lead.email || lead.phone || lead.status,
          href: "/leads",
        })),

      ...contacts
        .filter((contact) =>
          [
            contact.firstName,
            contact.lastName,
            contact.email,
            contact.phone,
            contact.jobTitle,
          ].some(matches)
        )
        .map((contact) => ({
          id: contact.id,
          type: "Contact",
          title: `${contact.firstName} ${contact.lastName ?? ""}`.trim(),
          subtitle: contact.email || contact.jobTitle || contact.phone,
          href: "/contacts",
        })),

      ...companies
        .filter((company) =>
          [
            company.name,
            company.industry,
            company.email,
            company.phone,
            company.website,
          ].some(matches)
        )
        .map((company) => ({
          id: company.id,
          type: "Company",
          title: company.name,
          subtitle: company.industry || company.email || company.website,
          href: "/companies",
        })),

      ...deals
        .filter((deal) =>
          [deal.title, deal.stage, deal.owner].some(matches)
        )
        .map((deal) => ({
          id: deal.id,
          type: "Deal",
          title: deal.title,
          subtitle: `${deal.stage} • ${deal.owner}`,
          href: "/deals",
        })),
    ].slice(0, 20);

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Global search failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to perform search." },
      { status: 500 }
    );
  }
}
