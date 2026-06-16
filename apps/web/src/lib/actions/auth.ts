"use server";

import { redirect } from "next/navigation";
import { getUnauthenticatedClient } from "../api";
import { setApiKey, clearApiKey } from "../auth";

export type AuthState = {
  error?: string;
  apiKey?: string;
};

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "errorRequired" };
  }

  try {
    const client = getUnauthenticatedClient();
    const result = await client.auth.login({ email, password });
    await setApiKey(result.apiKey);
  } catch {
    return { error: "errorFailed" };
  }

  redirect("/");
}

export async function registerAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = (formData.get("lastName") as string) || undefined;

  if (!email || !password || !firstName) {
    return { error: "errorRequired" };
  }

  if (password.length < 8) {
    return { error: "errorPasswordLength" };
  }

  try {
    const client = getUnauthenticatedClient();
    const result = await client.auth.register({
      email,
      password,
      firstName,
      lastName,
    });
    await setApiKey(result.apiKey);
    return { apiKey: result.apiKey };
  } catch {
    return { error: "errorFailed" };
  }
}

export async function logoutAction() {
  await clearApiKey();
  redirect("/login");
}
