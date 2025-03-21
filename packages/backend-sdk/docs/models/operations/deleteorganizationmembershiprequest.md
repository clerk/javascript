# DeleteOrganizationMembershipRequest

## Example Usage

```typescript
import { DeleteOrganizationMembershipRequest } from '@clerk/backend-sdk/models/operations';

let value: DeleteOrganizationMembershipRequest = {
  organizationId: '<id>',
  userId: '<id>',
};
```

## Fields

| Field            | Type     | Required           | Description                                          |
| ---------------- | -------- | ------------------ | ---------------------------------------------------- |
| `organizationId` | _string_ | :heavy_check_mark: | The ID of the organization the membership belongs to |
| `userId`         | _string_ | :heavy_check_mark: | The ID of the user that this membership belongs to   |
