import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  type UIMessage,
} from 'ai';
import { createMCPClient } from '@ai-sdk/mcp';
import { createOpenAI } from '@ai-sdk/openai';
import { getSystemPrompt } from './prompt.js';

export interface ChatHandlerOptions {
  mcpUrl: string;
  mcpApiKey: string;
  openaiApiKey: string;
  model?: string;
}

export function createChatHandler(options: ChatHandlerOptions) {
  const {
    mcpUrl,
    mcpApiKey,
    openaiApiKey,
    model = 'gpt-4o-mini',
  } = options;

  return async (request: Request): Promise<Response> => {
    const body = (await request.json()) as { messages: UIMessage[] };

    const mcpClient = await createMCPClient({
      transport: {
        type: 'http',
        url: mcpUrl,
        headers: { Authorization: `Bearer ${mcpApiKey}` },
      },
    });

    const openai = createOpenAI({ apiKey: openaiApiKey });

    const result = streamText({
      model: openai(model),
      system: getSystemPrompt(new Date().toISOString().split('T')[0]),
      messages: await convertToModelMessages(body.messages),
      tools: await mcpClient.tools(),
      stopWhen: stepCountIs(10),
      onError: ({ error }) => {
        console.error('[opensplit-ai] streamText error:', error);
      },
      onFinish: async () => {
        await mcpClient.close();
      },
    });

    return result.toUIMessageStreamResponse();
  };
}
