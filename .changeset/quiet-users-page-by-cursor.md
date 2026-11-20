---
'@clerk/backend': minor
---

Add `clerkClient.users.searchUsers()`, a faster way to list and filter users on large instances.

```ts
const { data, cursor } = await clerkClient.users.searchUsers({
  metadata: [{ scope: 'public', key: 'plan', match: 'equals', value: 'pro' }],
});

// Next page: the same filters, plus the cursor
if (cursor.startingAfter) {
  await clerkClient.users.searchUsers({
    metadata: [{ scope: 'public', key: 'plan', match: 'equals', value: 'pro' }],
    startingAfter: cursor.startingAfter,
  });
}
```

Compared with `getUserList()`:

- It pages with a cursor instead of an offset, so later pages are as fast as the first.
- It can also filter on public, private and unsafe metadata, on an external account's provider and provider user ID, and on banned or deprovisioned users.
- It returns no `totalCount`. Pass `remainingCount` to get a count of the users from the current page onward.
- Results can lag a recent change by a short time. Use `getUserList()` when you need to read a change right after making it.

`getUserList()` is unchanged.
