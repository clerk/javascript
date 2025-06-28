# DeleteOrganizationMembershipRequest

## Example Usage

```typescript
import { DeleteOrganizationMembershipRequest } from "@clerk/backend-api-client/models/operations";

let value: DeleteOrganizationMembershipRequest = {
  organizationId: "<id>",
  userId: "<id>",
};
```

## Fields

| Field                                                | Type                                                 | Required                                             | Description                                          |
| ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| `organizationId`                                     | *string*                                             | :heavy_check_mark:                                   | The ID of the organization the membership belongs to |
| `userId`                                             | *string*                                             | :heavy_check_mark:                                   | The ID of the user that this membership belongs to   |