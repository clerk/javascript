# @clerk/platform

Lightweight JavaScript client for the Clerk Platform API.

## Install

```bash
pnpm add @clerk/platform
```

## Usage

```ts
import { createPlatformClient } from '@clerk/platform';

const client = createPlatformClient({
  apiToken: process.env.CLERK_PLATFORM_API_TOKEN!,
});

const applications = await client.listApplications();
```

### Custom fetch

```ts
import { createPlatformClient } from '@clerk/platform';

const client = createPlatformClient({
  apiToken: process.env.CLERK_PLATFORM_API_TOKEN!,
  fetch: fetch,
});
```
