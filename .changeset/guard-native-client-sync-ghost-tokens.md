---
'@clerk/expo': patch
---

Fix signed-in sessions being dropped shortly after browser SSO on Android when the native SDK refreshes with a stale device token and receives a new anonymous client. The native-to-JS client sync now rejects a device token that belongs to a different client with no signed-in sessions, keeps the JS session active, and re-syncs the native SDK back to the JS client. Native client events that carry a stale device token are also ignored while a JS-to-native token sync is still in flight.
