export interface Env {
  // TODO: add any required bindings/secrets here when needed
}

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' } as const;

function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data, null, 2), { headers: JSON_HEADERS, ...init });
}

// Import the official MCP TypeScript SDK. The concrete wiring will be added in a follow-up edit.
// NOTE: Use ESM subpath imports with explicit .js extensions (per SDK exports map).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === "/" && request.method === "GET") {
      return json({
        name: "remote-mcp-worker",
        status: "ok",
        endpoints: ["GET /mcp/sse", "POST /mcp/messages"],
      });
    }

    if (pathname === "/mcp/sse") {
      if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405 });

      // TODO: Replace stub SSE with MCP SSEServerTransport from @modelcontextprotocol/sdk
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();

      // Send a single stub event and keep alive briefly; in real implementation, transport will manage lifecycle
      await writer.write(
        encoder.encode(
          `event: message\ndata: ${JSON.stringify({ type: "stub", message: "MCP SSE not yet implemented" })}\n\n`
        )
      );

      ctx.waitUntil(
        (async () => {
          await new Promise((r) => setTimeout(r, 30_000));
          try {
            writer.close();
          } catch (err) {
            // ignore
          }
        })()
      );

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
          "X-MCP-Stub": "true",
        },
      });
    }

    if (pathname === "/mcp/messages") {
      if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

      // TODO: Forward incoming MCP messages to the SSEServerTransport instance
      return json({ ok: false, error: "MCP message ingestion not yet implemented" }, { status: 501 });
    }

    return new Response("Not Found", { status: 404 });
  },
};