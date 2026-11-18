---
'@clerk/expo-native-components': minor
---

Let `@clerk/expo` sign its Frontend API requests with the native SDK's device key. `setHostSignsRequests`, called before `configureNative`, binds the client to the device key, and the module exposes `createDpopProof` and `recordServerDate`. A JS bundle that does not opt in leaves the client unbound, as before.
