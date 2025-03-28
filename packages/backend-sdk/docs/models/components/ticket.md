# Ticket

## Example Usage

```typescript
import { Ticket } from "@clerk/backend-sdk/models/components";

let value: Ticket = {
  status: "verified",
  strategy: "ticket",
  attempts: 590873,
  expireAt: 574325,
};
```

## Fields

| Field                                                                                          | Type                                                                                           | Required                                                                                       | Description                                                                                    |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `status`                                                                                       | [components.TicketVerificationStatus](../../models/components/ticketverificationstatus.md)     | :heavy_check_mark:                                                                             | N/A                                                                                            |
| `strategy`                                                                                     | [components.TicketVerificationStrategy](../../models/components/ticketverificationstrategy.md) | :heavy_check_mark:                                                                             | N/A                                                                                            |
| `attempts`                                                                                     | *number*                                                                                       | :heavy_check_mark:                                                                             | N/A                                                                                            |
| `expireAt`                                                                                     | *number*                                                                                       | :heavy_check_mark:                                                                             | N/A                                                                                            |
| `verifiedAtClient`                                                                             | *string*                                                                                       | :heavy_minus_sign:                                                                             | N/A                                                                                            |