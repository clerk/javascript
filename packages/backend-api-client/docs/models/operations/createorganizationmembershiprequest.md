# CreateOrganizationMembershipRequest

## Example Usage

```typescript
import { CreateOrganizationMembershipRequest } from "@clerk/backend-api-client/models/operations";

let value: CreateOrganizationMembershipRequest = {
  organizationId: "<id>",
  requestBody: {
    userId: "<id>",
    role: "<value>",
  },
};
```

## Fields

| Field                                                                                                                    | Type                                                                                                                     | Required                                                                                                                 | Description                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `organizationId`                                                                                                         | *string*                                                                                                                 | :heavy_check_mark:                                                                                                       | The ID of the organization where the new membership will be created                                                      |
| `requestBody`                                                                                                            | [operations.CreateOrganizationMembershipRequestBody](../../models/operations/createorganizationmembershiprequestbody.md) | :heavy_check_mark:                                                                                                       | N/A                                                                                                                      |