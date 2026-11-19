
import type { Metadata } from "next";
import { Suspense } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate } from "@/lib/format";
import { getDatabaseContacts } from "@/lib/database-contacts";
import { AddContactButton } from "@/components/contacts/AddContactButton";
import { EditContactButton } from "@/components/contacts/EditContactButton";
import { DeleteContactButton } from "@/components/contacts/DeleteContactButton";
import { ContactSearch } from "@/components/contacts/ContactSearch";
import { connection } from "next/server";

export const metadata: Metadata = { title: "Contacts" };

async function ContactsData() {
  await connection();

  const contacts = await getDatabaseContacts();

  return (
    <Card delay={1} className="overflow-hidden">
      <CardHeader
        title="All contacts"
        description={`${contacts.length} contacts shown`}
      />
      <div className="pt-3">
        <ContactSearch contacts={contacts} />
      </div>
    </Card>
  );
}

function ContactsLoading() {
  return (
    <Card className="overflow-hidden">
      <CardHeader title="All contacts" description="Loading contacts..." />
      <div className="space-y-3 p-4">
        <div className="h-10 animate-pulse rounded-lg bg-surface-raised" />
        <div className="h-16 animate-pulse rounded-lg bg-surface-raised" />
      </div>
    </Card>
  );
}

export default function ContactsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Contacts"
        description="People you sell to, across all companies."
        actions={
  <>
    <Badge tone="accent">Live database</Badge>
    <AddContactButton />
  </>
}
      />

      <Suspense fallback={<ContactsLoading />}>
        <ContactsData />
      </Suspense>
    </div>
  );
}
