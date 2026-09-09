# Native client response ordering

Two requests can complete out of order. A reproduced case started two generated
`Session.reload()` calls: the newer request reported a pending
`choose-organization` task, then the delayed earlier reply restored an active
session and overwrote the saved client credential. It reproduced in the embedded
VM and through both packaged native SDKs.

`installMobileCredentialTransport` now assigns request sequence numbers within
its existing owner/generation boundary. Before a response can persist a client
credential or return to FAPI resource hydration, it checks any client snapshot
carried as `response`, `client`, or `meta.client`:

- A newer request can update the client without treating `updated_at` alone as
  an ordering guarantee.
- An older/equal request sequence is rejected unless its server `Date` is newer,
  or the date ties and its client `updated_at` is newer.
- Accepted sequence and server-date watermarks do not move backwards.
- Missing/invalid dates cannot establish that an older request has newer state.
- Generation invalidation resets this bookkeeping and still rejects requests
  from the previous generation before persistence or hydration.

Acceptance is serialized with credential writes. A rejected reply produces
`stale_client_response`, preserves the currently accepted task and credential,
and leaves the current resource usable for another reload. These rules preserve
the old iOS client-response ordering policy in one shared TypeScript owner;
Swift and Kotlin do not compare timestamps or maintain request watermarks.

This boundary orders client snapshots, not unrelated resource-only payloads.
It does not prove live server clock/version behavior or replace server-side
authorization. Shared-session/watch replication is a different contract.

`client-response-order.test.mjs` exercises real embedded generated dispatch with
reversed HTTP completion, date/version precedence, both piggyback locations,
direct foreground client refresh, preserved tasks/credentials and recovery.
The shared transport test additionally proves that a newer request with an older
date does not lower the watermark used to evaluate a delayed reply. Both native
packaged suites reproduce and then verify the same public session outcome.

The common native fixture now includes the canonical client object tag, ID and
version fields. The earlier sparse JS unit fixture lacked these fields; it was
insufficient for testing metadata-based response reconciliation.
