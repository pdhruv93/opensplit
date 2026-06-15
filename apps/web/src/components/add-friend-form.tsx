"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { addFriendAction, type FriendState } from "@/lib/actions/friends";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { UserPlus } from "lucide-react";

export function AddFriendForm() {
  const t = useTranslations("friends");
  const tc = useTranslations("common");
  const [state, action, pending] = useActionState<FriendState, FormData>(
    addFriendAction,
    {}
  );

  return (
    <form action={action} className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <UserPlus className="h-4 w-4" />
        <h3 className="text-sm font-medium">{t("addTitle")}</h3>
      </div>
      {state.error && (
        <p className="text-sm text-destructive">{t(state.error)}</p>
      )}
      {state.success && (
        <p className="text-sm text-green-600">{t("addSuccess")}</p>
      )}
      <div className="space-y-2">
        <Label htmlFor="friendEmail">{tc("email")}</Label>
        <Input
          id="friendEmail"
          name="email"
          type="email"
          required
          placeholder="friend@example.com"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="friendFirstName">{tc("firstName")}</Label>
          <Input id="friendFirstName" name="firstName" placeholder={tc("optional")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="friendLastName">{tc("lastName")}</Label>
          <Input id="friendLastName" name="lastName" placeholder={tc("optional")} />
        </div>
      </div>
      <Button type="submit" size="sm" className="w-full" disabled={pending}>
        {pending ? t("addSubmitting") : t("addSubmit")}
      </Button>
    </form>
  );
}
