---
'@clerk/backend': minor
---

Add the experimental `clerk.policy.check()` method, which checks an agent's proposed operation against your instance's policy and returns the `AgentAction` recording what was decided. It never blocks and never throws on an API outcome: transport and validation failures arrive on an `errors` arm, and a policy outcome that needs a human arrives as `status: 'pending'` with an `approval.url` to send them to.

```ts
const { data, errors } = await clerkClient.policy.check({
  auth, // an authenticated `oauth_token` auth object
  actorId: 'https://acme.example.com/mcp',
  operation: 'api/v1/refund',
  parameters: { charge_id: 'ch_9x', refund_amount: 25000, currency: 'usd' },
})
```

Branch on `data.status`, never on `data.decision.effect` — an action that could not be routed to a reviewer is created `denied` while its decision still reads `require_approval`.

`actorId` is required on every call and is never derived from a credential: an inbound token's client id is ambiguous between the party that exchanged it and the party the human authorized, and only your application knows which topology it is in. Passing an `oauth_token` auth object does derive `subjectId` and `authorizedClientId`, which that token verifiably names; `api_key` and `m2m_token` callers pass `subjectId` themselves. There is no session arm — a session caller passes the party fields explicitly and omits `auth`.

Parameter keys are sent byte-for-byte. The spelling used in `check()` is the spelling your field-registry declaration and every policy leaf must use, and there is no server-side guard for a mismatch: `refundAmount` and `refund_amount` are different fields, and a leaf addressing the wrong one never matches and never errors.
