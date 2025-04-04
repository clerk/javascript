# Admin

## Example Usage

```typescript
import { Admin } from "@clerk/backend-api-client/models/components";

let value: Admin = {
  status: "verified",
  strategy: "admin",
  attempts: 821142,
  expireAt: 416834,
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