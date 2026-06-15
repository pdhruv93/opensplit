import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { BalancesList } from "@/components/balances-list";
import { BalancesListSkeleton } from "@/components/balances-list-skeleton";
import { AddExpenseSection } from "@/components/add-expense-section";
import { Skeleton } from "@/components/shadcn/skeleton";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <div className="flex gap-8">
      <div className="flex-1">
        <h1 className="mb-6 text-2xl font-semibold">{t("balancesTitle")}</h1>
        <Suspense fallback={<BalancesListSkeleton />}>
          <BalancesList />
        </Suspense>
      </div>
      <div className="w-80 shrink-0">
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          }
        >
          <AddExpenseSection />
        </Suspense>
      </div>
    </div>
  );
}
