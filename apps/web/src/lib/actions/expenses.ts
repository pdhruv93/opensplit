"use server";

import { revalidatePath } from "next/cache";
import { getClient } from "../api";

export type ExpenseState = {
  error?: string;
  success?: boolean;
};

export async function createExpenseAction(
  _prev: ExpenseState,
  formData: FormData
): Promise<ExpenseState> {
  const description = formData.get("description") as string;
  const cost = parseFloat(formData.get("cost") as string);
  const currencyCode = formData.get("currencyCode") as string;
  const friendId = formData.get("friendId") as string;
  const splitEqually = formData.get("splitEqually") === "on";
  const date = (formData.get("date") as string) || undefined;

  if (!description || isNaN(cost) || !currencyCode || !friendId) {
    return { error: "errorRequired" };
  }

  try {
    const client = await getClient();
    const me = await client.users.me();

    await client.expenses.create({
      description,
      cost,
      currencyCode,
      date,
      splitEqually,
      shares: [
        { userId: me.id, paidShare: cost, owedShare: cost / 2 },
        { userId: friendId, paidShare: 0, owedShare: cost / 2 },
      ],
    });

    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "errorFailed" };
  }
}
