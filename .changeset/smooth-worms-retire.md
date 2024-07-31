---
"@clerk/clerk-js": minor
"@clerk/clerk-react": minor
"@clerk/types": minor
---

Introduce support for custom menu items in `<UserButton/>`.

- Use `<UserButton.MenuItems>` as a child component to wrap custom menu items.
- Use `<UserButton.Link/>` for creating external or internal links.
- Use `<UserButton.Action/>` for opening a specific custom page of "UserProfile" or to trigger your own custom logic via `onClick`.
- If needed, reorder existing items like `manageAccount` and `signOut`

New usage example:

```jsx
<UserButton>
  <UserButton.MenuItems>
    <UserButton.Link label='Terms' labelIcon={<Icon />} href='/terms' />
    <UserButton.Action label='Help' labelIcon={<Icon />} open='help' /> // Navigate to `/help` page when UserProfile opens as a modal. (Requires a custom page to have been set in `/help`)
    <UserButton.Action label='manageAccount' labelIcon={<Icon />} />
    <UserButton.Action label='Chat Modal' labelIcon={<Icon />} onClick={() => setModal(true)} />
  </UserButton.MenuItems>
</UserButton>
```