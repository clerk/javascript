---
'@clerk/backend': patch
'@clerk/nextjs': patch
'@clerk/shared': patch
'@clerk/clerk-react': patch
---

Update imports of `@clerk/shared` to granular entrypoints. This addresses warnings during a Next.js build that are the result of unsupported APIs being included in the module graph of builds for the edge runtime.
