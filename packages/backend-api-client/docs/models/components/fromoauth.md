# FromOAuth

## Example Usage

```typescript
import { FromOAuth } from "@clerk/backend-api-client/models/components";

let value: FromOAuth = {
  status: "unverified",
  strategy: "<value>",
  expireAt: 823614,
  attempts: 183326,
};
```

## Fields

| Field                                                                                            | Type                                                                                             | Required                                                                                         | Description                                                                                      |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `status`                                                                                         | [components.FromOAuthVerificationStatus](../../models/components/fromoauthverificationstatus.md) | :heavy_check_mark:                                                                               | N/A                                                                                              |
| `strategy`                                                                                       | *string*                                                                                         | :heavy_check_mark:                                                                               | N/A                                                                                              |
| `error`                                                                                          | *components.ErrorT*                                                                              | :heavy_minus_sign:                                                                               | N/A                                                                                              |
| `expireAt`                                                                                       | *number*                                                                                         | :heavy_check_mark:                                                                               | N/A                                                                                              |
| `attempts`                                                                                       | *number*                                                                                         | :heavy_check_mark:                                                                               | N/A                                                                                              |
| `verifiedAtClient`                                                                               | *string*                                                                                         | :heavy_minus_sign:                                                                               | N/A                                                                                              |