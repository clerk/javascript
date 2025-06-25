---
'@clerk/astro': minor
---

Introduce feature or plan based authorization

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

## `useAuth()` in React

### Plan

```ts
const { has } = useAuth()
has({ plan: "my-plan" })
```

### Feature

```ts
const { has } = useAuth()
has({ feature: "my-feature" })
```

### Scoped per user or per org

```ts
const { has } = useAuth()

has({ feature: "org:my-feature" })
has({ feature: "user:my-feature" })
has({ plan: "user:my-plan" })
has({ plan: "org:my-plan" })
```