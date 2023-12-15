---
'@clerk/backend': major
'@clerk/nextjs': major
'@clerk/types': major
---

Change return values of `signJwt`, `hasValidSignature`, `decodeJwt`, `verifyJwt`
to return `{ data, error }`. Example of keeping the same behavior using those utilities:
```typescript
import { signJwt, hasValidSignature, decodeJwt, verifyJwt } from '@clerk/backend/jwt';

const { data, error } = await signJwt(...)
if (error) throw error;

const { data, error } = await hasValidSignature(...)
if (error) throw error;

const { data, error } = decodeJwt(...)
if (error) throw error;

const { data, error } = await verifyJwt(...)
if (error) throw error;
```