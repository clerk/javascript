---
'@clerk/tailwindcss-transformer': patch
'@clerk/clerk-js': patch
'@clerk/elements': patch
'@clerk/clerk-sdk-node': patch
'@clerk/express': patch
'@clerk/ui': patch
---

The following are all internal changes and not relevant to any end-user:

- Upgrade Turborepo from v1 to v2.
- Integrate `turbo-ignore` to short-circuit E2E tests
- Add `E2E_PROJECT` to ensure that E2E tests are also cached/ignored based on the project flag.
