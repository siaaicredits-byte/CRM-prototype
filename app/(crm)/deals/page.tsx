
import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { Avatar } from "@/components/ui/Avatar";
import { PageHeader } from "@/components/ui/PageHeader";
import { AddDealButton } from "@/components/deals/AddDealButton";
import { EditDealButton } from "@/components/deals/EditDealButton";
import { DeleteDealButton } from "@/components/deals/DeleteDealButton";
import { getDatabaseDeals } from "@/lib/database-deals";
import { dealStages } from "@/lib/demo-data";
import { formatCurrency, formatDate } from "@/lib/format";
import type { DealStageId } from "@/types/crm";
import { DealSearch } from "@/components/deals/DealSearch";

export const metadata: Metadata = { title: "Deals" };

async function DealsData() {
  await connection();

  const deals = await getDatabaseDeals();

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {dealStages.map((stage) => {
          const stageDeals = deals.filter((deal) => deal.stage === stage.id);
          const total = stageDeals.reduce(
            (sum, deal) => sum + deal.value,
            0
          );

          return (
            <div
              key={stage.id}
              className="rounded-2xl border border-line bg-surface p-4"
            >
              <p className="text-xs text-ink-muted">{stage.name}</p>
              <p className="mt-2 text-xl font-semibold tabular-nums text-ink">
                {formatCurrency(total, { compact: true })}
              </p>
              <p className="mt-1 text-xs text-ink-faint">
                {stageDeals.length} deals
              </p>
            </div>
          );
        })}
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="grid min-w-[1100px] grid-cols-5 gap-4">
          {dealStages.map((stage, stageIndex) => {
            const stageDeals = deals.filter(
              (deal) => deal.stage === stage.id
            );

            const total = stageDeals.reduce(
              (sum, deal) => sum + deal.value,
              0
            );

            return (
              <section
                key={stage.id}
                aria-label={stage.name}
                className="animate-fade-up flex flex-col rounded-2xl border border-line bg-surface/50 p-3"
                style={{ animationDelay: `${stageIndex * 60}ms` }}
              >
                <header className="flex items-center justify-between px-1 pb-3">
                  <div>
                    <h2 className="text-sm font-semibold text-ink">
                      {stage.name}
                    </h2>
                    <p className="text-xs tabular-nums text-ink-muted">
                      {formatCurrency(total, { compact: true })}
                    </p>
                  </div>

                  <span className="rounded-md bg-surface-raised px-2 py-0.5 text-xs tabular-nums text-ink-muted">
                    {stageDeals.length}
                  </span>
                </header>

                <ul className="flex flex-col gap-2.5">
                  {stageDeals.map((deal) => (
                    <li
                      key={deal.id}
                      className="rounded-xl border border-line bg-navy-900/70 p-3 transition-colors hover:border-accent/40"
                    >
                      <p className="text-sm font-medium text-ink">
                        {deal.title}
                      </p>

                      <p className="mt-0.5 text-xs text-ink-muted">
                        {deal.company}
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-semibold tabular-nums text-ink">
                          {formatCurrency(deal.value)}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-ink-faint">
                            {formatDate(deal.closeDate)}
                          </span>
                          <Avatar
                            name={deal.owner}
                            className="size-6 text-[9px]"
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                        <span className="text-[11px] text-ink-faint">
                          {deal.owner}
                        </span>

                        <div className="flex items-center gap-2">
                          <EditDealButton deal={deal} />
                          <DeleteDealButton
                            dealId={deal.id}
                            dealTitle={deal.title}
                          />
                        </div>
                      </div>
                    </li>
                  ))}

                  {stageDeals.length === 0 ? (
                    <li className="rounded-xl border border-dashed border-line p-4 text-center text-xs text-ink-faint">
                      No deals
                    </li>
                  ) : null}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
      <div className="rounded-2xl border border-line bg-surface p-4">
  <div className="mb-4">
    <h2 className="text-base font-semibold text-ink">
      All Deals
    </h2>
    <p className="mt-1 text-sm text-ink-muted">
      Search, filter, sort and manage your sales opportunities.
    </p>
  </div>

  <DealSearch deals={deals} />
</div>
    </>
  );
}

function DealsLoading() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-8 text-center text-sm text-ink-muted">
      Loading deals...
    </div>
  );
}

export default function DealsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Deals"
        description="Manage your sales opportunities and track your pipeline."
        actions={<AddDealButton />}
      />

      <Suspense fallback={<DealsLoading />}>
        <DealsData />
      </Suspense>
    </div>
  );
}
