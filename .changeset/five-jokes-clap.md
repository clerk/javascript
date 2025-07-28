---
"@clerk/backend": patch
---

Adds scoping and secret key retrieval to machines BAPI methods:

```ts
// Creates a new machine scope
clerkClient.machines.createScope('machine_id', 'to_machine'id)

// Deletes a machine scope
clerkClient.machines.deleteScope('machine_id', 'other_machine'id)

// Retrieve a secret key
clerkClient.machines.getSecretKey('machine_id')
```
