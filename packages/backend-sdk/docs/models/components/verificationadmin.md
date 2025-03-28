# VerificationAdmin

## Example Usage

```typescript
import { VerificationAdmin } from "@clerk/backend-sdk/models/components";

let value: VerificationAdmin = {
  status: "verified",
  strategy: "admin",
  attempts: 793698,
  expireAt: 223924,
};
```

## Fields

| Field                                                                                                          | Type                                                                                                           | Required                                                                                                       | Description                                                                                                    |
| -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `status`                                                                                                       | [components.AdminVerificationPhoneNumberStatus](../../models/components/adminverificationphonenumberstatus.md) | :heavy_check_mark:                                                                                             | N/A                                                                                                            |
| `strategy`                                                                                                     | [components.AdminVerificationStrategy](../../models/components/adminverificationstrategy.md)                   | :heavy_check_mark:                                                                                             | N/A                                                                                                            |
| `attempts`                                                                                                     | *number*                                                                                                       | :heavy_check_mark:                                                                                             | N/A                                                                                                            |
| `expireAt`                                                                                                     | *number*                                                                                                       | :heavy_check_mark:                                                                                             | N/A                                                                                                            |
| `verifiedAtClient`                                                                                             | *string*                                                                                                       | :heavy_minus_sign:                                                                                             | N/A                                                                                                            |