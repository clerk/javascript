---
'@clerk/expo': major
---

Attach native Clerk views to the existing Expo JavaScript owner through the generated resource transport. Remove the second native client, credential synchronization, and native-to-JavaScript session adoption. Biometric hooks now use the existing JavaScript resources and native OS capability adapters.

Requires matching 2.0 native SDK prereleases and a rebuilt development client. The iOS bridge uses Swift 6; Android requires a compatible Kotlin/Compose toolchain instead of suppressing metadata checks. Existing Expo hook return shapes and explicit session activation remain unchanged.
