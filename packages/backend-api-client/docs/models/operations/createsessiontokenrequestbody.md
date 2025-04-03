# CreateSessionTokenRequestBody

## Example Usage

```typescript
import { CreateSessionTokenRequestBody } from "@clerk/backend-api-client/models/operations";

let value: CreateSessionTokenRequestBody = {};
```

## Fields

| Field                                                              | Type                                                               | Required                                                           | Description                                                        |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `expiresInSeconds`                                                 | *number*                                                           | :heavy_minus_sign:                                                 | Use this parameter to override the default session token lifetime. |