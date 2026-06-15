import { getClient } from "@/lib/api";
import { AddExpenseForm } from "./add-expense-form";
import { AddFriendForm } from "./add-friend-form";
import { Separator } from "@/components/shadcn/separator";

export async function AddExpenseSection() {
  const client = await getClient();
  const [friends, currencies] = await Promise.all([
    client.friends.list(),
    client.currencies.list(),
  ]);

  return (
    <div className="space-y-6">
      <AddExpenseForm friends={friends} currencies={currencies} />
      <Separator />
      <AddFriendForm />
    </div>
  );
}
