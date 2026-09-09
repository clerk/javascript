# Session verification in the native profile

Native callers use the generated `Session.startVerification`, `prepareFirstFactorVerification`, `attemptFirstFactorVerification`, `prepareSecondFactorVerification`, `attemptSecondFactorVerification`, and `verifyWithPasskey` methods. Each executes the existing TypeScript Session implementation and returns a generated observable SessionVerification resource. Its nested session, verification states, and supported-factor metadata are available when the call completes.

The embedded suite exercises all three requested levels; passkey, email, phone, and enterprise preparation; email, phone, and password first-factor attempts; phone second-factor preparation; and phone, TOTP, and backup-code second-factor attempts. It checks the actual HTTP method, path and form parameters, then reads the returned resource graph. Invalid-code failures retain structured HTTP/error details and allow retry. Session passkey tests run the source prepare/host/attempt sequence, preserve host cancellation, and verify that the challenge is absent from observable snapshots. These tests use deterministic host responses; they do not prove live OS credential presentation or service acceptance.

## Unsupported inherited reload

The source SessionVerification class inherits BaseResource.reload but defines no pathRoot. Before the profile correction, invoking the generated method on a resource with id `sv_fixture` produced a GET to `/v1sv_fixture`. That route is constructed by the unconfigured BaseResource path, not by a session verification endpoint. The published [Frontend API session operations](https://clerk.com/docs/reference/frontend-api/2026-05-12/description/using-the-try-it-console) list verification start, preparation and attempts.

The native profile explicitly excludes `SessionVerificationResource.reload` with a reason. It preserves SessionVerification as an observable resource through a checked resource-identity policy; excluding its last method must not silently turn it into a value object. A compiler fixture verifies that behavior and rejects stale policy targets. The Swift and Kotlin public API diffs remove only SessionVerification.reload. A protocol regression verifies the removed operation produces unknown_operation without HTTP.

Continue reverification using the owning Session methods. Do not substitute Session.reload for a verification attempt or invent an endpoint. Supporting a future canonical reload requires a real implementation and removal of this explicit exclusion.

## Previous native API differences

- The generated resource methods replace handwritten send/verify convenience methods.
- Enterprise preparation requires an explicit redirectUrl in the source contract. The old implicit configuration default is not part of this generated method.
- The source second-factor union supports phone code, TOTP and backup code. Passkeys use the source first-factor flow; the old native second-factor passkey parameter is not generated.
- Passkey credential data uses the supported typed/platform capability path, not an arbitrary pre-serialized string.

The native migration audits identify the exact legacy assertions covered and retain the remaining tests.
