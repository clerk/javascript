---
'@clerk/clerk-react': minor
---

Add support for feature or plan based authorization

## `useAuth()`
### Plan
- `useAuth().has({ plan: "my-plan" })`

### Feature
- `useAuth().has({ feature: "my-feature" })`

### Scoped per user or per org
- `useAuth().has({ feature: "org:my-feature" })`
- `useAuth().has({ feature: "user:my-feature" })`
- `useAuth().has({ plan: "user:my-plan" })`
- `useAuth().has({ plan: "org:my-plan" })`

## `<Protect />`

### Plan
- `<Protect plan="my-plan" />`

### Feature
- `<Protect feature="my-feature" />`

### Scoped per user or per org
- `<Protect feature="org:my-feature" />`
- `<Protect feature="user:my-feature" />`
- `<Protect plan="org:my-plan" />`
- `<Protect plan="user:my-plan" />`

