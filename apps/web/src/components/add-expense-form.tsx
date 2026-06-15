"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  createExpenseAction,
  type ExpenseState,
} from "@/lib/actions/expenses";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import type { Friend, Currency } from "@opensplit/sdk";
import { Receipt } from "lucide-react";

export function AddExpenseForm({
  friends,
  currencies,
}: {
  friends: Friend[];
  currencies: Currency[];
}) {
  const t = useTranslations("expenses");
  const [state, action, pending] = useActionState<ExpenseState, FormData>(
    createExpenseAction,
    {}
  );

  return (
    <form action={action} className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Receipt className="h-4 w-4" />
        <h3 className="text-sm font-medium">{t("addTitle")}</h3>
      </div>
      {state.error && (
        <p className="text-sm text-destructive">{t(state.error)}</p>
      )}
      {state.success && (
        <p className="text-sm text-green-600">{t("addSuccess")}</p>
      )}
      <div className="space-y-2">
        <Label htmlFor="description">{t("description")}</Label>
        <Input
          id="description"
          name="description"
          required
          placeholder={t("descriptionPlaceholder")}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="cost">{t("amount")}</Label>
          <Input
            id="cost"
            name="cost"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currencyCode">{t("currency")}</Label>
          <Select name="currencyCode" defaultValue="USD">
            <SelectTrigger>
              <SelectValue placeholder={t("currency")} />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="friendId">{t("splitWith")}</Label>
        <Select name="friendId" required>
          <SelectTrigger>
            <SelectValue placeholder={t("selectFriend")} />
          </SelectTrigger>
          <SelectContent>
            {friends.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.firstName} {f.lastName || ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">{t("date")}</Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={new Date().toISOString().split("T")[0]}
        />
      </div>
      <input type="hidden" name="splitEqually" value="on" />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("addSubmitting") : t("addSubmit")}
      </Button>
    </form>
  );
}
