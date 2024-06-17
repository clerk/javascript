---
title: '`clerkClient.__unstable_options` removed'
matcher: "\\.__unstable_options"
---

The `clerkClient.__unstable_options` property was removed. Previously, you could use it to update the internal options. Instead, create a new ` clerkClient` instance using `createClerkClient` and pass the options in this way. For example:

```diff
  import { createClerkClient } from "@clerk/backend"

  const clerkClient = createClerkClient({ secretKey: "old" })

- clerkClient.__unstable_options.secretKey = "new"
+ const newClerkClient = createClerkClient({ secretKey: "new" })
```
