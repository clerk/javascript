---
'@clerk/clerk-js': minor
---

Add support for feature or plan based authorization

### Plan
- `Clerk.session.checkAuthorization({ plan: "my-plan" })`

### Feature
- `Clerk.session.checkAuthorization({ feature: "my-feature" })`

### Scoped per user or per org
- `Clerk.session.checkAuthorization({ feature: "org:my-feature" })`
- `Clerk.session.checkAuthorization({ feature: "user:my-feature" })`
- `Clerk.session.checkAuthorization({ plan: "user:my-plan" })`
- `Clerk.session.checkAuthorization({ plan: "org:my-plan" })`
