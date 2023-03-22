---
name: "\U0001F41B Issue Report"
about: Report an issue or regression in Clerk JavaScript packages.
title: ''
labels: 'Status: Triage'
---

<!-- Requirements: please go through this checklist before opening a new issue -->

- [ ] Review the documentation: https://docs.clerk.com/
- [ ] Search for existing issues: https://github.com/clerkinc/javascript/issues
- [ ] Go through package changelog files.
- [ ] Provide the Frontend API key from your application dashboard.

<!-- You can also find us on Discord https://discord.com/invite/b5rXHjAg7A -->

## Package + Version

- [ ] `@clerk/clerk-js`
- [ ] `@clerk/clerk-react`
- [ ] `@clerk/nextjs`
- [ ] `@clerk/remix`
- [ ] `@clerk/types`
- [ ] `@clerk/themes`
- [ ] `@clerk/localizations`
- [ ] `@clerk/clerk-expo`
- [ ] `@clerk/backend`
- [ ] `@clerk/clerk-sdk-node`
- [ ] `@clerk/shared`
- [ ] `@clerk/fastify`
- [ ] `@clerk/chrome-extension`
- [ ] `gatsby-plugin-clerk`
- [ ] `build/tooling/chore`
- [ ] other:

### Dependencies + versions

Provide a json with the dependencies used in your project (copy paste from yarn.lock / package-lock.json) or a github project / template that reproduces the issue.

**Include the @clerk/* packages and their versions!**

Example:

```json
{  
  "dependencies": {
    "react": "18.2.0"
  },
  "devDependencies": {
    "@clerk/types": "3.31.0",
    "@clerk/clerk-react": "4.13.0"
  },
  "peerDependencies": {
    "react": "18.2.0"
  }
}

```

### Browser/OS

If applicable e.g. `Chrome {version}`, `Node {version}` , `Bun {version}` , `Cloudflare worker {version}`

## Description

Describe your issue in detail, a demo repository or a sandbox would be great.
