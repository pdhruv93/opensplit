"use server";

import { cookies } from "next/headers";

const COOKIE_NAME = "opensplit_api_key";
const MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function setApiKey(apiKey: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, apiKey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getApiKey(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function clearApiKey() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
