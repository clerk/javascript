---
'@clerk/backend': patch
---

Strip `experimental__has` from the auth object in `makeAuthObjectSerializable()`. This fixes an issue in Next.js where an error is being thrown when this function is passed to a client component as a prop.
