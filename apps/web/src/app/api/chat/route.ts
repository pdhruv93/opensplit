import { cookies } from "next/headers";
import { createChatHandler } from "@opensplit/ai";

const MCP_URL =
  (process.env.OPENSPLIT_MCP_URL || "http://localhost:3001") + "/mcp";

export async function POST(request: Request) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    return new Response("OPENAI_API_KEY not configured", { status: 500 });
  }

  const cookieStore = await cookies();
  const mcpApiKey = cookieStore.get("opensplit_api_key")?.value;
  if (!mcpApiKey) {
    return new Response("Not authenticated", { status: 401 });
  }

  const handler = createChatHandler({
    mcpUrl: MCP_URL,
    mcpApiKey,
    openaiApiKey,
  });

  return handler(request);
}
