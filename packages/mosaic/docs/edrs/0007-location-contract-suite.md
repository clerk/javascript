---
id: 7
title: 'Prove mode parity with one contract suite'
summary: 'One test file states what every location mode guarantees to the components above it, parameterised over modes and run in StrictMode. A new mode starts by passing it; inherent differences are declared by name.'
status: accepted
implementation: shipped
implementation_note: 'src/routing/__tests__/location-contract.test.tsx, with virtual as the only mode so far.'
date: 2026-11-06
authors:
  - 'Fredrik Höglund <fredrik@clerk.dev>'
tags: [testing]
supersedes: null
superseded_by: null
---

## TL;DR

Add a behaviour to the contract suite when it should hold in every mode. Add a mode to the suite before building anything else on it. Declare an inherent difference, such as the pathname holding one entry, in the mode's `excludes` so it is stated rather than discovered.

## Context

The virtual-mode gaps were found one at a time by reviewers tracing lifecycles, and each fix found the hole the previous one missed. Parity between modes cannot be guaranteed by reasoning case by case.

## Decision

The component-visible contract is a parameterised test suite, and it is the definition of parity.

## Consequences

- A divergence between modes is a failing test, not a review finding.
- The suite's "leave" step unmounts the owner, which is virtual's proxy for the host navigating away; a URL mode supplies its own leave action.
- The suite found two of the bugs it exists for: a park that also ran on navigation restored an entry cleared from outside, and a park not tied to its location carried a page to a new base. Both cases are in it now.
- The parked-and-resumed case needs React 19.2's `Activity` and is a todo until a React 19 test project exists.
- The profile feature tests stay where they are: they test the profiles, not the location.

## References

- `src/routing/__tests__/location-contract.test.tsx`
- [MEDR-0003](./0003-page-state-acts-like-a-url.md)

## Changelog

- **2026-11-06**: Accepted.
- **2026-11-06**: Amended after review: outside-clear, base-change and two-owner cases added.
