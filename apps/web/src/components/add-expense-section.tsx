import { getClient } from "@/lib/api";
import { AddExpenseForm } from "./add-expense-form";

export async function AddExpenseSection() {
  const client = await getClient();
  const [me, friends, currencies, categories] = await Promise.all([
    client.users.me(),
    client.friends.list(),
    client.currencies.list(),
    client.categories.list(),
  ]);

  return (
    <AddExpenseForm
      currentUser={{ id: me.id, firstName: me.firstName, lastName: me.lastName }}
      friends={friends}
      currencies={currencies}
      categories={categories}
    />
  );
}
