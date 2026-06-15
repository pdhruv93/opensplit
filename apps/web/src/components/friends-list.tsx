import { getTranslations } from "next-intl/server";
import { getClient } from "@/lib/api";
import { FriendRow } from "./friend-row";
import { Users } from "lucide-react";

export async function FriendsList() {
  const t = await getTranslations("friends");
  const client = await getClient();
  const friends = await client.friends.list();

  const labels = {
    settledUp: t("settledUp"),
    owesYou: t("owesYou"),
    youOwe: t("youOwe"),
  };

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {friends.map((friend) => (
        <FriendRow key={friend.id} friend={friend} labels={labels} />
      ))}
    </div>
  );
}
