---
'@clerk/backend': patch
---

Fix the Typedoc generator inserting a spurious extra comma inside multi-`@example` values. The "Examples" replacement split the captured group on every space, which broke apart example values containing internal spaces (e.g. array literals like `["/orgs/:slug", "/orgs/:slug/(.*)"]`) and rejoined them with `, `, producing `,,`. It now joins the backtick-delimited examples directly. Generated-output-only change; no runtime behavior is affected.
