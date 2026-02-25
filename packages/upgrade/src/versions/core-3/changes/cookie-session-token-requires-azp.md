---
title: 'Cookie-based session tokens now require an `azp` claim'
category: 'breaking'
---

Session tokens delivered via cookies are now validated to ensure they contain an `azp` (Authorized Party) claim. This claim identifies the origin that requested the token and is automatically set by Clerk when the browser sends an `Origin` header with its requests.

### What changed

Previously, cookie-based session tokens without an `azp` claim were accepted. Now, if `azp` is missing, the backend will attempt a handshake to obtain a fresh token with `azp`. If the handshake cannot be performed (e.g., non-document requests), the request will be treated as signed out.

### Who is affected

This change is transparent for most applications. The `azp` claim is automatically set by Clerk's backend when the browser includes an `Origin` header, which is the standard behavior for all modern browsers.

You may be affected if:

- You are manually constructing or forwarding session cookies without going through a standard browser flow
- You are using a custom proxy that strips the `Origin` header from requests to Clerk's Frontend API
