---
'gatsby-plugin-clerk': minor
'@clerk/clerk-sdk-node': minor
'@clerk/backend': minor
'@clerk/fastify': minor
'@clerk/nextjs': minor
'@clerk/remix': minor
---

Introduce a new `RequestAdapter` interface that may be implemented by any framework that uses the `@clerk/backend` package. A custom `RequestAdapter` instance will be passed to `authenticateRequest` instead of each header/cookie/searchParams as a prop.

Example usage:

```ts
// CustomRequestAdapter.ts
// How we access the headers/cookies/searchParams depends on the specific framework's request representation
export class CustomRequestAdapter implements RequestAdapter {
  constructor(readonly req: CustomRequest) {}

  headers(key: string) {
    return this.req?.headers?.[key];
  }
  cookies(key: string) {
    return this.req?.cookies?.[key];
  }
  searchParams() {
    return new URL(this.req.url).searchParams;
  }
}
```

```ts
// FrameworkClerkMiddleware.ts
...
export const withClerkMiddleware = (options: ClerkCustomOptions) => {
  return async (req: CustomFrameworkRequest, ...) => {
    const requestState = await clerkClient.authenticateRequest({
      ...options,
      secretKey,
      publishableKey,
      requestAdapter: new CustomRequestAdapter(req),
    });
   ...
};
```
