---
'@clerk/backend': patch
---

Fix `URIError: URI malformed` being thrown while parsing the `Cookie` header.

`ClerkRequest` decodes percent-escapes across the whole header rather than per value, so an invalid sequence in any cookie — including ones Clerk neither set nor reads, such as those written by analytics or third-party scripts — reached `decodeURIComponent` and threw. The decode runs from the constructor, so the error escaped `createClerkRequest` and failed the request before any auth logic ran. Because the offending value stays in the browser until it expires, every subsequent request from that client failed too.

Escape sequences that cannot be decoded are now left as their raw text, and the rest of the header parses as before.
