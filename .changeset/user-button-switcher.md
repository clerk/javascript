---
'@clerk/ui': minor
---

Add the `UserButton` Mosaic component: an account and organization switcher that combines multi-session account switching with organization selection, suggestions, and invitations behind a single popover. Exposes the all-in-one `UserButton` plus the composable `UserButtonRoot`, `UserButtonTrigger`, and `UserButtonPopup` parts. `mode` narrows what the surface carries: `combined` (the default) lists organizations and accounts together, `orgs` is an organization switcher with no account rows, and `user` is an account switcher that never shows an organization.

The workspace list covers the active account only: its organizations, and the suggestions and invitations it can accept. Organization requests are scoped to the session that makes them, so the other signed-in accounts are passed as `additionalSessions` (sessions alone, no organizations) and render under their own "Accounts" heading as rows you click to switch to. `onSelectOrganization` therefore acts on the active account and takes no session. Pass `paging` to feed further pages of organizations in as the list scrolls.

It owns no slots of its own: it is composed from `Popover`, `Card`, `Item`, `Avatar` and `Menu`, so `appearance.elements` overrides for those components theme it too.
