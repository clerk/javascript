# UpdateOrganizationMembershipRequest

## Example Usage

```typescript
import { UpdateOrganizationMembershipRequest } from "@clerk/backend-api-client/models/operations";

let value: UpdateOrganizationMembershipRequest = {
  organizationId: "<id>",
  userId: "<id>",
  requestBody: {
    role: "<value>",
  },
};
```

## Fields

| Field                                                                                                                    | Type                                                                                                                     | Required                                                                                                                 | Description                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `organizationId`                                                                                                         | *string*                                                                                                                 | :heavy_check_mark:                                                                                                       | The ID of the organization the membership belongs to                                                                     |
| `userId`                                                                                                                 | *string*                                                                                                                 | :heavy_check_mark:                                                                                                       | The ID of the user that this membership belongs to                                                                       |
| `requestBody`                                                                                                            | [operations.UpdateOrganizationMembershipRequestBody](../../models/operations/updateorganizationmembershiprequestbody.md) | :heavy_check_mark:                                                                                                       | N/A                                                                                                                      |