---
title: '`[User|OrganizationMembershipPublicData].profileImageUrl` -> `[User|OrganizationMembershipPublicData].imageUrl`'
matcher: "\\.profileImageUrl"
replaceWithString: '.imageUrl'
---

The `profileImageUrl` property of any [`User` object](https://clerk.com/docs/references/javascript/user/user#user) or [`OrganizationMembershipPublicData` object](https://github.com/clerk/javascript/blob/37f36e538d8879981f76f4a433066e057afb06de/packages/backend/src/api/resources/OrganizationMembership.ts#L31) has been changed to `imageUrl`.
