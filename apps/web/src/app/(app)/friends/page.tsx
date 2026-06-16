import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getClient } from "@/lib/api";
import { FriendsAccordion } from "@/components/friends-accordion";
import { AddFriendForm } from "@/components/add-friend-form";
import { FriendsListSkeleton } from "@/components/friends-list-skeleton";
import { Users } from "lucide-react";

async function FriendsContent() {
  const t = await getTranslations("friends");
  const client = await getClient();
  const [me, friends] = await Promise.all([
    client.users.me(),
    client.friends.list(),
  ]);

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">{t("empty")}</p>
      </div>
    );
  }

  return <FriendsAccordion friends={friends} currentUserId={me.id} />;
}

export default async function FriendsPage() {
  const t = await getTranslations("friends");

  return (
    <div className="flex gap-16">
      <div className="flex-1">
        <h1 className="mb-6 text-2xl font-semibold">{t("title")}</h1>
        <Suspense fallback={<FriendsListSkeleton />}>
          <FriendsContent />
        </Suspense>
      </div>
      <div className="w-80 shrink-0">
        <AddFriendForm />
      </div>
    </div>
  );
}
