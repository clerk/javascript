---
'@clerk/shared': patch
---

Exclude self-identified server runtimes (`Cloudflare-Workers`, `Node.js`, `Deno`, `Bun` user agents) from the worker-scope `navigator` fallback used by `isValidBrowser`, `isBrowserOnline`, and `isValidBrowserOnline`. Today Cloudflare's workerd is excluded only because its `self` does not satisfy `instanceof WorkerGlobalScope`; this guard keeps the checks returning `false` on server-side worker runtimes even if that implementation detail changes, while real browser web/service workers (such as MV3 extension background workers) are unaffected.
