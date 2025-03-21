# RevokeOrganizationInvitationRequest

## Example Usage

```typescript
import { RevokeOrganizationInvitationRequest } from '@clerk/backend-sdk/models/operations';

let value: RevokeOrganizationInvitationRequest = {
  organizationId: '<id>',
  invitationId: '<id>',
};
```

## Fields

| Field            | Type                                                                                                                     | Required           | Description                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------ | ------------------------------- |
| `organizationId` | _string_                                                                                                                 | :heavy_check_mark: | The organization ID.            |
| `invitationId`   | _string_                                                                                                                 | :heavy_check_mark: | The organization invitation ID. |
| `requestBody`    | [operations.RevokeOrganizationInvitationRequestBody](../../models/operations/revokeorganizationinvitationrequestbody.md) | :heavy_minus_sign: | N/A                             |
