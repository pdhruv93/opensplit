import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { OpenSplitClient } from '@opensplit/sdk';
import { formatError } from '../errors.js';

export function registerReferenceTools(
  server: McpServer,
  client: OpenSplitClient,
) {
  server.registerTool(
    'get_current_user',
    {
      title: 'Get Current User',
      description:
        'Get the profile of the currently authenticated user, including their ID, email, name, default currency, and locale. Useful for getting your own user ID for expense shares.',
    },
    async () => {
      try {
        const user = await client.users.me();
        return {
          content: [{ type: 'text', text: JSON.stringify(user, null, 2) }],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  );

  server.registerTool(
    'list_currencies',
    {
      title: 'List Currencies',
      description:
        'List all supported currencies with their codes and display units. Use the currency code when creating expenses.',
    },
    async () => {
      try {
        const currencies = await client.currencies.list();
        return {
          content: [
            { type: 'text', text: JSON.stringify(currencies, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  );

  server.registerTool(
    'list_categories',
    {
      title: 'List Categories',
      description:
        'List all expense categories organized by parent category (e.g. Food & Drink, Transportation). Each parent has subcategories. Use the category ID when creating expenses.',
    },
    async () => {
      try {
        const categories = await client.categories.list();
        return {
          content: [
            { type: 'text', text: JSON.stringify(categories, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    },
  );
}
