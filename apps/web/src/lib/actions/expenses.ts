"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";
import type { Expense } from "@opensplit/sdk";
import { getClient } from "../api";
import { getApiKey } from "../auth";

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
  const date = (formData.get("date") as string) || undefined;
  const categoryIdRaw = formData.get("categoryId") as string;
  const categoryId = categoryIdRaw ? parseInt(categoryIdRaw, 10) : undefined;

  const userIds = formData.getAll("shareUserId") as string[];

  if (!description || isNaN(cost) || !currencyCode || userIds.length < 2) {
    return { error: "errorRequired" };
  }

  const owedEach = cost / userIds.length;
  const shares = userIds.map((userId, i) => ({
    userId,
    paidShare: i === 0 ? cost : 0,
    owedShare: owedEach,
  }));

  try {
    const client = await getClient();

    await client.expenses.create({
      description,
      cost,
      currencyCode,
      date,
      categoryId,
      splitEqually: true,
      shares,
    });

    revalidateTag("friend-expenses");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "errorFailed" };
  }
}

export async function getFriendExpensesAction(
  friendId: string
): Promise<Expense[]> {
  const apiKey = (await getApiKey()) ?? "";
  const baseUrl = process.env.OPENSPLIT_API_URL || "http://localhost:3000";

  const cached = unstable_cache(
    async (fid: string, key: string, url: string) => {
      const { OpenSplitClient } = await import("@opensplit/sdk");
      const client = new OpenSplitClient({ baseUrl: url, apiKey: key });
      return client.expenses.list({ friend_id: fid });
    },
    [`friend-expenses-${apiKey}-${friendId}`],
    { revalidate: 120, tags: ["friend-expenses"] }
  );

  return cached(friendId, apiKey, baseUrl);
}
