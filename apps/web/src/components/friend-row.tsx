import type { Friend } from "@opensplit/sdk";
import { Avatar, AvatarFallback } from "@/components/shadcn/avatar";

type FriendLabels = {
  settledUp: string;
  owesYou: string;
  youOwe: string;
};

export function FriendRow({
  friend,
  labels,
}: {
  friend: Friend;
  labels: FriendLabels;
}) {
  const initials =
    (friend.firstName[0] || "") + (friend.lastName?.[0] || "");

  const netBalance = friend.balance.reduce((acc, b) => {
    return acc + parseFloat(b.amount);
  }, 0);

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="text-xs">
            {initials.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">
            {friend.firstName} {friend.lastName || ""}
          </p>
          <p className="text-xs text-muted-foreground">{friend.email}</p>
        </div>
      </div>
      <div className="text-right">
        {netBalance === 0 ? (
          <p className="text-sm text-muted-foreground">{labels.settledUp}</p>
        ) : netBalance > 0 ? (
          <p className="text-sm text-green-600">
            {labels.owesYou}{" "}
            {friend.balance.map((b) => `${b.amount} ${b.currencyCode}`).join(", ")}
          </p>
        ) : (
          <p className="text-sm text-red-600">
            {labels.youOwe}{" "}
            {friend.balance
              .map(
                (b) =>
                  `${Math.abs(parseFloat(b.amount))} ${b.currencyCode}`
              )
              .join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
