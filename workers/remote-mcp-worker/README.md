# Remote MCP Worker (Cloudflare Workers)

Minimal Cloudflare Worker scaffold intended to host a Remote MCP server over SSE using the official MCP TypeScript SDK.

## Quick start

```bash
# From repo root
cd workers/remote-mcp-worker

# Install deps
npm i

# Local dev (Miniflare)
npx wrangler dev

# Deploy to Cloudflare
npx wrangler deploy
```

## Project layout

- `wrangler.toml`: Worker configuration per Cloudflare Wrangler docs
- `src/index.ts`: Worker entry with two stub endpoints:
  - `GET /mcp/sse`: placeholder SSE stream (to be replaced by MCP SSE transport)
  - `POST /mcp/messages`: placeholder ingest endpoint
- `tsconfig.json`: Strict TS config for Workers

## MCP integration (TODO)

This scaffold imports the MCP SDK (`@modelcontextprotocol/sdk`) and exposes stub endpoints. Next steps:

- Wire `SSEServerTransport` from the SDK to `GET /mcp/sse` and `POST /mcp/messages`
- Instantiate an MCP `Server` with declared capabilities and tool/resource routers
- Add any required environment bindings (KV/DO/Queues) as needed for your tools

Refer to Cloudflare Workers documentation for SSE and routing, and the MCP SDK server SSE examples for precise transport wiring.