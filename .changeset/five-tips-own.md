---
'@clerk/vue': minor
---

Introduce feature or plan based authorization

## `useAuth()`
### Plan

```ts
const { has } = useAuth()
has.value({ plan: "my-plan" })
```

### Feature

```ts
const { has } = useAuth()
has.value({ feature: "my-feature" })
```

### Scoped per user or per org

```ts
const { has } = useAuth()

has.value({ feature: "org:my-feature" })
has.value({ feature: "user:my-feature" })
has.value({ plan: "user:my-plan" })
has.value({ plan: "org:my-plan" })
```

## `<Protect />`

### Plan

```html
<Protect plan="my-plan" />
```

### Feature

```html
<Protect feature="my-feature" />
```

### Scoped per user or per org

```html
<Protect feature="org:my-feature" />
<Protect feature="user:my-feature" />
<Protect plan="org:my-plan" />
<Protect plan="user:my-plan" />
```
