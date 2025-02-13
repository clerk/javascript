---
'@clerk/nextjs': patch
---

Update `clerkMiddleware` request callback to accept an asynchronous function

```ts
export default clerkMiddleware(
  (auth, req) => {
    // Add your middleware checks
  },
  async (req) => {
    const options = await getOptions(req)
    return options;
  },
)
```
