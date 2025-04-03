# Otp

## Example Usage

```typescript
import { Otp } from "@clerk/backend-api-client/models/components";

let value: Otp = {
  status: "failed",
  strategy: "phone_code",
  attempts: 919483,
  expireAt: 714242,
};
```

## Fields

| Field                                                                          | Type                                                                           | Required                                                                       | Description                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `status`                                                                       | [components.VerificationStatus](../../models/components/verificationstatus.md) | :heavy_check_mark:                                                             | N/A                                                                            |
| `strategy`                                                                     | [components.Strategy](../../models/components/strategy.md)                     | :heavy_check_mark:                                                             | N/A                                                                            |
| `attempts`                                                                     | *number*                                                                       | :heavy_check_mark:                                                             | N/A                                                                            |
| `expireAt`                                                                     | *number*                                                                       | :heavy_check_mark:                                                             | N/A                                                                            |
| `verifiedAtClient`                                                             | *string*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |