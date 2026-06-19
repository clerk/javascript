---
'@clerk/clerk-js': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

When the `choose-organization` session task is triggered for a member of an organization that enforces exclusive membership, Clerk now automatically activates that organization instead of rendering the organization picker. The user sees a loading spinner while the organization is set as active; if activation fails, the regular picker is shown so they can recover. The generic force-choose-organization flow is unchanged for everyone else.

Additionally, `Organization.exclusiveMembership` is now exposed on the Organization resource, reflecting the `exclusive_membership` field returned by the Frontend API.
