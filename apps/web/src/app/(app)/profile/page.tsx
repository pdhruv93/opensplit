import { getTranslations } from "next-intl/server";
import { getClient } from "@/lib/api";
import { ProfileForm } from "@/components/profile-form";
import { RotateKeyButton } from "@/components/rotate-key-button";
import { Separator } from "@/components/shadcn/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";

export default async function ProfilePage() {
  const t = await getTranslations("profile");
  const client = await getClient();
  const user = await client.users.me();

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-2xl font-semibold">{t("title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("personalInfo")}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            firstName={user.firstName}
            lastName={user.lastName}
          />
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <Card>
        <CardHeader>
          <CardTitle>{t("apiKeyTitle")}</CardTitle>
          <CardDescription>{t("apiKeyDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <RotateKeyButton />
        </CardContent>
      </Card>
    </div>
  );
}
