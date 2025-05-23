# RevokeOrganizationInvitationRequestBody

## Example Usage

```typescript
import { RevokeOrganizationInvitationRequestBody } from "@clerk/backend-api-client/models/operations";

let value: RevokeOrganizationInvitationRequestBody = {};
```

## Fields

| Field                                                                                         | Type                                                                                          | Required                                                                                      | Description                                                                                   |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `requestingUserId`                                                                            | *string*                                                                                      | :heavy_minus_sign:                                                                            | The ID of the user that revokes the invitation.<br/>Must be an administrator in the organization. |