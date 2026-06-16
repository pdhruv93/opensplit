"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { Expense } from "@opensplit/sdk";
import { getFriendExpensesAction } from "@/lib/actions/expenses";
import { Skeleton } from "@/components/shadcn/skeleton";

export function FriendExpenses({
  friendId,
  currentUserId,
}: {
  friendId: string;
  currentUserId: string;
}) {
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
          <Skeleton key={i} className="h-10 w-full" />
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
      {expenses.map((expense) => {
        const myShare = expense.shares.find(
          (s) => s.userId === currentUserId
        );
        const paidByMe = parseFloat(myShare?.paidShare ?? "0");
        const owedByMe = parseFloat(myShare?.owedShare ?? "0");
        const net = paidByMe - owedByMe;

        return (
          <div key={expense.id} className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-sm">{expense.description}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(expense.date).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm">
                <span className="text-muted-foreground">{t("total")}</span>{" "}
                <span className="font-medium">{expense.cost} {expense.currencyCode}</span>
              </p>
              <p className={net >= 0 ? "text-xs text-green-600" : "text-xs text-red-600"}>
                {net > 0
                  ? `${t("youGet")} ${net.toFixed(2)} ${expense.currencyCode}`
                  : net < 0
                    ? `${t("youPay")} ${Math.abs(net).toFixed(2)} ${expense.currencyCode}`
                    : null}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
