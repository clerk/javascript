---
'@clerk/nextjs': minor
---

Added Content Security Policy (CSP) header generation functionality to `clerkMiddleware` with support for both standard and strict-dynamic modes. Key features:

- Automatic generation of CSP headers with default security policies compatible with Clerk requirements
- Support for both standard and strict-dynamic CSP modes
- Automatic nonce generation for strict-dynamic mode
- Ability to add custom directives to match project requirements

Example

```
export default clerkMiddleware(
  async (auth, request) => {
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  },
  {
    debug: process.env.NODE_ENV !== "production",
    contentSecurityPolicy: {
      mode: "strict-dynamic",
      directives: {
        "connect-src": ["external.api.com"],
        "script-src": ["external.scripts.com"]
      }
    }
  }
);
```