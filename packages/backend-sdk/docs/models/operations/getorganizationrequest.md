# GetOrganizationRequest

## Example Usage

```typescript
import { GetOrganizationRequest } from '@clerk/backend-sdk/models/operations';

let value: GetOrganizationRequest = {
  organizationId: '<id>',
};
```

## Fields

| Field                                         | Type      | Required           | Description                                                                                                                    |
| --------------------------------------------- | --------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `organizationId`                              | _string_  | :heavy_check_mark: | The ID or slug of the organization                                                                                             |
| `includeMembersCount`                         | _boolean_ | :heavy_minus_sign: | Flag to denote whether or not the organization's members count should be included in the response.                             |
| `includeMissingMemberWithElevatedPermissions` | _boolean_ | :heavy_minus_sign: | Flag to denote whether or not to include a member with elevated permissions who is not currently a member of the organization. |
