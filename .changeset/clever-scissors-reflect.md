---
'@clerk/chrome-extension': major
'@clerk/clerk-js': major
'@clerk/clerk-sdk-node': major
'@clerk/backend': major
'@clerk/clerk-react': major
'@clerk/clerk-expo': major
---

Drop default exports from all packages. Migration guide:
- use `import { Clerk } from '@clerk/backend';`
- use `import { clerkInstance } from '@clerk/clerk-sdk-node';`
- use `import { Clerk } from '@clerk/clerk-sdk-node';`
- use `import { Clerk } from '@clerk/clerk-js';`
- use `import { Clerk } from '@clerk/clerk-js/headless';`
- use `import { IsomorphicClerk } from '@clerk/clerk-react'`
