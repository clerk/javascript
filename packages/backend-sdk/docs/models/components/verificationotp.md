# VerificationOTP

## Example Usage

```typescript
import { VerificationOTP } from "@clerk/backend-sdk/models/components";

let value: VerificationOTP = {
  status: "failed",
  strategy: "phone_code",
  attempts: 164694,
  expireAt: 621479,
};
```

## Fields

| Field                                                                                    | Type                                                                                     | Required                                                                                 | Description                                                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `status`                                                                                 | [components.OTPVerificationStatus](../../models/components/otpverificationstatus.md)     | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `strategy`                                                                               | [components.OTPVerificationStrategy](../../models/components/otpverificationstrategy.md) | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `attempts`                                                                               | *number*                                                                                 | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `expireAt`                                                                               | *number*                                                                                 | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `verifiedAtClient`                                                                       | *string*                                                                                 | :heavy_minus_sign:                                                                       | N/A                                                                                      |