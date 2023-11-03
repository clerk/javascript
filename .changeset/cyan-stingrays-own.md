---
'@clerk/nextjs': major
---

Drop deprecations. Migration steps:
- use `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` instead of `NEXT_PUBLIC_CLERK_FRONTEND_API` env variable
- use `NEXT_PUBLIC_CLERK_JS_VERSION` instead of `CLERK_JS_VERSION`
- use `CLERK_SECRET_KEY` instead of `CLERK_API_KEY`
- use `publishableKey` instead of `frontendApi`
- use `isEmailLinkError` instead of `isMagicLinkError`
- use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
- use `useEmailLink` instead of `useMagicLink`
- use `@clerk/nextjs` instead of `@clerk/nextjs/app-beta`
- use `@clerk/nextjs` instead of `@clerk/nextjs/ssr`
- use `@clerk/nextjs` instead of `@clerk/nextjs/edge-middleware` or `@clerk/nextjs/edge-middlewarefiles`
- use `@clerk/nextjs` instead of `@clerk/nextjs/api`
- use middleware with `authMiddleware` instead of `withClerkMiddleware`
- avoid using exported constants: `API_URL`, `API_VERSION`, `CLERK_JS_URL`, `CLERK_JS_VERSION`, `DOMAIN`, `IS_SATELLITE`, `PROXY_URL`, `PUBLISHABLE_KEY`, `SECRET_KEY`, `SIGN_IN_URL`, `SIGN_UP_URL`