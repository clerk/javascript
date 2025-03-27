# WaitlistEntryInvitation

## Example Usage

```typescript
import { WaitlistEntryInvitation } from "@clerk/backend-sdk/models/components";

let value: WaitlistEntryInvitation = {
  object: "invitation",
  id: "<id>",
  emailAddress: "Alexa_Brekke@gmail.com",
  publicMetadata: {
    "key": "<value>",
  },
  revoked: false,
  status: "pending",
  createdAt: 959143,
  updatedAt: 103298,
};
```

## Fields

| Field                                                                                                | Type                                                                                                 | Required                                                                                             | Description                                                                                          | Example                                                                                              |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `object`                                                                                             | [components.WaitlistEntryInvitationObject](../../models/components/waitlistentryinvitationobject.md) | :heavy_check_mark:                                                                                   | N/A                                                                                                  |                                                                                                      |
| `id`                                                                                                 | *string*                                                                                             | :heavy_check_mark:                                                                                   | N/A                                                                                                  |                                                                                                      |
| `emailAddress`                                                                                       | *string*                                                                                             | :heavy_check_mark:                                                                                   | N/A                                                                                                  |                                                                                                      |
| `publicMetadata`                                                                                     | Record<string, *any*>                                                                                | :heavy_check_mark:                                                                                   | N/A                                                                                                  |                                                                                                      |
| `revoked`                                                                                            | *boolean*                                                                                            | :heavy_minus_sign:                                                                                   | N/A                                                                                                  | false                                                                                                |
| `status`                                                                                             | [components.WaitlistEntryInvitationStatus](../../models/components/waitlistentryinvitationstatus.md) | :heavy_check_mark:                                                                                   | N/A                                                                                                  | pending                                                                                              |
| `url`                                                                                                | *string*                                                                                             | :heavy_minus_sign:                                                                                   | N/A                                                                                                  |                                                                                                      |
| `expiresAt`                                                                                          | *number*                                                                                             | :heavy_minus_sign:                                                                                   | Unix timestamp of expiration.<br/>                                                                   |                                                                                                      |
| `createdAt`                                                                                          | *number*                                                                                             | :heavy_check_mark:                                                                                   | Unix timestamp of creation.<br/>                                                                     |                                                                                                      |
| `updatedAt`                                                                                          | *number*                                                                                             | :heavy_check_mark:                                                                                   | Unix timestamp of last update.<br/>                                                                  |                                                                                                      |