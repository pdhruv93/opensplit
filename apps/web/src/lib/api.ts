import { OpenSplitClient } from "@opensplit/sdk";
import { getApiKey } from "./auth";

const API_URL = process.env.OPENSPLIT_API_URL || "http://localhost:3000";

export async function getClient(): Promise<OpenSplitClient> {
  const apiKey = await getApiKey();
  return new OpenSplitClient({ baseUrl: API_URL, apiKey });
}

export function getUnauthenticatedClient(): OpenSplitClient {
  return new OpenSplitClient({ baseUrl: API_URL });
}
