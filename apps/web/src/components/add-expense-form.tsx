"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import {
  createExpenseAction,
  type ExpenseState,
} from "@/lib/actions/expenses";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Badge } from "@/components/shadcn/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import type { Friend, Currency, ParentCategory } from "@opensplit/sdk";
import { Plus, X, Sparkles } from "lucide-react";

type Participant = {
  userId: string;
  label: string;
  isSelf: boolean;
};

export function AddExpenseForm({
  currentUser,
  friends,
  currencies,
  categories,
}: {
  currentUser: { id: string; firstName: string; lastName: string | null };
  friends: Friend[];
  currencies: Currency[];
  categories: ParentCategory[];
}) {
  const t = useTranslations("expenses");

  const [participants, setParticipants] = useState<Participant[]>([
    { userId: currentUser.id, label: t("you"), isSelf: true },
  ]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const addParticipant = (friendId: string) => {
    const friend = friends.find((f) => f.id === friendId);
    if (!friend) return;
    setParticipants((prev) => [
      ...prev,
      {
        userId: friend.id,
        label: `${friend.firstName} ${friend.lastName || ""}`.trim(),
        isSelf: false,
      },
    ]);
    setPopoverOpen(false);
  };

  const removeParticipant = (userId: string) => {
    setParticipants((prev) => prev.filter((p) => p.userId !== userId));
  };

  const participantIds = new Set(participants.map((p) => p.userId));
  const availableFriends = friends.filter((f) => !participantIds.has(f.id));

  const wrappedAction = async (
    prev: ExpenseState,
    formData: FormData
  ): Promise<ExpenseState> => {
    for (const p of participants) {
      formData.append("shareUserId", p.userId);
    }
    return createExpenseAction(prev, formData);
  };

  const [state, action, pending] = useActionState<ExpenseState, FormData>(
    wrappedAction,
    {}
  );

  return (
    <form action={action} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t("addTitle")}</h2>
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("opensplit:open-chat"))
          }
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Sparkles className="size-3" />
          {t("createWithAI")}
        </button>
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
        <Label htmlFor="categoryId">{t("category")}</Label>
        <Select name="categoryId">
          <SelectTrigger>
            <SelectValue placeholder={t("selectCategory")} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((parent) => (
              <SelectGroup key={parent.id}>
                <SelectLabel>{parent.name}</SelectLabel>
                {parent.subcategories.map((sub) => (
                  <SelectItem key={sub.id} value={String(sub.id)}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectGroup>
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

      <div className="space-y-2">
        <Label>{t("participants")}</Label>
        <div className="flex flex-wrap gap-2">
          {participants.map((p) => (
            <Badge key={p.userId} variant="secondary" className="gap-1 pr-1">
              {p.label}
              {!p.isSelf && (
                <button
                  type="button"
                  onClick={() => removeParticipant(p.userId)}
                  className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Badge
                variant="outline"
                className={
                  availableFriends.length > 0
                    ? "cursor-pointer gap-1 hover:bg-accent"
                    : "gap-1 opacity-50 pointer-events-none"
                }
              >
                <Plus className="h-3 w-3" />
                {t("add")}
              </Badge>
            </PopoverTrigger>
            {availableFriends.length > 0 && (
              <PopoverContent className="w-48 p-1" align="start">
                <div className="max-h-48 overflow-y-auto">
                  {availableFriends.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
                      onClick={() => addParticipant(f.id)}
                    >
                      {f.firstName} {f.lastName || ""}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            )}
          </Popover>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("addSubmitting") : t("addSubmit")}
      </Button>
    </form>
  );
}
