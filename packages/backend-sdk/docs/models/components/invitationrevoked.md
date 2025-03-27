# InvitationRevoked

Success

## Example Usage

```typescript
import { InvitationRevoked } from "@clerk/backend-sdk/models/components";

let value: InvitationRevoked = {
  object: "invitation",
  id: "<id>",
  emailAddress: "Vicenta.Barton@yahoo.com",
  publicMetadata: {
    "key": "<value>",
  },
  revoked: true,
  status: "revoked",
  createdAt: 681393,
  updatedAt: 277596,
};
```

## Fields

| Field                                                                                    | Type                                                                                     | Required                                                                                 | Description                                                                              | Example                                                                                  |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `object`                                                                                 | [components.InvitationRevokedObject](../../models/components/invitationrevokedobject.md) | :heavy_check_mark:                                                                       | N/A                                                                                      |                                                                                          |
| `id`                                                                                     | *string*                                                                                 | :heavy_check_mark:                                                                       | N/A                                                                                      |                                                                                          |
| `emailAddress`                                                                           | *string*                                                                                 | :heavy_check_mark:                                                                       | N/A                                                                                      |                                                                                          |
| `publicMetadata`                                                                         | Record<string, *any*>                                                                    | :heavy_check_mark:                                                                       | N/A                                                                                      |                                                                                          |
| `revoked`                                                                                | *boolean*                                                                                | :heavy_minus_sign:                                                                       | N/A                                                                                      | true                                                                                     |
| `status`                                                                                 | [components.InvitationRevokedStatus](../../models/components/invitationrevokedstatus.md) | :heavy_check_mark:                                                                       | N/A                                                                                      | revoked                                                                                  |
| `url`                                                                                    | *string*                                                                                 | :heavy_minus_sign:                                                                       | N/A                                                                                      |                                                                                          |
| `expiresAt`                                                                              | *number*                                                                                 | :heavy_minus_sign:                                                                       | Unix timestamp of expiration.<br/>                                                       |                                                                                          |
| `createdAt`                                                                              | *number*                                                                                 | :heavy_check_mark:                                                                       | Unix timestamp of creation.<br/>                                                         |                                                                                          |
| `updatedAt`                                                                              | *number*                                                                                 | :heavy_check_mark:                                                                       | Unix timestamp of last update.<br/>                                                      |                                                                                          |