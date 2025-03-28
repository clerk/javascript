# Admin

## Example Usage

```typescript
import { Admin } from "@clerk/backend-sdk/models/components";

let value: Admin = {
  status: "verified",
  strategy: "admin",
  attempts: 367562,
  expireAt: 435865,
};
```

## Fields

| Field                                                                                    | Type                                                                                     | Required                                                                                 | Description                                                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `status`                                                                                 | [components.AdminVerificationStatus](../../models/components/adminverificationstatus.md) | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `strategy`                                                                               | [components.VerificationStrategy](../../models/components/verificationstrategy.md)       | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `attempts`                                                                               | *number*                                                                                 | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `expireAt`                                                                               | *number*                                                                                 | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `verifiedAtClient`                                                                       | *string*                                                                                 | :heavy_minus_sign:                                                                       | N/A                                                                                      |