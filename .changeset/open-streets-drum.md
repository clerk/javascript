---
'@clerk/backend': minor
'@clerk/shared': minor
---

fix(backend): Correct WaitlistEntryAPI list return type and export WaitlistEntry

Fixes TypeScript return type for `WaitlistEntryAPI.list()` to properly reflect that it returns an array of `WaitlistEntry` objects within the paginated response, and exports the `WaitlistEntry` type from the backend package.

## Changes
- Fix `WaitlistEntryAPI.list()` return type from `PaginatedResourceResponse<WaitlistEntry>` to `PaginatedResourceResponse<WaitlistEntry[]>`
- Export `WaitlistEntry` type from `@clerk/backend` package index
