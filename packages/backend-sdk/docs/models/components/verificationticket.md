# VerificationTicket

## Example Usage

```typescript
import { VerificationTicket } from "@clerk/backend-sdk/models/components";

let value: VerificationTicket = {
  status: "unverified",
  strategy: "ticket",
  attempts: 663078,
  expireAt: 263322,
};
```

## Fields

| Field                                                                                                                | Type                                                                                                                 | Required                                                                                                             | Description                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `status`                                                                                                             | [components.TicketVerificationSAMLAccountStatus](../../models/components/ticketverificationsamlaccountstatus.md)     | :heavy_check_mark:                                                                                                   | N/A                                                                                                                  |
| `strategy`                                                                                                           | [components.TicketVerificationSAMLAccountStrategy](../../models/components/ticketverificationsamlaccountstrategy.md) | :heavy_check_mark:                                                                                                   | N/A                                                                                                                  |
| `attempts`                                                                                                           | *number*                                                                                                             | :heavy_check_mark:                                                                                                   | N/A                                                                                                                  |
| `expireAt`                                                                                                           | *number*                                                                                                             | :heavy_check_mark:                                                                                                   | N/A                                                                                                                  |
| `verifiedAtClient`                                                                                                   | *string*                                                                                                             | :heavy_minus_sign:                                                                                                   | N/A                                                                                                                  |