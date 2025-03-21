# UpdateOrganizationMembershipRequest

## Example Usage

```typescript
import { UpdateOrganizationMembershipRequest } from '@clerk/backend-sdk/models/operations';

let value: UpdateOrganizationMembershipRequest = {
  organizationId: '<id>',
  userId: '<id>',
  requestBody: {
    role: '<value>',
  },
};
```

## Fields

| Field            | Type                                                                                                                     | Required           | Description                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------ | ---------------------------------------------------- |
| `organizationId` | _string_                                                                                                                 | :heavy_check_mark: | The ID of the organization the membership belongs to |
| `userId`         | _string_                                                                                                                 | :heavy_check_mark: | The ID of the user that this membership belongs to   |
| `requestBody`    | [operations.UpdateOrganizationMembershipRequestBody](../../models/operations/updateorganizationmembershiprequestbody.md) | :heavy_check_mark: | N/A                                                  |
