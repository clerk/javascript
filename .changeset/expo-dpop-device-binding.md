---
'@clerk/expo': minor
---

With `@clerk/expo-native-components` installed, every Frontend API request carries a DPoP proof from the native SDK's device key, so the client is bound to the device and a token copied off it is rejected once the instance enforces device binding. A token the server reports as bound to another key is dropped, and the next request creates a new client. Apps without native components, including Expo Go, stay unbound and keep working.
