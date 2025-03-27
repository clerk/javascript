# WaitlistEntry

## Example Usage

```typescript
import { WaitlistEntry } from "@clerk/backend-sdk/models/components";

let value: WaitlistEntry = {
  object: "waitlist_entry",
  id: "<id>",
  emailAddress: "Donavon34@gmail.com",
  status: "pending",
  createdAt: 639187,
  updatedAt: 399161,
  invitation: {
    object: "invitation",
    id: "<id>",
    emailAddress: "Leta_Schuster@yahoo.com",
    publicMetadata: {
      "key": "<value>",
    },
    revoked: false,
    status: "pending",
    createdAt: 110477,
    updatedAt: 405036,
  },
};
```

## Fields

| Field                                                                                                                                   | Type                                                                                                                                    | Required                                                                                                                                | Description                                                                                                                             | Example                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `object`                                                                                                                                | [components.WaitlistEntryObject](../../models/components/waitlistentryobject.md)                                                        | :heavy_check_mark:                                                                                                                      | N/A                                                                                                                                     |                                                                                                                                         |
| `id`                                                                                                                                    | *string*                                                                                                                                | :heavy_check_mark:                                                                                                                      | N/A                                                                                                                                     |                                                                                                                                         |
| `emailAddress`                                                                                                                          | *string*                                                                                                                                | :heavy_check_mark:                                                                                                                      | N/A                                                                                                                                     |                                                                                                                                         |
| `status`                                                                                                                                | [components.WaitlistEntryStatus](../../models/components/waitlistentrystatus.md)                                                        | :heavy_check_mark:                                                                                                                      | N/A                                                                                                                                     | pending                                                                                                                                 |
| `isLocked`                                                                                                                              | *boolean*                                                                                                                               | :heavy_minus_sign:                                                                                                                      | Indicates if the waitlist entry is locked. Locked entries are being processed in a batch action and are unavailable for other actions.<br/> |                                                                                                                                         |
| `createdAt`                                                                                                                             | *number*                                                                                                                                | :heavy_check_mark:                                                                                                                      | Unix timestamp of creation.<br/>                                                                                                        |                                                                                                                                         |
| `updatedAt`                                                                                                                             | *number*                                                                                                                                | :heavy_check_mark:                                                                                                                      | Unix timestamp of last update.<br/>                                                                                                     |                                                                                                                                         |
| `invitation`                                                                                                                            | [components.WaitlistEntryInvitation](../../models/components/waitlistentryinvitation.md)                                                | :heavy_minus_sign:                                                                                                                      | N/A                                                                                                                                     |                                                                                                                                         |