---
"@clerk/clerk-js": minor
"@clerk/backend": minor
"@clerk/shared": minor
"@clerk/clerk-react": minor
"@clerk/types": minor
---

Experimental support for `has()` with assurance.
Example usage:
```ts
has({ 
  __experimental_assurance: {
    level: 'L2.secondFactor',
    maxAge: 'A1.10min'
  }
})
```

Created a shared utility called `createCheckAuthorization` exported from `@clerk/shared`
