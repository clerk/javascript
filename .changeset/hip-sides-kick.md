---
'@clerk/nextjs': minor
---

Add support for feature or plan based authorization


## `await auth()`
### Plan
- `(await auth()).has({ plan: "my-plan" })`

### Feature
- `(await auth()).has({ feature: "my-feature" })`

### Scoped per user or per org
- `(await auth()).has({ feature: "org:my-feature" })`
- `(await auth()).has({ feature: "user:my-feature" })`
- `(await auth()).has({ plan: "user:my-plan" })`
- `(await auth()).has({ plan: "org:my-plan" })`

## `auth.protect()`
### Plan
- `auth.protect({ plan: "my-plan" })`

### Feature
- `auth.protect({ feature: "my-feature" })`

### Scoped per user or per org
- `auth.protect({ feature: "org:my-feature" })`
- `auth.protect({ feature: "user:my-feature" })`
- `auth.protect({ plan: "user:my-plan" })`
- `auth.protect({ plan: "org:my-plan" })`


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
