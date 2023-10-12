---
"@clerk/shared": patch
---

Internal updates and improvements, with the only public change that npm should no longer complain about missing `react` peerDependency.

Updates:
- Remove `@clerk/shared/testUtils` export (which was only used for internal usage)
- Add `peerDependenciesMeta` to make `react` peerDep optional
