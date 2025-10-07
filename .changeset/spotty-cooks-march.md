---
"@clerk/tanstack-react-start": minor
---

Added support for [TanStack Start v1 RC](https://tanstack.com/blog/announcing-tanstack-start-v1)! Includes a new `clerkMiddleware()` global middleware replacing the custom server handler.

Usage:

1. Create a `src/start.ts` file and add `clerkMiddleware()` to the list of request middlewares:

```ts
// src/start.ts
import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { createStart } from '@tanstack/react-start'

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [clerkMiddleware()],
  }
})
```

2. Add `<ClerkProvider>` to your root route

```tsx
// src/routes/__root.tsx
import { ClerkProvider } from '@clerk/tanstack-react-start'

export const Route = createRootRoute({...})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html>
        <head>
          <HeadContent />
        </head>
        <body>
          {children}
          <Scripts />
        </body>
      </html>
    </ClerkProvider>
  )
}
```

The `getAuth()` helper can now be called within server routes and functions, without passing a Request object:

```ts
const authStateFn = createServerFn().handler(async () => {
  const { userId } = await getAuth()

  if (!userId) {
    throw redirect({
      to: '/sign-in',
    })
  }

  return { userId }
})

export const Route = createFileRoute('/')({
  component: Home,
  beforeLoad: async () => await authStateFn(),
  loader: async ({ context }) => {
    return { userId: context.userId }
  },
})
```