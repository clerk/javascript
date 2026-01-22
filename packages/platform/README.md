<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_platform" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
</p>

# @clerk/platform

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

</div>

---

A lightweight, zero-dependency JavaScript/TypeScript client for the [Clerk Platform API](https://clerk.com/docs).

## Overview

The `@clerk/platform` package provides a fully typed API client for managing Clerk workspaces programmatically. Use it to:

- Create and manage applications
- Configure domains for production instances
- Transfer applications between workspaces

## Installation

```bash
npm install @clerk/platform
# or
pnpm add @clerk/platform
# or
yarn add @clerk/platform
```

## Quick Start

```typescript
import { createPlatformClient } from '@clerk/platform';

const platform = createPlatformClient({
  accessToken: process.env.CLERK_PLATFORM_API_TOKEN,
});

// List all applications
const applications = await platform.applications.list();

// Create a new application
const app = await platform.applications.create({
  name: 'My New App',
  environment_types: ['development', 'production'],
});

// Get application details
const details = await platform.applications.get(app.application_id);
```

## Features

- **Zero dependencies** - Uses native `fetch` API
- **Tree-shakable** - Import only what you need
- **Full TypeScript support** - Complete type definitions for all API responses
- **Comprehensive error handling** - Typed error classes for all API error types
- **Request cancellation** - Support for `AbortSignal` for request cancellation
- **Timeout support** - Configurable request timeouts

## API Reference

### Creating a Client

```typescript
import { createPlatformClient } from '@clerk/platform';

const platform = createPlatformClient({
  // Required: Your Platform API access token
  accessToken: 'your_token',

  // Optional: Custom base URL (defaults to https://api.clerk.com/v1)
  baseUrl: 'https://api.clerk.com/v1',

  // Optional: Custom fetch implementation
  fetch: customFetch,

  // Optional: Request timeout in milliseconds (default: 30000)
  timeout: 30000,
});
```

### Applications API

```typescript
// List all applications
const apps = await platform.applications.list();

// List with secret keys included
const appsWithKeys = await platform.applications.list({ includeSecretKeys: true });

// Create an application
const app = await platform.applications.create({
  name: 'My App',
  domain: 'myapp.com',
  environment_types: ['development', 'production'],
  template: 'b2b-saas', // Optional: 'b2b-saas', 'b2c-saas', 'waitlist'
});

// Get an application
const app = await platform.applications.get('app_123');

// Update an application
const updated = await platform.applications.update('app_123', {
  name: 'New Name',
});

// Delete an application
const result = await platform.applications.delete('app_123');
```

### Domains API

```typescript
// List domains for an application
const { data, total_count } = await platform.domains.list('app_123');

// Create a domain
const domain = await platform.domains.create('app_123', {
  name: 'auth.example.com',
  proxy_path: '/__clerk',
});

// Get a domain (by ID or name)
const domain = await platform.domains.get('app_123', 'dmn_456');
const domain = await platform.domains.get('app_123', 'auth.example.com');

// Update the production domain
const updated = await platform.domains.update('app_123', {
  name: 'newauth.example.com',
});

// Delete a domain
const result = await platform.domains.delete('app_123', 'dmn_456');

// Get domain status (DNS, SSL, etc.)
const status = await platform.domains.getStatus('app_123', 'dmn_456');

// Trigger a DNS check
const check = await platform.domains.triggerDNSCheck('app_123', 'dmn_456');
```

### Application Transfers API

```typescript
// List transfers
const { data, total_count } = await platform.transfers.list();

// Filter by status
const pending = await platform.transfers.list({ status: 'pending' });
const active = await platform.transfers.list({
  status: ['pending', 'completed'],
  limit: 50,
});

// Create a transfer
const transfer = await platform.transfers.create('app_123');
console.log(transfer.code); // Share this with the recipient

// Get a transfer
const transfer = await platform.transfers.get('app_123', 'appxfr_456');

// Cancel a transfer
const canceled = await platform.transfers.cancel('app_123', 'appxfr_456');
```

## Tree Shaking

For optimal bundle size, you can import specific modules:

```typescript
import { PlatformHttpClient } from '@clerk/platform';
import { createApplicationsAPI } from '@clerk/platform/applications';
import { createDomainsAPI } from '@clerk/platform/domains';
import { createApplicationTransfersAPI } from '@clerk/platform/transfers';

const client = new PlatformHttpClient({ accessToken: 'your_token' });
const applications = createApplicationsAPI(client);

const apps = await applications.list();
```

## Error Handling

The client throws typed errors for different API responses:

```typescript
import {
  ClerkPlatformError,
  BadRequestError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  TimeoutError,
} from '@clerk/platform';

try {
  await platform.applications.get('nonexistent');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('Application not found');
    console.log('Errors:', error.errors);
    console.log('Trace ID:', error.clerkTraceId);
  } else if (error instanceof AuthenticationError) {
    console.log('Invalid token');
  } else if (error instanceof TimeoutError) {
    console.log(`Request timed out after ${error.timeout}ms`);
  }
}
```

## Request Options

All API methods accept optional request options:

```typescript
// With abort signal
const controller = new AbortController();
const apps = await platform.applications.list({ signal: controller.signal });

// Cancel the request
controller.abort();

// With custom timeout
const apps = await platform.applications.list({ timeout: 5000 });
```

## TypeScript

All types are exported from the main package:

```typescript
import type {
  ApplicationResponse,
  ApplicationInstance,
  DomainResponse,
  ApplicationTransferResponse,
  PlatformClientOptions,
  // ... and more
} from '@clerk/platform';
```

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- Create a [GitHub Discussion](https://github.com/clerk/javascript/discussions)
- Contact options listed on [our Support page](https://clerk.com/support)

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/platform/LICENSE) for more information.
