import { getClient } from "@/lib/api";
import { AddExpenseForm } from "./add-expense-form";

export async function AddExpenseSection() {
  const client = await getClient();
  const [friends, currencies] = await Promise.all([
    client.friends.list(),
    client.currencies.list(),
  ]);

  return <AddExpenseForm friends={friends} currencies={currencies} />;
}
