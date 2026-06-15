"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { logoutAction } from "@/lib/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/shadcn/avatar";
import { User, Users, LogOut } from "lucide-react";

export function UserMenu({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string | null;
}) {
  const t = useTranslations("nav");
  const router = useRouter();
  const initials =
    (firstName[0] || "") + (lastName?.[0] || "");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarFallback className="text-xs">
              {initials.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>
          {firstName} {lastName || ""}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <User className="mr-2 h-4 w-4" />
          {t("profile")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/friends")}>
          <Users className="mr-2 h-4 w-4" />
          {t("friends")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await logoutAction();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
