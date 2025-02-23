---
'@clerk/shared': major
---
This new version introduces the following breaking changes:
- Introduced a new `retry` utility function to replace the deprecated `callWithRetry`.
- Removed the `callWithRetry` function and its associated tests.
- Renamed `runWithExponentialBackOff` to `retry` for consistency.

Migration steps:
- Replace any usage of `callWithRetry` with the new `retry` function.
- Update import statements from:
  ```typescript
  import { callWithRetry } from '@clerk/shared/callWithRetry';
  ```
  to:
  ```typescript
  import { retry } from '@clerk/shared/retry';
  ```
- Replace any usage of `runWithExponentialBackOff` with `retry`.
- Update import statements from:
  ```typescript
  import { runWithExponentialBackOff } from '@clerk/shared/utils';
  ```
  to:
  ```typescript
  import { retry } from '@clerk/shared/retry';
  ```
