---
title: '`lastOrganizationInvitation` and `lastOrganizationMember` dropped from event emitter'
matcher: "(?:\\.lastOrganizationInvitation|\\.lastOrganizationMember)"
---

If you are using [`Clerk.addListener`](https://clerk.com/docs/references/javascript/clerk/clerk#add-listener) or `OrganizationContext` and utilizing either the `lastOrganizationInvitation` and/or `lastOrganizationMember` emitted events, these properties have been removed, as they were only relevant for internal use. We are not providing a way to backfill this functionality at the moment. If you are using it and this is an issue for you, please [reach out to Clerk support](https://clerk.com/support) and we can find a way to resolve the issue!
