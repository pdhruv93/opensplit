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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import type { Friend, Currency, ParentCategory } from "@opensplit/sdk";
import { Plus, X } from "lucide-react";

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
  const [selectedFriend, setSelectedFriend] = useState("");
  const [selectKey, setSelectKey] = useState(0);

  const addParticipant = () => {
    if (!selectedFriend) return;
    const friend = friends.find((f) => f.id === selectedFriend);
    if (!friend) return;
    setParticipants((prev) => [
      ...prev,
      {
        userId: friend.id,
        label: `${friend.firstName} ${friend.lastName || ""}`.trim(),
        isSelf: false,
      },
    ]);
    setSelectedFriend("");
    setSelectKey((k) => k + 1);
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
      <h2 className="mb-4 text-xl font-semibold">{t("addTitle")}</h2>
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

      <div className="space-y-3">
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
        </div>
        {availableFriends.length > 0 && (
          <div className="flex gap-2">
            <Select key={selectKey} value={selectedFriend} onValueChange={setSelectedFriend}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t("selectFriend")} />
              </SelectTrigger>
              <SelectContent>
                {availableFriends.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.firstName} {f.lastName || ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={addParticipant}
              disabled={!selectedFriend}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("addSubmitting") : t("addSubmit")}
      </Button>
    </form>
  );
}
