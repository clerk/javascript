# FromOAuth

## Example Usage

```typescript
import { FromOAuth } from "@clerk/backend-sdk/models/components";

let value: FromOAuth = {
  status: "verified",
  strategy: "<value>",
  expireAt: 431418,
  attempts: 896547,
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