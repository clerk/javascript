# UsersGetOrganizationMembershipsRequest

## Example Usage

```typescript
import { UsersGetOrganizationMembershipsRequest } from '@clerk/backend-sdk/models/operations';

let value: UsersGetOrganizationMembershipsRequest = {
  userId: '<id>',
};
```

## Fields

| Field    | Type     | Required           | Description                                                                                                                                       |
| -------- | -------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `userId` | _string_ | :heavy_check_mark: | The ID of the user whose organization memberships we want to retrieve                                                                             |
| `limit`  | _number_ | :heavy_minus_sign: | Applies a limit to the number of results returned.<br/>Can be used for paginating the results together with `offset`.                             |
| `offset` | _number_ | :heavy_minus_sign: | Skip the first `offset` results when paginating.<br/>Needs to be an integer greater or equal to zero.<br/>To be used in conjunction with `limit`. |
