import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { OpenSplitClient } from '@opensplit/sdk';
import { formatError } from '../errors.js';

export function registerFriendTools(
  server: McpServer,
  client: OpenSplitClient,
) {
  server.registerTool(
    'list_friends',
    {
      title: 'List Friends',
      description:
        'List all your friends with their current balances across all shared expenses. A positive balance means they owe you; negative means you owe them.',
    },
    async () => {
      try {
        const friends = await client.friends.list();
        return {
          content: [{ type: 'text', text: JSON.stringify(friends, null, 2) }],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  );

  server.registerTool(
    'get_friend',
    {
      title: 'Get Friend',
      description:
        'Get detailed information about a specific friend, including their balance with you across all currencies.',
      inputSchema: z.object({
        id: z.string().describe("The friend's user ID"),
      }),
    },
    async ({ id }) => {
      try {
        const friend = await client.friends.get(id);
        return {
          content: [{ type: 'text', text: JSON.stringify(friend, null, 2) }],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  );

  server.registerTool(
    'add_friend',
    {
      title: 'Add Friend',
      description:
        'Add a friend by their user ID, or invite someone by email. If inviting by email, you can provide their first and last name. A person must be added as a friend before they can be added to groups or included in expenses.',
      inputSchema: z.object({
        userId: z
          .string()
          .optional()
          .describe('User ID of an existing user to add as friend'),
        email: z
          .string()
          .optional()
          .describe('Email address to invite as a friend'),
        firstName: z
          .string()
          .optional()
          .describe('First name (used when inviting by email)'),
        lastName: z
          .string()
          .optional()
          .describe('Last name (used when inviting by email)'),
      }),
    },
    async (params) => {
      try {
        const friend = await client.friends.create(params);
        return {
          content: [{ type: 'text', text: JSON.stringify(friend, null, 2) }],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  );
}
