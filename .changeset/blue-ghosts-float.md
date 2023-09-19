---
'@clerk/shared': patch
---

Expose mutate for paginated lists of data in organization hooks.
`const {userMemberships:{mutate}} = useOrganizationList({userMemberships:true})`
