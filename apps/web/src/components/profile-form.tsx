"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  updateProfileAction,
  type ProfileState,
} from "@/lib/actions/profile";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";

export function ProfileForm({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string | null;
}) {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const [state, action, pending] = useActionState<ProfileState, FormData>(
    updateProfileAction,
    {}
  );

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p className="text-sm text-destructive">{t(state.error)}</p>
      )}
      {state.success && (
        <p className="text-sm text-green-600">{t("updateSuccess")}</p>
      )}
      <div className="space-y-2">
        <Label htmlFor="firstName">{tc("firstName")}</Label>
        <Input
          id="firstName"
          name="firstName"
          defaultValue={firstName}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">{tc("lastName")}</Label>
        <Input
          id="lastName"
          name="lastName"
          defaultValue={lastName || ""}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? t("saving") : t("saveChanges")}
      </Button>
    </form>
  );
}
