# Invitation

Success

## Example Usage

```typescript
import { Invitation } from "@clerk/backend-sdk/models/components";

let value: Invitation = {
  object: "invitation",
  id: "<id>",
  emailAddress: "Erika16@hotmail.com",
  publicMetadata: {
    "key": "<value>",
  },
  revoked: false,
  status: "pending",
  createdAt: 959167,
  updatedAt: 458139,
};
```

## Fields

| Field                                                                      | Type                                                                       | Required                                                                   | Description                                                                | Example                                                                    |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `object`                                                                   | [components.InvitationObject](../../models/components/invitationobject.md) | :heavy_check_mark:                                                         | N/A                                                                        |                                                                            |
| `id`                                                                       | *string*                                                                   | :heavy_check_mark:                                                         | N/A                                                                        |                                                                            |
| `emailAddress`                                                             | *string*                                                                   | :heavy_check_mark:                                                         | N/A                                                                        |                                                                            |
| `publicMetadata`                                                           | Record<string, *any*>                                                      | :heavy_check_mark:                                                         | N/A                                                                        |                                                                            |
| `revoked`                                                                  | *boolean*                                                                  | :heavy_minus_sign:                                                         | N/A                                                                        | false                                                                      |
| `status`                                                                   | [components.InvitationStatus](../../models/components/invitationstatus.md) | :heavy_check_mark:                                                         | N/A                                                                        | pending                                                                    |
| `url`                                                                      | *string*                                                                   | :heavy_minus_sign:                                                         | N/A                                                                        |                                                                            |
| `expiresAt`                                                                | *number*                                                                   | :heavy_minus_sign:                                                         | Unix timestamp of expiration.<br/>                                         |                                                                            |
| `createdAt`                                                                | *number*                                                                   | :heavy_check_mark:                                                         | Unix timestamp of creation.<br/>                                           |                                                                            |
| `updatedAt`                                                                | *number*                                                                   | :heavy_check_mark:                                                         | Unix timestamp of last update.<br/>                                        |                                                                            |