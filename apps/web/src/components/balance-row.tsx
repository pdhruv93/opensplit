import type { Friend } from "@opensplit/sdk";
import { Avatar, AvatarFallback } from "@/components/shadcn/avatar";

export function BalanceRow({
  friend,
  labels,
}: {
  friend: Friend;
  labels: { owesYou: string; youOwe: string };
}) {
  const initials =
    (friend.firstName[0] || "") + (friend.lastName?.[0] || "");

  const positiveBalances = friend.balance.filter((b) => parseFloat(b.amount) > 0);
  const negativeBalances = friend.balance.filter((b) => parseFloat(b.amount) < 0);

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="text-xs">
            {initials.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="text-sm font-medium">
          {friend.firstName} {friend.lastName || ""}
        </p>
      </div>
      <div className="text-right">
        {positiveBalances.map((b) => (
          <p key={b.currencyCode} className="text-sm font-medium text-green-600">
            {labels.owesYou} {parseFloat(b.amount).toFixed(2)} {b.currencyCode}
          </p>
        ))}
        {negativeBalances.map((b) => (
          <p key={b.currencyCode} className="text-sm font-medium text-red-600">
            {labels.youOwe} {Math.abs(parseFloat(b.amount)).toFixed(2)} {b.currencyCode}
          </p>
        ))}
      </div>
    </div>
  );
}
