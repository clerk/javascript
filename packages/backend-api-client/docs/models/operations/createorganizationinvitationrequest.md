# CreateOrganizationInvitationRequest

## Example Usage

```typescript
import { CreateOrganizationInvitationRequest } from "@clerk/backend-api-client/models/operations";

let value: CreateOrganizationInvitationRequest = {
  organizationId: "<id>",
};
```

## Fields

| Field                                                                                                                    | Type                                                                                                                     | Required                                                                                                                 | Description                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `organizationId`                                                                                                         | *string*                                                                                                                 | :heavy_check_mark:                                                                                                       | The ID of the organization for which to send the invitation                                                              |
| `requestBody`                                                                                                            | [operations.CreateOrganizationInvitationRequestBody](../../models/operations/createorganizationinvitationrequestbody.md) | :heavy_minus_sign:                                                                                                       | N/A                                                                                                                      |