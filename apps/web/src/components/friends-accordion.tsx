"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Friend } from "@opensplit/sdk";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn/accordion";
import { Avatar, AvatarFallback } from "@/components/shadcn/avatar";
import { FriendExpenses } from "./friend-expenses";

export function FriendsAccordion({
  friends,
  currentUserId,
}: {
  friends: Friend[];
  currentUserId: string;
}) {
  const t = useTranslations("home");
  const [expanded, setExpanded] = useState<string[]>([]);

  return (
    <Accordion
      type="multiple"
      value={expanded}
      onValueChange={setExpanded}
    >
      {friends.map((friend) => {
        const initials =
          (friend.firstName[0] || "") + (friend.lastName?.[0] || "");
        const isExpanded = expanded.includes(friend.id);
        const positiveBalances = friend.balance.filter((b) => parseFloat(b.amount) > 0);
        const negativeBalances = friend.balance.filter((b) => parseFloat(b.amount) < 0);

        return (
          <AccordionItem key={friend.id} value={friend.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-1 items-center justify-between pr-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {initials.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium">
                      {friend.firstName} {friend.lastName || ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {friend.email}
                    </p>
                  </div>
                </div>
                {(positiveBalances.length > 0 || negativeBalances.length > 0) && (
                  <div className="text-right">
                    {positiveBalances.map((b) => (
                      <p key={b.currencyCode} className="text-xs font-medium text-green-600">
                        {t("owesYou")} {parseFloat(b.amount).toFixed(2)} {b.currencyCode}
                      </p>
                    ))}
                    {negativeBalances.map((b) => (
                      <p key={b.currencyCode} className="text-xs font-medium text-red-600">
                        {t("youOwe")} {Math.abs(parseFloat(b.amount)).toFixed(2)} {b.currencyCode}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {isExpanded && (
                <FriendExpenses
                  friendId={friend.id}
                  currentUserId={currentUserId}
                />
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
