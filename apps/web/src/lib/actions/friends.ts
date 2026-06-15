"use server";

import { revalidatePath } from "next/cache";
import { getClient } from "../api";

export type FriendState = {
  error?: string;
  success?: boolean;
};

export async function addFriendAction(
  _prev: FriendState,
  formData: FormData
): Promise<FriendState> {
  const email = formData.get("email") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = (formData.get("lastName") as string) || undefined;

  if (!email) {
    return { error: "errorEmail" };
  }

  try {
    const client = await getClient();
    await client.friends.create({ email, firstName, lastName });
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "errorFailed" };
  }
}

export async function removeFriendAction(friendId: string) {
  const client = await getClient();
  await client.friends.delete(friendId);
  revalidatePath("/");
}
