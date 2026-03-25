#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { loadConfig } from './config.js';
import { GoogleAdsServiceClient } from './googleAdsClient.js';
import { Logger } from './logger.js';
import { buildTools } from './tools.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = new Logger(config.GOOGLE_ADS_MCP_LOG_LEVEL);
  const client = new GoogleAdsServiceClient(config, logger);

  const server = new McpServer({
    name: 'google-ads-mcp',
    version: '0.1.0'
  });

  for (const tool of buildTools(client)) {
    server.tool(tool.name, tool.description, tool.inputSchema, async (args) => {
      try {
        const result = await tool.handler(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error(`Tool ${tool.name} failed`, error);
        const message = error instanceof z.ZodError
          ? `Invalid input: ${error.issues.map((issue) => `${issue.path.join('.') || 'root'} ${issue.message}`).join('; ')}`
          : error instanceof Error
            ? error.message
            : 'Unknown error';
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: message
            }
          ]
        };
      }
    });
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('google-ads-mcp started');
}

main().catch((error) => {
  console.error('[google-ads-mcp] fatal', error);
  process.exit(1);
});
