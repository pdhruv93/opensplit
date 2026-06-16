import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(__dirname, '..', '.env') });

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { OpenSplitClient } from '@opensplit/sdk';
import { registerAllTools } from './tools/index.js';

const baseUrl = process.env.OPENSPLIT_BASE_URL || 'http://localhost:3000';
const useHttp =
  process.argv.includes('--http') ||
  process.env.OPENSPLIT_MCP_TRANSPORT === 'http';

function createServer(client: OpenSplitClient): McpServer {
  const server = new McpServer({
    name: 'opensplit',
    version: '0.1.0',
  });
  registerAllTools(server, client);
  return server;
}

async function startStdio() {
  const apiKey = process.env.OPENSPLIT_API_KEY;
  if (!apiKey) {
    console.error(
      'Error: OPENSPLIT_API_KEY environment variable is required for stdio mode.\n' +
        'Set it to your OpenSplit API key to authenticate with the server.',
    );
    process.exit(1);
  }

  const client = new OpenSplitClient({ baseUrl, apiKey });
  const server = createServer(client);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`OpenSplit MCP server running via stdio (${baseUrl})`);
}

async function startHttp() {
  const { createServer: createHttpServer } = await import('node:http');
  const port = Number(process.env.OPENSPLIT_MCP_PORT) || 3001;

  const httpServer = createHttpServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://localhost:${port}`);

    if (url.pathname !== '/mcp') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found. Use /mcp endpoint.' }));
      return;
    }

    if (req.method === 'POST') {
      const apiKey = req.headers.authorization?.replace(/^Bearer\s+/i, '');
      if (!apiKey) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message:
                'Authorization header required. Pass your OpenSplit API key as: Authorization: Bearer <key>',
            },
            id: null,
          }),
        );
        return;
      }

      const client = new OpenSplitClient({ baseUrl, apiKey });
      const server = createServer(client);
      try {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
        });
        await server.connect(transport);
        await transport.handleRequest(req, res);
        res.on('close', () => {
          transport.close();
          server.close();
        });
      } catch (error) {
        console.error('Error handling MCP request:', error);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              jsonrpc: '2.0',
              error: { code: -32603, message: 'Internal server error' },
              id: null,
            }),
          );
        }
      }
      return;
    }

    if (req.method === 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Method not allowed. Use POST for stateless mode.',
          },
          id: null,
        }),
      );
      return;
    }

    if (req.method === 'DELETE') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message:
              'Method not allowed. Stateless mode does not support sessions.',
          },
          id: null,
        }),
      );
      return;
    }

    res.writeHead(405).end();
  });

  httpServer.listen(port, () => {
    console.error(
      `OpenSplit MCP server running on http://localhost:${port}/mcp (${baseUrl})`,
    );
  });

  process.on('SIGINT', () => {
    console.error('Shutting down...');
    httpServer.close();
    process.exit(0);
  });
}

const main = useHttp ? startHttp : startStdio;

main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
