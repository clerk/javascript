# VerificationOTP

## Example Usage

```typescript
import { VerificationOTP } from "@clerk/backend-api-client/models/components";

let value: VerificationOTP = {
  status: "failed",
  strategy: "reset_password_email_code",
  attempts: 339327,
  expireAt: 426264,
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