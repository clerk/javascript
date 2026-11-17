---
id: 2
title: 'Route by name, encode in the location, keep the codec representation-free'
summary: 'Code refers to routes by name and go() takes a name, never a URL. The location splits and decodes once per part and encodes once on write. The codec matches decoded literals against decoded parts and never sees a URL string.'
status: accepted
implementation: shipped
implementation_note: 'src/routing/routes.ts, src/routing/location.ts; virtual mode has no encoded form, so the encoding half is exercised only by the codec tests until a URL mode lands.'
date: 2026-11-06
authors:
  - 'Fredrik Höglund <fredrik@clerk.dev>'
tags: [architecture, security]
supersedes: null
superseded_by: null
---

## TL;DR

A route table maps names to patterns; views, controllers and machines use names; `go(name, params)` takes a name and the param types the pattern implies. Only `routes.ts` sees patterns. A pattern literal is written decoded, `api keys` not `api%20keys`; a percent-encoded literal throws when the pattern compiles. Nothing above a location calls `encodeURIComponent` or `decodeURIComponent` on anything from a URL, and nothing navigates to a value taken from a URL.

## Context

Double decoding has caused real vulnerabilities at Clerk. Legacy builds and parses URLs ad hoc across components. Names are also what lets the step/exit split from [MEDR-0001](./0001-embedded-segment-router.md) be enforced by a type rather than a convention.

Rejected: a codec that works on path strings and encodes or decodes itself. It would be one half of a double decode by construction. Rejected: a literal check that refuses anything `encodeURIComponent` would change; it rejected spaces and non-ASCII that match fine as decoded literals. The hazard is only a literal written in encoded form.

## Decision

The location owns encoding: split the raw segment, decode once per part, encode once per part on write, and read a malformed escape as no parts. The codec is representation-free: it matches decoded literals against decoded parts and captures params verbatim. `go` takes names; param types flow from the pattern to the name.

## Consequences

- Encoding cannot change which route matches, and a param is either fully decoded once or absent.
- A pattern's shape can change for legacy compatibility without touching callers.
- A framework adapter that only offers a decoded path collapses the encoded-slash distinction; that ambiguity is the host's, and Clerk never generates a value with a slash.
- Every location must carry a round-trip test for slashes, percent signs and non-ASCII.

## References

- `src/routing/routes.ts`, `src/routing/__tests__/routes.test.ts`
- The Security section of [Routing in Mosaic](../internals/routing.md)

## Changelog

- **2026-11-06**: Accepted.
