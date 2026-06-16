"use server";

import { revalidatePath } from "next/cache";
import { getClient } from "../api";
import { setApiKey } from "../auth";

export type ProfileState = {
  error?: string;
  success?: boolean;
};

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const firstName = formData.get("firstName") as string;
  const lastName = (formData.get("lastName") as string) || undefined;

  if (!firstName) {
    return { error: "errorFirstName" };
  }

  try {
    const client = await getClient();
    const me = await client.users.me();
    await client.users.update(me.id, { firstName, lastName });
    revalidatePath("/profile");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "errorFailed" };
  }
}

export type RotateKeyState = {
  error?: string;
  newApiKey?: string;
};

export async function rotateKeyAction(): Promise<RotateKeyState> {
  try {
    const client = await getClient();
    const result = await client.auth.rotateKey();
    await setApiKey(result.apiKey);
    return { newApiKey: result.apiKey };
  } catch {
    return { error: "errorRotateFailed" };
  }
}
