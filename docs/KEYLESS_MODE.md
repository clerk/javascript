# Clerk Keyless Mode: Cross-Framework Implementation

## What is Keyless Mode?

**Keyless mode** is a zero-configuration development experience that allows developers to start using Clerk without manually creating API keys. When a developer runs their app in development without configured keys, Clerk automatically:

1. Generates temporary API keys (publishable + secret)
2. Creates a temporary "accountless application"
3. Displays a banner with a "claim URL" to associate keys with their Clerk account
4. Stores keys locally so they persist across restarts

**Key benefits:**

- Instant start for new developers (no dashboard visit required)
- Reduces onboarding friction
- Keys can be claimed later and associated with production account

## Architecture Overview

### Core Shared Code (`@clerk/shared/keyless`)

**Location:** `packages/shared/src/keyless/`

**Key files:**

- `service.ts` - Core keyless service that communicates with backend
- `storage.ts` - Abstract storage interface for persisting keys
- `types.ts` - TypeScript types (AccountlessApplication, etc.)
- `messages.ts` - Console banner messages shown to developers

**Key function:**

```typescript
export function createKeylessService(options: KeylessServiceOptions): KeylessService {
  const { storage, api, framework, frameworkVersion } = options;

  return {
    async getOrCreateKeys(): Promise<AccountlessApplication | null> {
      // Check local storage first
      const existingKeys = storage.readKeys();
      if (existingKeys) return existingKeys;

      // Create headers with framework info
      const headers = new Headers();
      if (framework) {
        headers.set('Clerk-Framework', framework); // ← Sent to backend
      }

      // Call backend to create new accountless application
      const app = await api.createAccountlessApplication(headers);
      storage.writeKeys(app);
      return app;
    },
    // ... other methods
  };
}
```

### Backend (Go)

**Location:** `clerk_go/api/bapi/v1/accountless_applications/`

**Endpoints:**

- `POST /v1/accountless_applications` - Create new accountless app
- `POST /v1/accountless_applications/complete` - Mark onboarding complete

**Key feature: Framework-aware claim URLs**

```go
// Read framework from header
if framework := r.Header.Get("Clerk-Framework"); framework != "" {
    params.Framework = &framework
}

// Build claim URL with framework parameter
func buildClaimURL(token string, framework *string) (string, error) {
    query.Add("token", token)
    if framework != nil && *framework != "" {
        query.Add("framework", *framework) // ← Dashboard uses this
    }
    return link.String(), nil
}
```

**Why this matters:** Dashboard reads the `framework` query param and shows correct environment variable names for each SDK (e.g., `PUBLIC_CLERK_PUBLISHABLE_KEY` for Astro vs `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` for Next.js).

### Dashboard

**Location:** `apps/dashboard/app/(routes)/apps/claim/page.tsx`

**Already supports framework parameter:**

```typescript
const {
  token: claimToken,
  framework: frameworkId = 'nextjs', // ← Defaults to Next.js if not provided
} = await searchParams;

// Uses getKeyValueTemplate() to show framework-specific env vars
<CopyKeys framework={frameworkId} />
```

## Framework-Specific Implementations

Each framework has its own keyless wrapper due to different runtime environments, bundling requirements, and lifecycle hooks.

### 1. Next.js (Original Implementation)

**Location:** `packages/nextjs/src/server/keyless/`

**Characteristics:**

- Uses **conditional exports** (`#safe-node-apis`) for Node vs Edge runtime compatibility
- Storage: `createNodeFileStorage()` with `nodeFsOrThrow()`, `nodePathOrThrow()`
- Why: Server Actions bundle aggressively, need explicit runtime detection

**Key files:**

```
keyless/
  index.ts           # Keyless service singleton
  fileStorage.ts     # Node.js file storage with fs/path checks
  utils.ts           # resolveKeysWithKeylessFallback()
```

**Framework ID sent:** `'nextjs'`

### 2. TanStack Start (Introduced Shared Keyless)

**PR:** https://github.com/clerk/javascript/pull/7518

**Location:** `packages/tanstack-start/src/server/keyless/`

**Characteristics:**

- Uses **static imports** (works due to Vite tree-shaking)
- Storage: Direct import from `@clerk/shared/keyless/node`
- Simpler than Next.js since Vite handles dead code elimination better

**Framework ID sent:** `'tanstack-react-start'`

### 3. React Router

**PR:** https://github.com/clerk/javascript/pull/7794 (branch: `rob/react-router-keyless`)

**Location:** `packages/react-router/src/server/keyless/`

**Characteristics:**

- Uses **runtime checks** (`canUseFileSystem()`) for Cloudflare Workers support
- Storage: Conditional based on runtime environment
- Why: Must support both Node.js and Cloudflare Workers (no filesystem)

