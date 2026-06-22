---
"@clerk/ui": minor
---

Filter the organization switcher, organization list, and choose-organization task to show only the exclusive organization(s) when the user belongs to one. When an exclusive membership is present, the personal account/workspace, non-exclusive organizations, invitations, suggestions, and the create-organization action are hidden. Exclusivity is read from the existing organization-level `Organization.exclusiveMembership` flag, and the determination is made from the user's full membership set so it is not affected by membership pagination.
