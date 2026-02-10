---
'@clerk/shared': major
'@clerk/react': patch
'@clerk/ui': patch
---

Remove `useUserContext`, `useOrganizationContext`, `useSessionContext` and `useClientContext` from the `shared/react` package.

These hooks have never been meant for public use and have been replaced with internal hooks that do not rely on context.

If you need access to these resources, use the `useUser`, `useOrganization` and `useSession` hooks instead.

If you are building a React SDK and need direct access to the `client`, get in touch with us to discuss!
