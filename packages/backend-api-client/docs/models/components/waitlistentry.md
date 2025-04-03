# WaitlistEntry

## Example Usage

```typescript
import { WaitlistEntry } from "@clerk/backend-api-client/models/components";

let value: WaitlistEntry = {
  object: "waitlist_entry",
  id: "<id>",
  emailAddress: "Judge51@yahoo.com",
  status: "pending",
  createdAt: 373216,
  updatedAt: 222864,
  invitation: {
    object: "invitation",
    id: "<id>",
    emailAddress: "Arvid.Bradtke6@gmail.com",
    publicMetadata: {
      "key": "<value>",
    },
    revoked: false,
    status: "pending",
    createdAt: 856277,
    updatedAt: 162120,
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