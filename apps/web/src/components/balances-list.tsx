import { getTranslations } from "next-intl/server";
import { getClient } from "@/lib/api";
import { BalanceRow } from "./balance-row";
import { CheckCircle } from "lucide-react";

export async function BalancesList() {
  const t = await getTranslations("home");
  const client = await getClient();
  const friends = await client.friends.list();

  const labels = {
    owesYou: t("owesYou"),
    youOwe: t("youOwe"),
  };

  const withBalance = friends.filter((f) => f.balance.length > 0);

  if (withBalance.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">
          {t("allSettled")}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {withBalance.map((friend) => (
        <BalanceRow key={friend.id} friend={friend} labels={labels} />
      ))}
    </div>
  );
}
