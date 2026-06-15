import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { OpenSplitClient } from '@opensplit/sdk';
import { registerExpenseTools } from './expenses.js';
import { registerGroupTools } from './groups.js';
import { registerFriendTools } from './friends.js';
import { registerReferenceTools } from './reference.js';

export function registerAllTools(
  server: McpServer,
  client: OpenSplitClient,
) {
  registerExpenseTools(server, client);
  registerGroupTools(server, client);
  registerFriendTools(server, client);
  registerReferenceTools(server, client);
}
