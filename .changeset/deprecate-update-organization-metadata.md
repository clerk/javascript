---
'@clerk/backend': minor
---

Add `clerkClient.organizations.replaceOrganizationMetadata(organizationId, params)` for replacing an organization's metadata fields in full.

Use `replaceOrganizationMetadata` when the provided metadata should become the complete value for that metadata field:

```ts
await clerkClient.organizations.replaceOrganizationMetadata(organizationId, {
  publicMetadata: { plan: 'pro' },
});
```

Use `clerkClient.organizations.updateOrganizationMetadata(organizationId, params)` when you want to partially update metadata with deep-merge semantics:

```ts
await clerkClient.organizations.updateOrganizationMetadata(organizationId, {
  publicMetadata: { onboardingComplete: true },
});
```

The `publicMetadata` and `privateMetadata` parameters on `clerkClient.organizations.updateOrganization()` are now deprecated. They continue to work, but new code should use `updateOrganizationMetadata()` for partial updates or `replaceOrganizationMetadata()` for full replacement.
