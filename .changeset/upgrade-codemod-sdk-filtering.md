---
'@clerk/upgrade': minor
---

Add SDK filtering support for codemods and new codemod to move ClerkProvider inside body for Next.js 16 cache components support.

Codemods can now specify which SDKs they apply to:
```js
codemods: [
  'transform-all',  // runs for all SDKs
  { name: 'transform-nextjs-only', packages: ['nextjs'] },
]
```

The new `transform-clerk-provider-inside-body` codemod automatically transforms layouts from:
```tsx
<ClerkProvider>
  <html>
    <body>{children}</body>
  </html>
</ClerkProvider>
```

To:
```tsx
<html>
  <body>
    <ClerkProvider>{children}</ClerkProvider>
  </body>
</html>
```

This is required for Next.js 16 with `cacheComponents: true` to avoid "Uncached data was accessed outside of `<Suspense>`" errors.
