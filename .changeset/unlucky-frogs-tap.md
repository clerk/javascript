---
'@clerk/backend': major
'@clerk/nextjs': major
---

Replace return the value of the following jwt helpers to match the format of backend API client return values (for consistency).

```diff
import { signJwt } from '@clerk/backend/jwt';

- const { data, error } = await signJwt(...);
+ const { data, errors: [error] = [] } = await signJwt(...);
```

```diff
import { verifyJwt } from '@clerk/backend/jwt';

- const { data, error } = await verifyJwt(...);
+ const { data, errors: [error] = [] } = await verifyJwt(...);
```

```diff
import { hasValidSignature } from '@clerk/backend/jwt';

- const { data, error } = await hasValidSignature(...);
+ const { data, errors: [error] = [] } = await hasValidSignature(...);
```

```diff
import { decodeJwt } from '@clerk/backend/jwt';

- const { data, error } = await decodeJwt(...);
+ const { data, errors: [error] = [] } = await decodeJwt(...);
```

```diff
import { verifyToken } from '@clerk/backend';

- const { data, error } = await verifyToken(...);
+ const { data, errors: [error] = [] } = await verifyToken(...);
```
