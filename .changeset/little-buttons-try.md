---
"@clerk/astro": patch
"@clerk/clerk-js": patch
"@clerk/clerk-react": patch
"@clerk/vue": patch
---

Allow reordering API Keys and Billing pages in `<UserProfile />` and `<OrganizationProfile />`

Example:

```tsx
export function CustomUserProfile() {
  return (
    <UserProfile>
      <UserProfile.Page label="apiKeys" />
      <UserProfile.Page label="billing" />
    </UserProfile>
  )
}
```
