# Web3WalletVerificationAdmin

## Example Usage

```typescript
import { Web3WalletVerificationAdmin } from "@clerk/backend-sdk/models/components";

let value: Web3WalletVerificationAdmin = {
  status: "verified",
  strategy: "admin",
  attempts: 669917,
  expireAt: 785153,
};
```

## Fields

| Field                                                                                                            | Type                                                                                                             | Required                                                                                                         | Description                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `status`                                                                                                         | [components.AdminVerificationWeb3WalletStatus](../../models/components/adminverificationweb3walletstatus.md)     | :heavy_check_mark:                                                                                               | N/A                                                                                                              |
| `strategy`                                                                                                       | [components.AdminVerificationWeb3WalletStrategy](../../models/components/adminverificationweb3walletstrategy.md) | :heavy_check_mark:                                                                                               | N/A                                                                                                              |
| `attempts`                                                                                                       | *number*                                                                                                         | :heavy_check_mark:                                                                                               | N/A                                                                                                              |
| `expireAt`                                                                                                       | *number*                                                                                                         | :heavy_check_mark:                                                                                               | N/A                                                                                                              |
| `verifiedAtClient`                                                                                               | *string*                                                                                                         | :heavy_minus_sign:                                                                                               | N/A                                                                                                              |