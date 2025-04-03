# Saml

## Example Usage

```typescript
import { Saml } from "@clerk/backend-api-client/models/components";

let value: Saml = {
  status: "expired",
  strategy: "saml",
  externalVerificationRedirectUrl: "https://ideal-mortise.net/",
  expireAt: 628982,
  attempts: 872651,
};
```

## Fields

| Field                                                                                      | Type                                                                                       | Required                                                                                   | Description                                                                                |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `status`                                                                                   | [components.SAMLVerificationStatus](../../models/components/samlverificationstatus.md)     | :heavy_check_mark:                                                                         | N/A                                                                                        |
| `strategy`                                                                                 | [components.SAMLVerificationStrategy](../../models/components/samlverificationstrategy.md) | :heavy_check_mark:                                                                         | N/A                                                                                        |
| `externalVerificationRedirectUrl`                                                          | *string*                                                                                   | :heavy_check_mark:                                                                         | N/A                                                                                        |
| `error`                                                                                    | *components.SAMLVerificationError*                                                         | :heavy_minus_sign:                                                                         | N/A                                                                                        |
| `expireAt`                                                                                 | *number*                                                                                   | :heavy_check_mark:                                                                         | N/A                                                                                        |
| `attempts`                                                                                 | *number*                                                                                   | :heavy_check_mark:                                                                         | N/A                                                                                        |
| `verifiedAtClient`                                                                         | *string*                                                                                   | :heavy_minus_sign:                                                                         | N/A                                                                                        |