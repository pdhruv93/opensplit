import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { OpenSplitClient } from '@opensplit/sdk';
import { formatError } from '../errors.js';

export function registerGroupTools(
  server: McpServer,
  client: OpenSplitClient,
) {
  server.registerTool(
    'list_groups',
    {
      title: 'List Groups',
      description:
        'List all groups you are a member of. Each group includes its members. Use get_group for detailed balance information.',
    },
    async () => {
      try {
        const groups = await client.groups.list();
        return {
          content: [{ type: 'text', text: JSON.stringify(groups, null, 2) }],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  );

  server.registerTool(
    'get_group',
    {
      title: 'Get Group',
      description:
        'Get detailed information about a specific group, including all members and the current debts between members. The debts array shows how much each member owes or is owed within this group.',
      inputSchema: z.object({
        id: z.string().describe('The group ID'),
      }),
    },
    async ({ id }) => {
      try {
        const group = await client.groups.get(id);
        return {
          content: [{ type: 'text', text: JSON.stringify(group, null, 2) }],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  );

  server.registerTool(
    'create_group',
    {
      title: 'Create Group',
      description:
        'Create a new group for splitting expenses. You can optionally add members by their user IDs at creation time.',
      inputSchema: z.object({
        name: z
          .string()
          .describe("Name of the group (e.g. 'Weekend Trip', 'Apartment')"),
        groupType: z
          .enum(['HOME', 'TRIP', 'COUPLE', 'OTHER'])
          .optional()
          .describe('Type of group. Defaults to OTHER'),
        simplifyByDefault: z
          .boolean()
          .optional()
          .describe('If true, simplify debts within this group by default'),
        members: z
          .array(z.string())
          .optional()
          .describe('User IDs of people to add as members'),
      }),
    },
    async (params) => {
      try {
        const group = await client.groups.create(params);
        return {
          content: [{ type: 'text', text: JSON.stringify(group, null, 2) }],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  );

  server.registerTool(
    'add_group_member',
    {
      title: 'Add Group Member',
      description:
        'Add a user to an existing group. The user must be a friend first. Use add_friend if they are not already your friend.',
      inputSchema: z.object({
        groupId: z.string().describe('The group ID'),
        userId: z.string().describe('The user ID to add'),
      }),
    },
    async ({ groupId, userId }) => {
      try {
        const member = await client.groups.addMember(groupId, { userId });
        return {
          content: [{ type: 'text', text: JSON.stringify(member, null, 2) }],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  );
}
