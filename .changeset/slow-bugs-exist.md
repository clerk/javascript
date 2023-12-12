---
'@clerk/clerk-js': patch
'@clerk/shared': patch
'@clerk/clerk-react': patch
---

Add `useAssertWrappedByClerkProvider` to internal code. If you use hooks like `useAuth` outside of the `<ClerkProvider />` context an error will be thrown. For example:

```shell
@clerk/clerk-react: useAuth can only be used within the <ClerkProvider /> component
```
