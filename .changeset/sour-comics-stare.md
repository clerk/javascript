---
'@clerk/backend': patch
'@clerk/shared': patch
---

Add clerkTraceId to ClerkBackendApiResponse and ClerkAPIResponseError to allow for better tracing and debugging API error responses. 
Uses `clerk_trace_id` when available in a response and defaults to [`cf-ray` identifier](https://developers.cloudflare.com/fundamentals/reference/cloudflare-ray-id/) if missing.  
