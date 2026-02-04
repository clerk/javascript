# @examples/msw

Mock Service Worker (MSW) integration for Clerk component scenarios.

## Features

- 🎭 **Explicit Scenario Loading**: Pass scenario functions directly to components
- 🔧 **Type-Safe**: Full TypeScript support with proper type checking
- 🤖 **Automatic Session Management**: MSW automatically handles all standard Clerk API requests
- 👥 **Preset Users**: Pre-configured user personas for consistent testing
- 🏢 **Preset Environments**: Pre-configured Clerk environments (single-session, multi-session)

## How It Works

Instead of manually creating handlers for every Clerk API endpoint, this package provides:

1. **Default handlers (`clerkHandlers`)** - Automatically respond to all standard Clerk session management requests
2. **Preset users (`UserService`)** - Pre-configured user personas you can select from
3. **Preset environments (`EnvironmentService`)** - Pre-configured Clerk environment types

You just select the user and environment you want, set the state, and MSW handles the rest!

## Installation

This package is part of the monorepo and should be added as a workspace dependency:

```json
{
  "dependencies": {
    "@examples/msw": "workspace:*"
  }
}
```

### Setup Mock Service Worker

Each consuming app needs to generate the `mockServiceWorker.js` file in its public directory:

```bash
# From your app directory (e.g., apps/previews)
pnpx msw init public --save
```

This creates the service worker file that MSW uses to intercept network requests in the browser.

## Development

This package uses TypeScript source files directly (no build step required).
