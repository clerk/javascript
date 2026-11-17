---
'@clerk/backend': minor
---

Add cursor pagination to `clerkClient.users.getUserList()`. Pass `pagination: 'cursor'` to get `{ data, cursor }` in place of `{ data, totalCount }`, and pass `cursor.startingAfter` back as `startingAfter` to get the next page. Paging by cursor works with every `orderBy` and does not slow down on later pages.

In this mode, `getUserList()` also accepts `metadata`, to filter users on their public, private or unsafe metadata, and `remainingCount`, to get a count of the users from the current page onward in the `cursor`.

```ts
const { data, cursor } = await clerkClient.users.getUserList({
  pagination: 'cursor',
  metadata: [{ scope: 'public', key: 'plan', match: 'equals', value: 'pro' }],
  remainingCount: 1000,
});
```
