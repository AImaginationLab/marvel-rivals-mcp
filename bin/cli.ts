#!/usr/bin/env node
import { startMCPServer } from '../src/server/mcp-server.js';

// Start the MCP server using stdio transport
await startMCPServer();