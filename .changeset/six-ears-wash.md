---
'@clerk/backend': minor
---

**Optimize handshake payload delivery with nonce-based fetching**

This change introduces a significant optimization to the handshake flow by replacing direct payload delivery with a nonce-based approach to overcome browser cookie size limitations.

**Problem Solved:**
Previously, the handshake payload (an encoded JWT containing set-cookie headers) was sent directly in a cookie. Since browsers limit cookies to ~4KB, this severely restricted the practical size of session tokens, which are also JWTs stored in cookies but embedded within the handshake payload.

**Solution:**
We now use a conditional approach based on payload size:
- **Small payloads (≤2KB)**: Continue using the direct approach for optimal performance
- **Large payloads (>2KB)**: Use nonce-based fetching to avoid cookie size limits

For large payloads, we:
1. Generate a short nonce (ID) for each handshake instance
2. Send only the nonce in the `__clerk_handshake_nonce` cookie
3. Use the nonce to fetch the actual handshake payload via a dedicated BAPI endpoint

**New Handshake Flow (for payloads >2KB):**
1. User visits `example.com`
2. Trigger handshake → `307 /v1/client/handshake`
3. Handshake resolves → `307 ecxample.com` with `__clerk_handshake_nonce` cookie containing the nonce
4. Client makes `GET BAPI/v1/clients/handshake_payload?nonce=<nonce_value>` request
5. BAPI returns array of set-cookie header values
6. Headers are applied to the response

**Traditional Flow (for payloads ≤2KB):**
Continues to work as before with direct payload delivery in cookies for optimal performance.

**Trade-offs:**
- **Added**: One additional BAPI call per handshake (only for payloads >2KB)
- **Removed**: Cookie size restrictions that previously limited session token size