**Framework ID sent:** `'react-router'`

### 4. Astro (Current Implementation)

**Branch:** `rob/astro-keyless-mode`

**Location:** `packages/astro/src/server/keyless/`

**Characteristics:**

- Uses **dynamic imports** + `hasFileSystemSupport()` check
- Moved from compile-time (integration API) to runtime (middleware)
- Storage: `createNodeFileStorage()` imported dynamically

**Framework ID sent:** `'astro'` (changed from `'@clerk/astro'`)

**Major refactor completed:**

- **Before:** Keyless resolved once at server startup, injected via `vite.define`
- **After:** Keyless resolved per-request in middleware, injected via script tag
- **Benefit:** No browser caching issues, instant updates when switching modes

## Why Code Duplication Exists

### What's Shared

- Core keyless service logic (`createKeylessService`)
- Storage interfaces and Node.js implementation
- Type definitions
- Console messages

### What's Per-Framework

- **Keyless service wrapper** (`keyless()` function)
  - Different singleton patterns
  - Different runtime environment checks

- **File storage creation** (`createFileStorage()`)
  - Next.js: Conditional exports for Server Actions
  - React Router: Runtime checks for Cloudflare Workers
  - TanStack/Astro: Direct imports work fine

- **Key resolution** (`resolveKeysWithKeylessFallback()`)
  - Different integration points (middleware, API routes, etc.)
  - Different context objects
  - Framework-specific caching strategies

**Conclusion:** The duplication is intentional and correct. Each framework has unique runtime constraints that require custom handling.

## Common Patterns

### Pattern 1: Feature Flag Check

All frameworks check if keyless can be used:

```typescript
export const canUseKeyless =
  isDevelopmentEnvironment() && // Only in dev mode
  !KEYLESS_DISABLED && // Not explicitly disabled
  hasFileSystemSupport(); // Runtime has filesystem
```

### Pattern 2: Keyless Service Singleton

```typescript
let keylessInstance: KeylessService | null = null;

export async function keyless(): Promise<KeylessService> {
  if (!keylessInstance) {
    const storage = await createFileStorage();
    keylessInstance = createKeylessService({
      storage,
      api: clerkClient(),
      framework: 'framework-name', // ← Framework-specific
      frameworkVersion: PACKAGE_VERSION,
    });
  }
  return keylessInstance;
}
```

### Pattern 3: Key Resolution with Fallback

```typescript
export async function resolveKeysWithKeylessFallback(
  configuredPublishableKey: string | undefined,
  configuredSecretKey: string | undefined,
): Promise<KeylessResult> {
  // Early return if keyless not available
  if (!canUseKeyless) {
    return { publishableKey, secretKey, claimUrl, apiKeysUrl };
  }

  // Skip keyless if both keys configured
  if (publishableKey && secretKey) {
    return { publishableKey, secretKey, claimUrl, apiKeysUrl };
  }

  // Try keyless mode
  const keylessService = await keyless();
  const keylessApp = await keylessService.getOrCreateKeys();

  return {
    publishableKey: keylessApp.publishableKey,
    secretKey: keylessApp.secretKey,
    claimUrl: keylessApp.claimUrl,
    apiKeysUrl: keylessApp.apiKeysUrl,
  };
}
```

## Recent Improvements

### 1. Framework-Aware Claim URLs (Completed)

**Problem:** Dashboard always showed Next.js environment variable names, confusing for other frameworks.

**Solution:**

- SDKs send framework ID via `Clerk-Framework` header
- Backend appends to claim URL: `?token=xxx&framework=astro`
- Dashboard shows correct env vars for each framework

**Implementation:**

- Backend: Read header, append to claim URL
- All SDKs: Send correct framework ID (not package name)
- Tests: Added backend tests for framework parameter

### 2. Astro Runtime Resolution (Completed)

**Problem:** Compile-time injection via `vite.define` caused browser caching issues.

**Solution:**

- Moved keyless resolution from integration API to middleware
- Inject URLs via runtime script tag instead of `import.meta.env`
- Client reads from server-injected data

**Benefits:**

- No hard reload needed when switching keyless ↔ configured modes
- Matches patterns from TanStack Start and React Router
- Cleaner separation of concerns

## File Organization

