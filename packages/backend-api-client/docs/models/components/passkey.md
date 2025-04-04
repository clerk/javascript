# Passkey

## Example Usage

```typescript
import { Passkey } from "@clerk/backend-api-client/models/components";

let value: Passkey = {
  status: "verified",
  strategy: "passkey",
  attempts: 215068,
  expireAt: 78773,
};
```

## Fields

| Field                                                                                            | Type                                                                                             | Required                                                                                         | Description                                                                                      |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `status`                                                                                         | [components.PasskeyVerificationStatus](../../models/components/passkeyverificationstatus.md)     | :heavy_check_mark:                                                                               | N/A                                                                                              |
| `strategy`                                                                                       | [components.PasskeyVerificationStrategy](../../models/components/passkeyverificationstrategy.md) | :heavy_check_mark:                                                                               | N/A                                                                                              |
| `nonce`                                                                                          | [components.Nonce](../../models/components/nonce.md)                                             | :heavy_minus_sign:                                                                               | N/A                                                                                              |
| `message`                                                                                        | *string*                                                                                         | :heavy_minus_sign:                                                                               | N/A                                                                                              |
| `attempts`                                                                                       | *number*                                                                                         | :heavy_check_mark:                                                                               | N/A                                                                                              |
| `expireAt`                                                                                       | *number*                                                                                         | :heavy_check_mark:                                                                               | N/A                                                                                              |
| `verifiedAtClient`                                                                               | *string*                                                                                         | :heavy_minus_sign:                                                                               | N/A                                                                                              |