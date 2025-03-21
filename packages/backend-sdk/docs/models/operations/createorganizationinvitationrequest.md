# CreateOrganizationInvitationRequest

## Example Usage

```typescript
import { CreateOrganizationInvitationRequest } from '@clerk/backend-sdk/models/operations';

let value: CreateOrganizationInvitationRequest = {
  organizationId: '<id>',
};
```

## Fields

| Field            | Type                                                                                                                     | Required           | Description                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------ | ----------------------------------------------------------- |
| `organizationId` | _string_                                                                                                                 | :heavy_check_mark: | The ID of the organization for which to send the invitation |
| `requestBody`    | [operations.CreateOrganizationInvitationRequestBody](../../models/operations/createorganizationinvitationrequestbody.md) | :heavy_minus_sign: | N/A                                                         |
