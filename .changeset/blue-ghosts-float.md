---
'@clerk/shared': minor
---

Expose `revalidate` and `setData` for paginated lists of data in organization hooks.
`const {userMemberships:{revalidate, setData}} = useOrganizationList({userMemberships:true})`
