---
"@clerk/clerk-js": patch
"@clerk/shared": patch
---

Optimize all images displayed within the Clerk components, such as Avatars, static OAuth provider assets etc. All images are now resized and compressed. Additionally, all images are automatically converted into more efficient formats (`avif`, `webp`) if they are supported by the user's browser, otherwise all images fall back to `jpeg`.
