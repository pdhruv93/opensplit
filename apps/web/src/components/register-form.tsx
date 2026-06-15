"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { registerAction, type AuthState } from "@/lib/actions/auth";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Copy, Check } from "lucide-react";

export function RegisterForm({ brandName }: { brandName: string }) {
  const t = useTranslations("register");
  const tc = useTranslations("common");
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [state, action, pending] = useActionState<AuthState, FormData>(
    registerAction,
    {}
  );

  const copyToClipboard = async () => {
    if (state.apiKey) {
      await navigator.clipboard.writeText(state.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (state.apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("successTitle")}</CardTitle>
          <CardDescription>{t("successDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("secretKeyLabel")}</Label>
            <div className="flex gap-2">
              <Input value={state.apiKey} readOnly className="font-mono text-xs" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("secretKeySaveHint")}
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => router.push("/")}>
            {t("secretKeySaved")}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{brandName}</CardTitle>
        <CardDescription>{t("title")}</CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-4">
          {state.error && (
            <p className="text-sm text-destructive">{t(state.error)}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="firstName">{tc("firstName")}</Label>
            <Input id="firstName" name="firstName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{tc("lastName")}</Label>
            <Input id="lastName" name="lastName" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{tc("email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{tc("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">
              {t("passwordHint")}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t("submitting") : t("submit")}
          </Button>
          <p className="text-sm text-muted-foreground">
            {t("hasAccount")}{" "}
            <Link href="/login" className="underline text-foreground">
              {t("signIn")}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
