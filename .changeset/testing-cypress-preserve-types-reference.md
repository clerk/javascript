---
'@clerk/testing': patch
---

Preserve the `/// <reference types="cypress" />` directive in the published `@clerk/testing/cypress` type declarations. TypeScript's declaration emit previously dropped it, so the shipped types relied on the global `Cypress` namespace without declaring the dependency and failed to type-check under `skipLibCheck: false`.