```
packages/
├── shared/
│   └── src/
│       └── keyless/
│           ├── service.ts          # Core shared logic
│           ├── storage.ts          # Abstract storage interface
│           ├── node.ts             # Node.js file storage
│           ├── types.ts            # Shared types
│           └── messages.ts         # Console messages
│
├── nextjs/
│   └── src/
│       └── server/
│           └── keyless/
│               ├── index.ts        # Next.js wrapper
│               ├── fileStorage.ts  # Conditional exports
│               └── utils.ts        # Next.js key resolution
│
├── tanstack-start/
│   └── src/
│       └── server/
│           └── keyless/
│               ├── index.ts        # TanStack wrapper
│               └── utils.ts        # TanStack key resolution
│
├── react-router/
│   └── src/
│       └── server/
│           └── keyless/
│               ├── index.ts        # React Router wrapper
│               ├── fileStorage.ts  # Runtime checks
│               └── utils.ts        # React Router key resolution
│
└── astro/
    └── src/
        └── server/
            └── keyless/
                ├── index.ts        # Astro wrapper
                ├── fileStorage.ts  # Dynamic imports
                └── utils.ts        # Astro key resolution
```

## Testing Strategy

### Backend Tests

**Location:** `clerk_go/tests/bapi/accountless_application_test.go`

```go
func TestCreateAccountlessApplicationWithFrameworkHeader(t *testing.T) {
    // Test that Clerk-Framework header is appended to claim URL
}

func TestCreateAccountlessApplicationWithoutFrameworkHeader(t *testing.T) {
    // Test backward compatibility without header
}
```

### SDK Tests (Per Framework)

- Unit tests: Key resolution logic
- Integration tests: Keyless flow with/without configured keys
- E2E tests: Full dev flow with claim URL

## Development Workflow

### Testing Keyless Locally

1. **Fresh start (no keys):**

```bash
# Remove local storage
rm -rf .clerk/

# Remove env vars
rm .env.local  # or comment out CLERK_* vars

# Start dev server
npm run dev
```

Expected: Keyless banner appears with claim URL

2. **Switching to configured keys:**

```bash
# Add keys to .env.local
echo "PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx" >> .env.local
echo "CLERK_SECRET_KEY=sk_test_xxx" >> .env.local

# Refresh page (normal refresh, not hard reload)
```

Expected: Banner disappears immediately (no caching issues)

3. **Claiming keys:**

- Click claim URL in banner
- Dashboard shows framework-specific env vars
- Add claimed keys to `.env.local`
- Restart dev server
- See confirmation message

## Key Differences Between Frameworks

| Framework        | Resolution Timing        | Storage Method      | Runtime Checks           | Bundling Consideration |
| ---------------- | ------------------------ | ------------------- | ------------------------ | ---------------------- |
| **Next.js**      | Server startup           | Conditional exports | `nodeFsOrThrow()`        | Server Actions         |
| **TanStack**     | Server startup           | Static import       | None needed              | Vite tree-shaking      |
| **React Router** | Server startup           | Runtime conditional | `canUseFileSystem()`     | Cloudflare Workers     |
| **Astro**        | Per-request (middleware) | Dynamic import      | `hasFileSystemSupport()` | Vite + SSR adapters    |

## Environment Detection

All frameworks check for development mode via:

```typescript
// packages/shared/src/utils/runtimeEnvironment.ts
export const isDevelopmentEnvironment = (): boolean => {
  try {
    return process.env.NODE_ENV === 'development';
  } catch {}

  // TODO: add support for import.meta.env.DEV (Vite)
  return false;
};
```

**Note:** There's a TODO to support `import.meta.env.DEV` for Vite-based frameworks, but currently all frameworks use `process.env.NODE_ENV`.

## Current Status

### Completed

- Next.js keyless (original implementation)
- TanStack Start keyless (PR #7518)
- React Router keyless (PR #7794, branch: `rob/react-router-keyless`)
- Astro keyless (branch: `rob/astro-keyless-mode`)
- Framework-aware claim URLs (backend + all SDKs)

### In Progress

- Astro keyless PR needs to be created and merged

### Future Considerations

- Support `import.meta.env.DEV` for Vite frameworks
- Potentially support keyless in preview/staging environments
- Consider keyless for other frameworks (Vue, Svelte, etc.)

## Quick Reference: Framework IDs

| SDK Package             | Framework ID Sent      | Env Var Prefix |
| ----------------------- | ---------------------- | -------------- |
| `@clerk/nextjs`         | `nextjs`               | `NEXT_PUBLIC_` |
| `@clerk/tanstack-start` | `tanstack-react-start` | `VITE_`        |
| `@clerk/react-router`   | `react-router`         | `VITE_`        |
| `@clerk/astro`          | `astro`                | `PUBLIC_`      |

**Important:** SDKs should send framework IDs (not package names). Backend passes these directly to dashboard without mapping.

## Related Documentation

- Astro env vars: https://docs.astro.build/en/guides/environment-variables/
- Backend API spec: `clerk_go/api/bapi/v1/accountless_applications/`
