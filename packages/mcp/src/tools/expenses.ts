import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { OpenSplitClient } from '@opensplit/sdk';
import { formatError } from '../errors.js';

const expenseShareSchema = z.object({
  userId: z.string().describe('The user ID'),
  paidShare: z
    .number()
    .min(0)
    .describe('How much this user paid toward the expense'),
  owedShare: z
    .number()
    .min(0)
    .describe('How much this user owes for the expense'),
});

export function registerExpenseTools(
  server: McpServer,
  client: OpenSplitClient,
) {
  server.registerTool(
    'create_expense',
    {
      title: 'Create Expense',
      description:
        'Create a new expense. Use splitEqually: true to split evenly among all group members, or provide explicit shares with paidShare and owedShare for each user. The sum of all paidShare values and the sum of all owedShare values must each equal the total cost.',
      inputSchema: z.object({
        description: z
          .string()
          .describe("Brief description of the expense (e.g. 'Dinner at Luigi\\'s')"),
        cost: z.number().positive().describe('Total cost of the expense'),
        currencyCode: z
          .string()
          .describe("Three-letter currency code (e.g. 'USD', 'EUR', 'GBP')"),
        groupId: z
          .string()
          .optional()
          .describe('Group ID to associate the expense with'),
        details: z
          .string()
          .optional()
          .describe('Additional details or notes about the expense'),
        categoryId: z
          .number()
          .optional()
          .describe(
            'Category ID for the expense. Use list_categories to see available categories',
          ),
        date: z
          .string()
          .optional()
          .describe(
            'Date of the expense in ISO 8601 format (YYYY-MM-DD). Defaults to today',
          ),
        repeatInterval: z
          .enum(['NEVER', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY', 'YEARLY'])
          .optional()
          .describe('How often the expense repeats'),
        payment: z
          .boolean()
          .optional()
          .describe(
            'If true, this records a payment/settlement between users, not an expense',
          ),
        splitEqually: z
          .boolean()
          .optional()
          .describe(
            'If true, split the expense equally among all group members',
          ),
        shares: z
          .array(expenseShareSchema)
          .optional()
          .describe(
            'Custom split: specify how much each user paid and owes. Required if splitEqually is not true',
          ),
      }),
    },
    async (params) => {
      try {
        const expense = await client.expenses.create(params);
        return {
          content: [{ type: 'text', text: JSON.stringify(expense, null, 2) }],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  );

  server.registerTool(
    'list_expenses',
    {
      title: 'List Expenses',
      description:
        'List expenses with optional filters. Returns expenses you are involved in. Filter by group, friend, date range, or use pagination.',
      inputSchema: z.object({
        group_id: z
          .string()
          .optional()
          .describe('Filter expenses by group ID'),
        friend_id: z
          .string()
          .optional()
          .describe('Filter expenses involving a specific friend'),
        dated_after: z
          .string()
          .optional()
          .describe('Only expenses on or after this date (ISO 8601)'),
        dated_before: z
          .string()
          .optional()
          .describe('Only expenses on or before this date (ISO 8601)'),
        updated_after: z
          .string()
          .optional()
          .describe('Only expenses updated after this timestamp (ISO 8601)'),
        updated_before: z
          .string()
          .optional()
          .describe('Only expenses updated before this timestamp (ISO 8601)'),
        limit: z
          .number()
          .optional()
          .describe(
            'Maximum number of expenses to return (default: 20, max: 100)',
          ),
        offset: z
          .number()
          .optional()
          .describe('Number of expenses to skip for pagination'),
      }),
    },
    async (params) => {
      try {
        const expenses = await client.expenses.list(params);
        return {
          content: [
            { type: 'text', text: JSON.stringify(expenses, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  );

  server.registerTool(
    'get_expense',
    {
      title: 'Get Expense',
      description:
        'Get detailed information about a specific expense, including all shares (who paid and who owes how much) and comments.',
      inputSchema: z.object({
        id: z.string().describe('The expense ID'),
      }),
    },
    async ({ id }) => {
      try {
        const expense = await client.expenses.get(id);
        return {
          content: [{ type: 'text', text: JSON.stringify(expense, null, 2) }],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  );

  server.registerTool(
    'update_expense',
    {
      title: 'Update Expense',
      description:
        'Update an existing expense. Only provide the fields you want to change. To change how the expense is split, provide new shares.',
      inputSchema: z.object({
        id: z.string().describe('The expense ID to update'),
        description: z.string().optional().describe('New description'),
        cost: z.number().positive().optional().describe('New total cost'),
        currencyCode: z
          .string()
          .optional()
          .describe('New currency code'),
        groupId: z.string().optional().describe('New group ID'),
        details: z.string().optional().describe('New details'),
        categoryId: z.number().optional().describe('New category ID'),
        date: z
          .string()
          .optional()
          .describe('New date (ISO 8601)'),
        repeatInterval: z
          .enum(['NEVER', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY', 'YEARLY'])
          .optional()
          .describe('New repeat interval'),
        payment: z.boolean().optional().describe('Whether this is a payment'),
        shares: z
          .array(expenseShareSchema)
          .optional()
          .describe('New shares for the expense'),
      }),
    },
    async ({ id, ...data }) => {
      try {
        const expense = await client.expenses.update(id, data);
        return {
          content: [{ type: 'text', text: JSON.stringify(expense, null, 2) }],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  );

  server.registerTool(
    'delete_expense',
    {
      title: 'Delete Expense',
      description:
        'Soft-delete an expense. The expense can be restored later using the API. Use this when an expense was created by mistake or is no longer valid.',
      inputSchema: z.object({
        id: z.string().describe('The expense ID to delete'),
      }),
    },
    async ({ id }) => {
      try {
        await client.expenses.delete(id);
        return {
          content: [
            { type: 'text', text: `Expense ${id} deleted successfully.` },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  );
}
