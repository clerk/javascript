# GoogleOneTap

## Example Usage

```typescript
import { GoogleOneTap } from "@clerk/backend-sdk/models/components";

let value: GoogleOneTap = {
  status: "unverified",
  strategy: "google_one_tap",
  expireAt: 240829,
  attempts: 100294,
};
```

## Fields

| Field                                                                                                      | Type                                                                                                       | Required                                                                                                   | Description                                                                                                |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `status`                                                                                                   | [components.GoogleOneTapVerificationStatus](../../models/components/googleonetapverificationstatus.md)     | :heavy_check_mark:                                                                                         | N/A                                                                                                        |
| `strategy`                                                                                                 | [components.GoogleOneTapVerificationStrategy](../../models/components/googleonetapverificationstrategy.md) | :heavy_check_mark:                                                                                         | N/A                                                                                                        |
| `expireAt`                                                                                                 | *number*                                                                                                   | :heavy_check_mark:                                                                                         | N/A                                                                                                        |
| `attempts`                                                                                                 | *number*                                                                                                   | :heavy_check_mark:                                                                                         | N/A                                                                                                        |
| `verifiedAtClient`                                                                                         | *string*                                                                                                   | :heavy_minus_sign:                                                                                         | N/A                                                                                                        |
| `error`                                                                                                    | *components.GoogleOneTapVerificationError*                                                                 | :heavy_minus_sign:                                                                                         | N/A                                                                                                        |