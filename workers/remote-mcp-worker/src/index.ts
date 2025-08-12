import { Hono } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPTransport } from "@hono/mcp";

export interface Env {
  // TODO: add any required bindings/secrets here when needed
}

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => {
  return c.json({
    name: "remote-mcp-worker",
    status: "ok",
    endpoints: ["ALL /mcp"],
  });
});

function createMcpServer() {
  const server = new McpServer({
    name: "remote-mcp-worker",
    version: "0.0.1",
  });

  // TODO: Register tools/resources/prompts as needed
  // server.registerTool(...)
  // server.registerResource(...)

  return server;
}

app.all("/mcp", async (c) => {
  const transport = new StreamableHTTPTransport();
  const server = createMcpServer();
  await server.connect(transport);
  return transport.handleRequest(c);
});

export default app;