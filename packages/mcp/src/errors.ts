import { OpenSplitError } from '@opensplit/sdk';

export function formatError(error: unknown): {
  content: Array<{ type: 'text'; text: string }>;
  isError: true;
} {
  if (error instanceof OpenSplitError) {
    return {
      content: [
        {
          type: 'text',
          text: `OpenSplit API error (${error.statusCode}): ${error.message}`,
        },
      ],
      isError: true,
    };
  }

  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: 'text', text: `Unexpected error: ${message}` }],
    isError: true,
  };
}
