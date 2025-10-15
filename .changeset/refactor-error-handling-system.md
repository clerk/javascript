---
'@clerk/shared': minor
---

Internal refactor of error handling to improve type safety and error classification.

- Introduce new `ClerkError` base class for all Clerk errors
- Rename internal error files: `apiResponseError.ts` → `clerkApiResponseError.ts`, `runtimeError.ts` → `clerkRuntimeError.ts`
- Add `ClerkAPIError` class for individual API errors with improved type safety
- Add type guard utilities (`isClerkError`, `isClerkRuntimeError`, `isClerkApiResponseError`) for better error handling
- Deprecate `clerkRuntimeError` property in favor of `clerkError` for consistency
- Add support for error codes, long messages, and documentation URLs

