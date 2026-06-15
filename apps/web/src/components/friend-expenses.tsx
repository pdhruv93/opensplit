"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { Expense } from "@opensplit/sdk";
import { getFriendExpensesAction } from "@/lib/actions/expenses";
import { Skeleton } from "@/components/shadcn/skeleton";

export function FriendExpenses({ friendId }: { friendId: string }) {
  const t = useTranslations("friends");
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFriendExpensesAction(friendId).then((data) => {
      setExpenses(data);
      setLoading(false);
    });
  }, [friendId]);

  if (loading) {
    return (
      <div className="space-y-2 py-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <p className="py-2 text-sm text-muted-foreground">
        {t("noExpenses")}
      </p>
    );
  }

  return (
    <div className="divide-y">
      {expenses.map((expense) => (
        <div key={expense.id} className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm">{expense.description}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(expense.date).toLocaleDateString()}
            </p>
          </div>
          <p className="text-sm font-medium">
            {expense.cost} {expense.currencyCode}
          </p>
        </div>
      ))}
    </div>
  );
}
