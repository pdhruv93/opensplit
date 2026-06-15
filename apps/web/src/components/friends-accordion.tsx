"use client";

import { useState } from "react";
import type { Friend } from "@opensplit/sdk";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn/accordion";
import { Avatar, AvatarFallback } from "@/components/shadcn/avatar";
import { FriendExpenses } from "./friend-expenses";

export function FriendsAccordion({ friends }: { friends: Friend[] }) {
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

        return (
          <AccordionItem key={friend.id} value={friend.id}>
            <AccordionTrigger className="hover:no-underline">
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
            </AccordionTrigger>
            <AccordionContent>
              {isExpanded && <FriendExpenses friendId={friend.id} />}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
