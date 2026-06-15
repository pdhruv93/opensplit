import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { FriendsList } from "@/components/friends-list";
import { FriendsListSkeleton } from "@/components/friends-list-skeleton";
import { AddExpenseSection } from "@/components/add-expense-section";
import { Skeleton } from "@/components/shadcn/skeleton";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <div className="flex gap-8">
      <div className="flex-1">
        <h2 className="mb-4 text-lg font-semibold">{t("friendsTitle")}</h2>
        <Suspense fallback={<FriendsListSkeleton />}>
          <FriendsList />
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
