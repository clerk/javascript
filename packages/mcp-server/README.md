<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_mcp_server" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
  <h1 align="center">@clerk/mcp-server</h1>
</p>

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_mcp_server)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/mcp-server/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get Help](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_mcp_server)

</div>

## Overview

Connect to Clerk's remote MCP (Model Context Protocol) server from any MCP-compatible client like Claude Desktop. This package provides a thin wrapper that proxies stdio communication to Clerk's hosted MCP server at `https://mcp.clerk.com`.

## Quick Start

Run directly with npx:

```bash
npx @clerk/mcp-server
```

## Usage with MCP configuration

Add the following to your MCP configuration file:

```json
{
  "mcpServers": {
    "clerk": {
      "command": "npx",
      "args": ["-y", "@clerk/mcp-server"]
    }
  }
}
```

## Prerequisites

- Node.js 18 or higher
- An MCP-compatible client (e.g., Claude Desktop, Cursor, etc.)

## How It Works

This package acts as a bridge between stdio-based MCP clients and Clerk's remote MCP server:

1. Your MCP client (e.g., Claude Desktop) communicates with this package via stdio
2. This package forwards requests to `https://mcp.clerk.com/mcp` via HTTP
3. Responses are proxied back to your client

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- On [our support page](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_mcp_server)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md) and [code of conduct](https://github.com/clerk/javascript/blob/main/docs/CODE_OF_CONDUCT.md).

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/mcp-server/LICENSE) for more information.
