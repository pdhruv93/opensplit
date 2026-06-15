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

  const netBalance = friend.balance.reduce(
    (acc, b) => acc + parseFloat(b.amount),
    0
  );

  const balanceText = friend.balance
    .map(
      (b) =>
        `${Math.abs(parseFloat(b.amount))} ${b.currencyCode}`
    )
    .join(", ");

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
      {netBalance > 0 ? (
        <p className="text-sm font-medium text-green-600">
          {labels.owesYou} {balanceText}
        </p>
      ) : (
        <p className="text-sm font-medium text-red-600">
          {labels.youOwe} {balanceText}
        </p>
      )}
    </div>
  );
}
