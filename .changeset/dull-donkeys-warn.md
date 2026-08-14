---
'@clerk/nextjs': patch
---

Allow Clerk's abuse and fraud protection hosts on all ports in the generated `connect-src` directive. The `contentSecurityPolicy` option previously emitted `https://*.protect.clerk.com`, which matches port 443 only, so requests to those hosts on other ports were blocked by the resulting policy.
