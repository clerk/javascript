# Oauth

## Example Usage

```typescript
import { Oauth } from "@clerk/backend-api-client/models/components";

let value: Oauth = {
  status: "expired",
  strategy: "<value>",
  expireAt: 810532,
  attempts: 763401,
};
```

## Fields

| Field                                                                                    | Type                                                                                     | Required                                                                                 | Description                                                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `status`                                                                                 | [components.OauthVerificationStatus](../../models/components/oauthverificationstatus.md) | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `strategy`                                                                               | *string*                                                                                 | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `externalVerificationRedirectUrl`                                                        | *string*                                                                                 | :heavy_minus_sign:                                                                       | N/A                                                                                      |
| `error`                                                                                  | *components.VerificationError*                                                           | :heavy_minus_sign:                                                                       | N/A                                                                                      |
| `expireAt`                                                                               | *number*                                                                                 | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `attempts`                                                                               | *number*                                                                                 | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `verifiedAtClient`                                                                       | *string*                                                                                 | :heavy_minus_sign:                                                                       | N/A                                                                                      |