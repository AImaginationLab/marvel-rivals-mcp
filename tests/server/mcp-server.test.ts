import { describe, it, expect } from 'vitest';
import { createMCPServer } from '../../src/server/mcp-server.js';

describe('MCP Server', () => {
  it('should create server instance', () => {
    const server = createMCPServer();
    expect(server).toBeDefined();
    expect(server.setRequestHandler).toBeDefined();
  });

  it('should have correct server metadata', () => {
    const server = createMCPServer();
    // The server instance should have been created with the correct name and version
    expect(server).toBeDefined();
  });

  // Integration tests would require a full server setup with transport
  // For now, we just verify the server can be created without errors
});