---
"@clerk/tanstack-start": patch
---

In the middlewareHandler, when calling router update, if an initial context was provided to the router it was being overwritten by the clerkInitialState. In this patch, the original context is being merged with the clerkInitialState as to not lose the context.  

