# Foreground recovery during resource calls

Lifecycle and connectivity recovery waits for generated resource invocations to settle. This includes browser presentation and callback redemption within SSO. Previously, returning to the app could start a client reload, rotate its credential, and reject the still-pending callback response with `stale_client_request`.

The embedded owner counts active invocations and coalesces recovery requests until it is idle. Ordinary resource methods remain concurrent; there is no method-name catalog or Kotlin/Swift authentication policy. Cancellation can complete the caller before its underlying work settles, so it does not prematurely release recovery. A failed call also releases queued recovery. Background, offline, and disposed owners do not start the queued request; eligible owners perform it when activity/connectivity returns.

This does not disable existing response freshness checks or serialize caller requests against reloads that already began. Long-running resource calls postpone newly requested automatic recovery until their actual work settles. The attached Expo core continues to use its existing owner's lifecycle policy.

`test/foreground-auth.test.mjs` reproduces callback redemption failure against the previous bundle and verifies recovery after success, failure, caller cancellation, backgrounding, connectivity loss, and disposal. The native lifecycle suites exercise the same generated SSO call through packaged JavaScriptCore and QuickJS with fixture HTTP and native lifecycle notifications. These checks do not claim a live provider or a real Custom Tab/browser UI roundtrip.
